"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Plus,
  ImagePlus,
  Upload,
  X,
  Check,
  LoaderCircle,
  TriangleAlert,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  FileImage,
  ShieldCheck,
  HardDrive,
  Layers,
  CircleCheck,
  Ban,
} from "lucide-react";
import {
  DEFAULT_SETTINGS,
  LIMITS,
  type Capabilities,
  type FileStatus,
  type ImageInfo,
  type Result,
  type Settings,
} from "@/lib/config";
import { en, errorText } from "@/lib/i18n";
import { detectCapabilities } from "@/lib/capabilities";
import { runJob, abortCheck } from "@/lib/processor";
import { validateBatch, validateFileSize } from "@/lib/validation";
import { calculateGeometry } from "@/lib/dimensions";
import { formatBytes, savings, targetBytes } from "@/lib/numbers";
import { createZip, downloadBlob } from "@/lib/download";
import { uniqueFilename } from "@/lib/filenames";
import { cn } from "@/lib/utils";
import { Header, Footer, PrivacyNote } from "./header";
import { SettingsPanel } from "./settings-panel";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Dialog,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
} from "./ui/primitives";

type Item = {
  id: string;
  file: File;
  info: ImageInfo;
  originalUrl: string;
  thumbnailUrl: string;
  status: FileStatus;
  result?: Result;
  resultUrl?: string;
  resultSettings?: string;
  override?: Settings;
  error?: string;
  attempts: number;
};
type Notice = { id: string; name: string; message: string };
function release(item: Item) {
  URL.revokeObjectURL(item.originalUrl);
  URL.revokeObjectURL(item.thumbnailUrl);
  if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
}
const signature = (s: Settings) => JSON.stringify(s);
const format = (mime: string) =>
  mime === "image/jpeg" ? "JPG" : mime === "image/png" ? "PNG" : "WebP";
function settingsError(s: Settings) {
  try {
    if (s.mode === "target") targetBytes(s.target, s.targetUnit);
    return "";
  } catch (error) {
    return errorText(error);
  }
}

export function ImageTool({
  initial = "compress",
  target,
}: {
  initial?: "compress" | "resize";
  target?: number;
}) {
  const [items, setItems] = useState<Item[]>([]),
    itemsRef = useRef<Item[]>([]);
  const [settings, setSettings] = useState<Settings>(() => ({
    ...structuredClone(DEFAULT_SETTINGS),
    ...(target
      ? {
          mode: "target" as const,
          target: target === 1_000_000 ? "1" : String(target / 1000),
          targetUnit: target === 1_000_000 ? ("MB" as const) : ("KB" as const),
        }
      : {}),
    resize: { ...DEFAULT_SETTINGS.resize, enabled: initial === "resize" },
  }));
  const settingsRef = useRef(settings),
    mounted = useRef(true);
  const [capabilities, setCapabilities] = useState<Capabilities>();
  const [notices, setNotices] = useState<Notice[]>([]),
    [announcement, setAnnouncement] = useState("");
  const [checking, setChecking] = useState(false),
    [busy, setBusy] = useState(false),
    [zipBusy, setZipBusy] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    finished: 0,
  });
  const [dragging, setDragging] = useState(false),
    dragDepth = useRef(0);
  const [previewId, setPreviewId] = useState<string>(),
    [previewTab, setPreviewTab] = useState("result");
  const [overrideId, setOverrideId] = useState<string>(),
    [overrideDraft, setOverrideDraft] = useState<Settings>(settings);
  const input = useRef<HTMLInputElement>(null),
    active = useRef<AbortController | null>(null),
    importing = useRef<AbortController | null>(null),
    queued = useRef(false);
  const updateItems = (fn: (current: Item[]) => Item[]) => {
    const next = fn(itemsRef.current);
    itemsRef.current = next;
    if (mounted.current) setItems(next);
  };
  useEffect(() => {
    mounted.current = true;
    detectCapabilities()
      .then((value) => {
        if (mounted.current) setCapabilities(value);
      })
      .catch(() => {});
    const frame = requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(
          localStorage.getItem("pixelpress-preferences") ?? "{}",
        );
        const next = { ...settingsRef.current };
        if (
          typeof stored.quality === "number" &&
          stored.quality >= 0.05 &&
          stored.quality <= 1
        )
          next.quality = stored.quality;
        if (
          typeof stored.background === "string" &&
          /^#[0-9a-f]{6}$/i.test(stored.background)
        )
          next.background = stored.background;
        settingsRef.current = next;
        setSettings(next);
      } catch {
        /* Preferences are optional when browser storage is unavailable. */
      }
    });
    return () => {
      mounted.current = false;
      cancelAnimationFrame(frame);
      active.current?.abort();
      importing.current?.abort();
      itemsRef.current.forEach(release);
    };
  }, []);
  const cancel = () => {
    active.current?.abort();
  };
  const changeSettings = (next: Settings) => {
    cancel();
    settingsRef.current = next;
    setSettings(next);
    try {
      localStorage.setItem(
        "pixelpress-preferences",
        JSON.stringify({ quality: next.quality, background: next.background }),
      );
    } catch {
      /* Preferences are optional when browser storage is unavailable. */
    }
  };
  const addFiles = async (files: File[]) => {
    if (importing.current || !files.length) return;
    const controller = new AbortController();
    importing.current = controller;
    setChecking(true);
    setAnnouncement(en.validatingAnnouncement);
    let added = 0;
    for (const file of files) {
      if (controller.signal.aborted) break;
      try {
        validateFileSize(file.size);
        validateBatch(
          itemsRef.current.length,
          itemsRef.current.reduce((sum, item) => sum + item.file.size, 0),
          file.size,
        );
        const info = await runJob("inspect", file, controller.signal);
        abortCheck(controller.signal);
        const item: Item = {
          id: crypto.randomUUID(),
          file,
          info,
          originalUrl: URL.createObjectURL(file),
          thumbnailUrl: URL.createObjectURL(info.thumbnail),
          status: "ready",
          attempts: 0,
        };
        updateItems((current) => [...current, item]);
        added++;
      } catch (error) {
        if (controller.signal.aborted) break;
        setNotices((current) => [
          ...current.slice(-19),
          {
            id: crypto.randomUUID(),
            name: file.name,
            message: errorText(error),
          },
        ]);
      }
    }
    importing.current = null;
    if (mounted.current) {
      setChecking(false);
      setAnnouncement(en.uploadedAnnouncement(added));
    }
  };
  const remove = (id: string) => {
    cancel();
    updateItems((current) =>
      current.filter((item) => {
        if (item.id !== id) return true;
        release(item);
        return false;
      }),
    );
  };
  const clear = () => {
    cancel();
    importing.current?.abort();
    updateItems((current) => {
      current.forEach(release);
      return [];
    });
    setNotices([]);
  };
  const effective = (item: Item) => item.override ?? settings;
  const outdated = (item: Item) =>
    !!item.result && item.resultSettings !== signature(effective(item));
  const fresh = items.filter(
    (item) => item.result && !outdated(item) && item.status === "completed",
  );
  const totals = fresh.reduce(
    (sum, item) => ({
      original: sum.original + item.file.size,
      output: sum.output + item.result!.blob.size,
    }),
    { original: 0, output: 0 },
  );
  const totalSavings = savings(totals.original, totals.output);
  const invalidSettings = settingsError(settings);
  const run = async (ids?: string[]) => {
    if (queued.current || checking) return;
    const queue = itemsRef.current.filter(
      (item) => !ids || ids.includes(item.id),
    );
    if (!queue.length) return;
    queued.current = true;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setBatchProgress({ current: 1, total: queue.length, finished: 0 });
    updateItems((current) =>
      current.map((item) =>
        queue.some((q) => q.id === item.id)
          ? { ...item, status: "ready", error: undefined, attempts: 0 }
          : item,
      ),
    );
    let completed = 0;
    try {
      for (let index = 0; index < queue.length; index++) {
        abortCheck(controller.signal);
        const item = queue[index];
        const chosen = structuredClone(item.override ?? settingsRef.current),
          key = signature(chosen);
        updateItems((current) =>
          current.map((i) =>
            i.id === item.id ? { ...i, status: "processing" } : i,
          ),
        );
        setBatchProgress({
          current: index + 1,
          total: queue.length,
          finished: index,
        });
        try {
          const result = await runJob(
            "process",
            item.file,
            controller.signal,
            chosen,
            (attempts) => {
              if (!controller.signal.aborted)
                updateItems((current) =>
                  current.map((i) =>
                    i.id === item.id ? { ...i, attempts } : i,
                  ),
                );
            },
          );
          abortCheck(controller.signal);
          updateItems((current) =>
            current.map((i) => {
              if (i.id !== item.id) return i;
              if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
              return {
                ...i,
                status: "completed",
                result,
                resultUrl: URL.createObjectURL(result.blob),
                resultSettings: key,
                attempts: result.attempts,
                error: undefined,
              };
            }),
          );
          completed++;
        } catch (error) {
          if (controller.signal.aborted) throw error;
          updateItems((current) =>
            current.map((i) =>
              i.id === item.id
                ? { ...i, status: "failed", error: errorText(error) }
                : i,
            ),
          );
        }
        setBatchProgress({
          current: index + 1,
          total: queue.length,
          finished: index + 1,
        });
      }
      setAnnouncement(en.completedAnnouncement(completed));
    } catch {
      updateItems((current) =>
        current.map((i) =>
          queue.some((q) => q.id === i.id) &&
          (i.status === "ready" || i.status === "processing")
            ? { ...i, status: "cancelled" }
            : i,
        ),
      );
      if (mounted.current) setAnnouncement(en.cancelledAnnouncement);
    } finally {
      active.current = null;
      queued.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const filenameMap = () => {
    const used = new Set<string>();
    return new Map(
      itemsRef.current
        .filter((item) => item.result)
        .map((item) => [
          item.id,
          uniqueFilename(item.file.name, item.result!.mime, used),
        ]),
    );
  };
  const downloadOne = (item: Item) => {
    if (item.result && !outdated(item))
      downloadBlob(item.result.blob, filenameMap().get(item.id)!);
  };
  const downloadAll = async () => {
    setZipBusy(true);
    try {
      const names = filenameMap();
      const zip = await createZip(
        fresh.map((item) => ({
          name: names.get(item.id)!,
          blob: item.result!.blob,
        })),
      );
      downloadBlob(zip, "pixelpress-images.zip");
    } catch {
      setNotices((current) => [
        ...current,
        { id: crypto.randomUUID(), name: "ZIP", message: en.errors.zipFailed },
      ]);
    } finally {
      if (mounted.current) setZipBusy(false);
    }
  };
  const preview = items.find((item) => item.id === previewId),
    overrideItem = items.find((item) => item.id === overrideId);
  const pngOnly =
    settings.format === "image/png" ||
    (settings.format === "original" &&
      items.length > 0 &&
      items.every((item) => item.info.mime === "image/png"));
  const bg = settings.format === "image/jpeg";
  const planned = (item: Item) => {
    try {
      const g = calculateGeometry(
        item.info.width,
        item.info.height,
        effective(item).resize,
      );
      return `${g.width.toLocaleString("en-US")} × ${g.height.toLocaleString("en-US")}`;
    } catch (error) {
      return errorText(error);
    }
  };

  return (
    <>
      <Header
        active={settings.resize.enabled ? "resize" : "compress"}
        onNavigate={(tab) =>
          changeSettings({
            ...settings,
            resize: { ...settings.resize, enabled: tab === "resize" },
          })
        }
      />
      <main className="tool-main">
        <div className="page-intro">
          <div className="eyebrow">
            <span />
            {initial === "resize" ? en.resize : en.compress}
            {target ? ` / ${formatBytes(target)}` : " / " + en.resize}
          </div>
          <h1 id="tool-heading" tabIndex={-1}>
            {initial === "resize" ? en.resizeHeading : en.heading}
          </h1>
          <p>{initial === "resize" ? en.resizeSubtitle : en.subtitle}</p>
        </div>
        <div className="workspace">
          <div className="images-column">
            <div className="images-toolbar">
              <div>
                <h2>{en.yourImages}</h2>
                <Badge className="count-badge">
                  {String(items.length).padStart(2, "0")}
                </Badge>
              </div>
              <div>
                {items.length > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={clear}>
                      {en.clear}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => input.current?.click()}
                      disabled={checking || busy}
                    >
                      <Plus size={14} />
                      {en.add}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              className="sr-only"
              aria-label={en.uploadLabel}
              data-testid="file-input"
              onChange={(e) => {
                void addFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            <div
              className={cn(
                "dropzone",
                items.length > 0 && "dropzone-compact",
                dragging && "dragging",
              )}
              onDragEnter={(e) => {
                e.preventDefault();
                dragDepth.current++;
                setDragging(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => {
                e.preventDefault();
                if (--dragDepth.current <= 0) {
                  dragDepth.current = 0;
                  setDragging(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                dragDepth.current = 0;
                setDragging(false);
                if (!busy) void addFiles(Array.from(e.dataTransfer.files));
              }}
            >
              {items.length === 0 ? (
                <>
                  <div className="upload-illustration" aria-hidden="true">
                    <span className="upload-back-sheet" />
                    <span className="upload-front-sheet">
                      <ImagePlus size={30} strokeWidth={1.5} />
                      <span className="upload-plus">
                        <Plus size={13} />
                      </span>
                    </span>
                  </div>
                  <h2>{dragging ? en.dropMore : en.uploadTitle}</h2>
                  <p>{en.uploadSubtitle}</p>
                  <Button
                    onClick={() => input.current?.click()}
                    disabled={checking || busy}
                    className="choose-button"
                  >
                    {checking ? (
                      <LoaderCircle size={17} className="spin" />
                    ) : (
                      <Plus size={17} />
                    )}
                    {checking ? en.checking : en.browse}
                  </Button>
                  <span className="drop-or">{en.uploadOr}</span>
                  <div className="upload-formats">
                    <span>JPG</span>
                    <span>PNG</span>
                    <span>WebP</span>
                    <span className="format-divider" />
                    <span>{en.limitSummary}</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={17} />
                  <span>{checking ? en.checking : en.dropMore}</span>
                  <button
                    onClick={() => input.current?.click()}
                    disabled={checking || busy}
                  >
                    {en.browse}
                    <Plus size={14} />
                  </button>
                </>
              )}
            </div>
            <div className="limit-line">
              <span>{en.allLimits}</span>
              <Tooltip text={en.localDetail}>
                <span tabIndex={0} aria-label={en.localDetail}>
                  <ShieldCheck size={14} />
                </span>
              </Tooltip>
            </div>
            {notices.length > 0 && (
              <div className="notices" role="alert">
                {notices.map((notice) => (
                  <div key={notice.id} className="notice">
                    <TriangleAlert size={17} />
                    <div>
                      <strong>{notice.name}</strong>
                      <p>{notice.message}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={en.dismiss}
                      onClick={() =>
                        setNotices((current) =>
                          current.filter((n) => n.id !== notice.id),
                        )
                      }
                    >
                      <X size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {items.length > 0 && (
              <div className="image-list">
                {items.map((item) => {
                  const stale = outdated(item),
                    result = item.result,
                    saved = result
                      ? savings(item.file.size, result.blob.size)
                      : undefined;
                  return (
                    <Card
                      key={item.id}
                      className="image-card"
                      data-testid="image-card"
                    >
                      <div className="image-row">
                        <button
                          className="thumbnail checkerboard"
                          aria-label={`${en.preview} ${item.file.name}`}
                          onClick={() => {
                            setPreviewId(item.id);
                            setPreviewTab(item.result ? "result" : "original");
                          }}
                        >
                          <img src={item.thumbnailUrl} alt="" />
                          <span>
                            <Eye size={16} />
                          </span>
                        </button>
                        <div className="image-info">
                          <div className="filename-line">
                            <h3 title={item.file.name}>{item.file.name}</h3>
                            <span className="file-format">
                              {format(item.info.mime)}
                            </span>
                          </div>
                          <div className="source-meta">
                            <span>
                              {item.info.width.toLocaleString("en-US")} ×{" "}
                              {item.info.height.toLocaleString("en-US")}
                            </span>
                            <span>·</span>
                            <span>{formatBytes(item.file.size)}</span>
                          </div>
                          <div className="image-status">
                            <Badge
                              className={cn(
                                "status-badge",
                                `status-${item.status}`,
                              )}
                            >
                              {item.status === "processing" ? (
                                <LoaderCircle size={11} className="spin" />
                              ) : item.status === "completed" ? (
                                <Check size={11} />
                              ) : item.status === "failed" ? (
                                <TriangleAlert size={11} />
                              ) : item.status === "cancelled" ? (
                                <Ban size={11} />
                              ) : (
                                <span className="status-dot" />
                              )}
                              {en.statuses[item.status]}
                            </Badge>
                            {stale && (
                              <Badge className="stale-badge">
                                <RotateCcw size={10} />
                                {en.outdated}
                              </Badge>
                            )}
                            {item.override && (
                              <span className="override-tag">
                                <SlidersHorizontal size={10} />
                                {en.usingOverrides}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="row-actions">
                          <Tooltip text={en.overrides}>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`${en.overrides} ${item.file.name}`}
                              onClick={() => {
                                setOverrideDraft(
                                  structuredClone(effective(item)),
                                );
                                setOverrideId(item.id);
                              }}
                            >
                              <SlidersHorizontal size={15} />
                            </Button>
                          </Tooltip>
                          <Tooltip text={en.remove}>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`${en.remove} ${item.file.name}`}
                              onClick={() => remove(item.id)}
                            >
                              <X size={16} />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                      {item.status === "processing" && (
                        <p className="processing-detail">
                          <LoaderCircle size={12} className="spin" />
                          {en.candidateCount(item.attempts)}
                        </p>
                      )}
                      {item.error && (
                        <div className="file-error">
                          <TriangleAlert size={14} />
                          <p>{item.error}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void run([item.id])}
                            disabled={busy}
                          >
                            {en.retry}
                          </Button>
                        </div>
                      )}
                      {result ? (
                        <div className="result-area">
                          <div className="result-details">
                            <div>
                              <span className="mini-label">{en.output}</span>
                              <div
                                className="output-size"
                                title={en.bytesExact(result.blob.size)}
                              >
                                {formatBytes(result.blob.size)}
                                <span>
                                  {format(result.mime)} · {result.width} ×{" "}
                                  {result.height}
                                </span>
                              </div>
                            </div>
                            <div
                              className={cn(
                                "savings-label",
                                saved!.bytes < 0 && "larger",
                              )}
                            >
                              <span>
                                {saved!.bytes > 0 ? (
                                  <>
                                    <ArrowDownToLine size={13} />
                                    {en.saving(saved!.percent.toFixed(1))}
                                  </>
                                ) : saved!.bytes < 0 ? (
                                  en.larger
                                ) : (
                                  en.noSavings
                                )}
                              </span>
                              {result.targetReached !== undefined && (
                                <span
                                  className={cn(
                                    "target-status",
                                    !result.targetReached && "target-missed",
                                  )}
                                >
                                  {result.targetReached ? (
                                    <CircleCheck size={12} />
                                  ) : (
                                    <TriangleAlert size={12} />
                                  )}
                                  {result.targetReached
                                    ? en.targetReached
                                    : en.targetMissed}
                                </span>
                              )}
                            </div>
                          </div>
                          {result.keptOriginal && (
                            <p className="result-note">{en.originalKept}</p>
                          )}
                          {result.targetReached === false && (
                            <p className="result-note">
                              {en.targetAlternatives}
                            </p>
                          )}
                          {stale && (
                            <p className="stale-note">
                              <RotateCcw size={12} />
                              {en.outdatedHint}
                            </p>
                          )}
                          <div className="result-actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPreviewId(item.id);
                                setPreviewTab("result");
                              }}
                            >
                              <Eye size={14} />
                              {en.beforeAfter}
                            </Button>
                            <span />
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              aria-label={`${en.reprocess} ${item.file.name}`}
                              onClick={() => void run([item.id])}
                            >
                              <RotateCcw size={13} />
                              {en.reprocess}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={stale || item.status !== "completed"}
                              aria-label={`${en.download} ${item.file.name}`}
                              onClick={() => downloadOne(item)}
                            >
                              <ArrowDownToLine size={14} />
                              {en.download}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="planned-output">
                          <span>{en.estimated}</span>
                          <span>
                            {planned(item)}
                            {effective(item).mode === "target" &&
                            effective(item).allowSmaller ? (
                              <small> · {en.adjusted}</small>
                            ) : (
                              ""
                            )}
                          </span>
                          {item.status === "cancelled" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => void run([item.id])}
                            >
                              {en.retry}
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
            {busy && (
              <div className="batch-progress">
                <div>
                  <span>
                    {en.processingCount(
                      batchProgress.current,
                      batchProgress.total,
                    )}
                  </span>
                  <Button variant="ghost" size="sm" onClick={cancel}>
                    <X size={14} />
                    {en.cancelBatch}
                  </Button>
                </div>
                <Progress
                  value={
                    batchProgress.total
                      ? (batchProgress.finished / batchProgress.total) * 100
                      : 0
                  }
                  label={en.processing}
                />
              </div>
            )}
            {fresh.length > 0 && (
              <Card className="batch-summary">
                <div className="summary-heading">
                  <span className="summary-icon">
                    <Check size={20} />
                  </span>
                  <div>
                    <h3>{en.resultCount(fresh.length)}</h3>
                    <p>
                      {formatBytes(totals.original)}
                      <ArrowRight size={12} />
                      {formatBytes(totals.output)}
                      {totalSavings.bytes > 0 && (
                        <span>
                          {formatBytes(totalSavings.bytes)}{" "}
                          {en.saved.toLowerCase()}
                        </span>
                      )}
                      {totalSavings.bytes < 0 && <span>{en.larger}</span>}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => void downloadAll()}
                  disabled={zipBusy || busy}
                >
                  <ArrowDownToLine size={16} />
                  {zipBusy ? en.zipBusy : en.downloadAll}
                  <span className="zip-label">ZIP</span>
                </Button>
              </Card>
            )}
            <PrivacyNote />
            {items.length === 0 && (
              <div className="little-benefits">
                <div>
                  <Layers size={17} />
                  <span>
                    {en.imageCount(LIMITS.files)} {"/ "}
                    {en.formats}
                  </span>
                </div>
                <div>
                  <HardDrive size={17} />
                  <span>{en.localShort}</span>
                </div>
              </div>
            )}
          </div>
          <aside className="settings-column">
            <Card className="settings-card">
              <SettingsPanel
                value={settings}
                onChange={changeSettings}
                capabilities={capabilities}
                pngOnly={pngOnly}
                showBackground={bg}
              />
              <div className="process-area">
                {invalidSettings && (
                  <p className="validation-error" role="alert">
                    {invalidSettings}
                  </p>
                )}
                <Button
                  className="process-button"
                  onClick={() => void run()}
                  disabled={
                    !items.length || checking || busy || !!invalidSettings
                  }
                >
                  {busy ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <FileImage size={16} />
                  )}
                  {busy ? en.processing : en.process}
                  {!busy && <ArrowRight size={16} />}
                </Button>
                <p>
                  {busy
                    ? en.processingCount(
                        batchProgress.current,
                        batchProgress.total,
                      )
                    : items.length
                      ? `${en.imageCount(items.length)} · ${formatBytes(items.reduce((sum, item) => sum + item.file.size, 0))}`
                      : en.batchEmpty}
                </p>
              </div>
            </Card>
            {!capabilities && (
              <p className="capabilities-note">{en.capabilityChecking}</p>
            )}
            {capabilities &&
              Object.values(capabilities.encode).some((v) => !v) && (
                <p className="capabilities-note">{en.capabilityUnsupported}</p>
              )}
          </aside>
        </div>
        <section className="how-it-works">
          <div className="section-eyebrow">{en.tipsTitle}</div>
          <div className="steps">
            {en.tips.map((tip, i) => (
              <div key={tip.title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="shortcut-links">
          <span>{en.shortcuts}</span>
          {["100kb", "200kb", "500kb", "1mb"].map((size, i) => (
            <Link href={`/compress-image-to-${size}/`} key={size}>
              {["100 KB", "200 KB", "500 KB", "1 MB"][i]}
              <ArrowUpRightIcon />
            </Link>
          ))}
        </div>
        <section className="faq-section">
          <h2>{en.faqTitle}</h2>
          <Accordion items={[...en.faqs]} />
        </section>
        <div className="sr-only" aria-live="polite" role="status">
          {announcement}
        </div>
      </main>
      <Footer />
      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreviewId(undefined);
        }}
        title={preview?.file.name ?? en.beforeAfter}
        description={en.beforeAfterDescription}
        wide
      >
        {preview && (
          <div className="preview-dialog">
            <Tabs value={previewTab} onValueChange={setPreviewTab}>
              <TabsList aria-label={en.beforeAfter}>
                <TabsTrigger value="original">{en.original}</TabsTrigger>
                <TabsTrigger value="result" disabled={!preview.result}>
                  {en.result}
                </TabsTrigger>
              </TabsList>
              <TabsContent value={previewTab}>
                <div className="preview-canvas checkerboard">
                  <img
                    src={
                      previewTab === "result" && preview.resultUrl
                        ? preview.resultUrl
                        : preview.originalUrl
                    }
                    alt={`${previewTab === "result" ? en.result : en.original}: ${preview.file.name}`}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className="preview-meta">
              {previewTab === "result" && preview.result ? (
                <>
                  <strong>{formatBytes(preview.result.blob.size)}</strong>
                  <span>
                    {preview.result.width} × {preview.result.height}
                  </span>
                  <span>{format(preview.result.mime)}</span>
                  <span>{en.bytesExact(preview.result.blob.size)}</span>
                  {outdated(preview) && <Badge>{en.outdated}</Badge>}
                </>
              ) : (
                <>
                  <strong>{formatBytes(preview.file.size)}</strong>
                  <span>
                    {preview.info.width} × {preview.info.height}
                  </span>
                  <span>{format(preview.info.mime)}</span>
                </>
              )}
            </div>
            {preview.result && (
              <Button
                disabled={outdated(preview) || preview.status !== "completed"}
                onClick={() => downloadOne(preview)}
              >
                <ArrowDownToLine size={15} />
                {en.download}
              </Button>
            )}
          </div>
        )}
      </Dialog>
      <Dialog
        open={!!overrideItem}
        onOpenChange={(open) => {
          if (!open) setOverrideId(undefined);
        }}
        title={en.overrides}
        description={overrideItem?.file.name ?? en.overrideDescription}
      >
        {overrideItem && (
          <>
            <SettingsPanel
              compact
              prefix="override"
              value={overrideDraft}
              onChange={setOverrideDraft}
              capabilities={capabilities}
              pngOnly={
                overrideDraft.format === "image/png" ||
                (overrideDraft.format === "original" &&
                  overrideItem.info.mime === "image/png")
              }
              showBackground={overrideDraft.format === "image/jpeg"}
            />
            <div className="dialog-actions">
              <Button
                variant="outline"
                onClick={() => {
                  cancel();
                  updateItems((current) =>
                    current.map((i) =>
                      i.id === overrideId ? { ...i, override: undefined } : i,
                    ),
                  );
                  setOverrideId(undefined);
                }}
              >
                {en.useGlobal}
              </Button>
              <Button
                onClick={() => {
                  cancel();
                  updateItems((current) =>
                    current.map((i) =>
                      i.id === overrideId
                        ? { ...i, override: structuredClone(overrideDraft) }
                        : i,
                    ),
                  );
                  setOverrideId(undefined);
                }}
              >
                {en.applyOverrides}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 12 12 4M4 4h8v8" />
    </svg>
  );
}
