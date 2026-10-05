"use client";
import {
  LockKeyhole,
  UnlockKeyhole,
  SlidersHorizontal,
  RotateCcw,
  Info,
} from "lucide-react";
import {
  Button,
  Input,
  Select,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
} from "./ui/primitives";
import {
  DEFAULT_SETTINGS,
  type Capabilities,
  type Settings,
} from "@/lib/config";
import { en } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SettingsPanel({
  value: s,
  onChange,
  capabilities,
  pngOnly,
  showBackground,
  prefix = "global",
  compact = false,
}: {
  value: Settings;
  onChange: (settings: Settings) => void;
  capabilities?: Capabilities;
  pngOnly: boolean;
  showBackground: boolean;
  prefix?: string;
  compact?: boolean;
}) {
  const change = (patch: Partial<Settings>) => onChange({ ...s, ...patch });
  const resize = (patch: Partial<Settings["resize"]>) =>
    change({ resize: { ...s.resize, ...patch } });
  const field = (name: string) => `${prefix}-${name}`;
  return (
    <div className="settings-panel">
      {!compact && (
        <div className="settings-heading">
          <div>
            <h2>
              <SlidersHorizontal size={16} />
              {en.settings}
            </h2>
            <p>{en.globalSettings}</p>
          </div>
          <Tooltip text={en.reset}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={en.reset}
              onClick={() => onChange(structuredClone(DEFAULT_SETTINGS))}
            >
              <RotateCcw size={15} />
            </Button>
          </Tooltip>
        </div>
      )}
      <section className="setting-section">
        <div className="section-label">{en.compression}</div>
        <Tabs
          value={s.mode}
          onValueChange={(mode) => change({ mode: mode as Settings["mode"] })}
        >
          <TabsList aria-label={en.compression}>
            <TabsTrigger value="quality">{en.qualityMode}</TabsTrigger>
            <TabsTrigger value="target">{en.targetMode}</TabsTrigger>
          </TabsList>
          <TabsContent value={s.mode}>
            {s.mode === "quality" ? (
              <div className="setting-body">
                {!pngOnly && (
                  <>
                    <div className="field-label">
                      <label htmlFor={field("quality")}>{en.quality}</label>
                      <span className="quality-value">
                        {Math.round(s.quality * 100)}
                        <span>%</span>
                      </span>
                    </div>
                    <Slider
                      id={field("quality")}
                      aria-label={en.quality}
                      min={5}
                      max={100}
                      step={1}
                      value={[Math.round(s.quality * 100)]}
                      onValueChange={([n]) => change({ quality: n / 100 })}
                    />
                    <div className="range-labels">
                      <span>{en.smaller}</span>
                      <span>{en.sharper}</span>
                    </div>
                    <div className="quality-presets">
                      {[
                        [en.high, 0.92],
                        [en.balanced, 0.8],
                        [en.small, 0.55],
                      ].map(([label, q]) => (
                        <button
                          key={label}
                          className={cn(
                            "preset",
                            s.quality === q && "selected",
                          )}
                          aria-pressed={s.quality === q}
                          onClick={() => change({ quality: Number(q) })}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <p className={cn("help", pngOnly && "info-box")}>
                  {pngOnly ? (
                    <>
                      <Info size={15} />
                      {en.pngNote}
                    </>
                  ) : (
                    en.qualityHint
                  )}
                </p>
              </div>
            ) : (
              <div className="setting-body">
                <label className="field-label" htmlFor={field("target")}>
                  {en.targetLabel}
                </label>
                <div className="target-input">
                  <Input
                    id={field("target")}
                    type="number"
                    min="0.001"
                    step="any"
                    value={s.target}
                    onChange={(e) => change({ target: e.target.value })}
                  />
                  <Select
                    label={en.targetUnit}
                    value={s.targetUnit}
                    onValueChange={(unit) =>
                      change({ targetUnit: unit as "KB" | "MB" })
                    }
                    options={[
                      { value: "KB", label: "KB" },
                      { value: "MB", label: "MB" },
                    ]}
                  />
                </div>
                <div className="target-presets">
                  {[100, 200, 500, 1000].map((n) => (
                    <button
                      key={n}
                      className={cn(
                        "preset",
                        Number(s.target) *
                          (s.targetUnit === "MB" ? 1000 : 1) ===
                          n && "selected",
                      )}
                      aria-pressed={
                        Number(s.target) *
                          (s.targetUnit === "MB" ? 1000 : 1) ===
                        n
                      }
                      onClick={() =>
                        change({
                          target: n === 1000 ? "1" : String(n),
                          targetUnit: n === 1000 ? "MB" : "KB",
                        })
                      }
                    >
                      {n === 1000 ? "1 MB" : `${n} KB`}
                    </button>
                  ))}
                </div>
                <p className="help units">{en.units}</p>
                <div className="toggle-field">
                  <label htmlFor={field("smaller")}>{en.allowSmaller}</label>
                  <Switch
                    id={field("smaller")}
                    checked={s.allowSmaller}
                    onCheckedChange={(allowSmaller) => change({ allowSmaller })}
                  />
                </div>
                <p className="help">{en.allowSmallerHint}</p>
                {pngOnly && (
                  <p className="info-box help">
                    <Info size={15} />
                    {en.pngNote}
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
      <section className="setting-section">
        <label className="section-label" htmlFor={field("format")}>
          {en.formatLabel}
        </label>
        <Select
          id={field("format")}
          label={en.formatLabel}
          value={s.format}
          onValueChange={(format) =>
            change({ format: format as Settings["format"] })
          }
          options={[
            { value: "original", label: en.keepFormat },
            ...(["image/jpeg", "image/png", "image/webp"] as const).map(
              (mime) => ({
                value: mime,
                label:
                  mime === "image/jpeg"
                    ? "JPG"
                    : mime === "image/png"
                      ? "PNG"
                      : "WebP",
                disabled: capabilities ? !capabilities.encode[mime] : true,
              }),
            ),
          ]}
        />
        <p className="help">{en.formatHint}</p>
        {showBackground && (
          <div className="background-field">
            <div className="field-label">
              <label htmlFor={field("background")}>{en.background}</label>
              <div className="color-input">
                <input
                  type="color"
                  id={field("background")}
                  value={s.background}
                  onChange={(e) => change({ background: e.target.value })}
                />
                <code>{s.background.toUpperCase()}</code>
              </div>
            </div>
            <p className="help">{en.transparency}</p>
          </div>
        )}
      </section>
      <section className="setting-section resize-section">
        <div className="toggle-field">
          <label htmlFor={field("resize")} className="section-label">
            {en.resizeImages}
          </label>
          <Switch
            id={field("resize")}
            checked={s.resize.enabled}
            onCheckedChange={(enabled) => resize({ enabled })}
          />
        </div>
        {!s.resize.enabled ? (
          <p className="help">{en.resizeHint}</p>
        ) : (
          <div className="setting-body">
            <Tabs
              value={s.resize.unit}
              onValueChange={(unit) =>
                resize({ unit: unit as "pixels" | "percent" })
              }
            >
              <TabsList aria-label={en.resize}>
                <TabsTrigger value="pixels">{en.byPixels}</TabsTrigger>
                <TabsTrigger value="percent">{en.byPercent}</TabsTrigger>
              </TabsList>
              <TabsContent value={s.resize.unit}>
                {s.resize.unit === "percent" ? (
                  <div className="percent-field">
                    <label htmlFor={field("percent")}>{en.percent}</label>
                    <div>
                      <Input
                        id={field("percent")}
                        type="number"
                        min="0.01"
                        step="any"
                        value={s.resize.percent}
                        onChange={(e) => resize({ percent: e.target.value })}
                      />
                      <span>%</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="dimension-fields">
                      <div>
                        <label htmlFor={field("width")}>{en.width}</label>
                        <div className="input-unit">
                          <Input
                            id={field("width")}
                            type="number"
                            min="1"
                            step="1"
                            placeholder={en.auto}
                            value={s.resize.width}
                            onChange={(e) =>
                              resize({
                                width: e.target.value,
                                ...(s.resize.lock ? { height: "" } : {}),
                              })
                            }
                          />
                          <span>{en.px}</span>
                        </div>
                      </div>
                      <Tooltip text={s.resize.lock ? en.unlock : en.lock}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "lock-button",
                            s.resize.lock && "locked",
                          )}
                          aria-label={s.resize.lock ? en.unlock : en.lock}
                          aria-pressed={s.resize.lock}
                          onClick={() =>
                            resize({
                              lock: !s.resize.lock,
                              ...(!s.resize.lock ? { mode: "fit" } : {}),
                            })
                          }
                        >
                          {s.resize.lock ? (
                            <LockKeyhole size={15} />
                          ) : (
                            <UnlockKeyhole size={15} />
                          )}
                        </Button>
                      </Tooltip>
                      <div>
                        <label htmlFor={field("height")}>{en.height}</label>
                        <div className="input-unit">
                          <Input
                            id={field("height")}
                            type="number"
                            min="1"
                            step="1"
                            placeholder={en.auto}
                            value={s.resize.height}
                            onChange={(e) =>
                              resize({
                                height: e.target.value,
                                ...(s.resize.lock ? { width: "" } : {}),
                              })
                            }
                          />
                          <span>{en.px}</span>
                        </div>
                      </div>
                    </div>
                    <Select
                      label={en.resizeMode}
                      value={s.resize.mode}
                      onValueChange={(mode) =>
                        resize({
                          mode: mode as Settings["resize"]["mode"],
                          ...(mode !== "fit" ? { lock: false } : {}),
                        })
                      }
                      options={[
                        { value: "fit", label: en.fit },
                        { value: "crop", label: en.crop },
                        { value: "pad", label: en.pad },
                        { value: "stretch", label: en.stretch },
                      ]}
                    />
                    <p className="help">
                      {s.resize.mode === "fit"
                        ? en.fitHint
                        : s.resize.mode === "crop"
                          ? en.cropHint
                          : s.resize.mode === "pad"
                            ? en.padHint
                            : en.stretchHint}
                    </p>
                    <p className="help">{en.dimensionsHint}</p>
                  </>
                )}
              </TabsContent>
            </Tabs>
            <div className="toggle-field">
              <label htmlFor={field("upscale")}>{en.allowUpscale}</label>
              <Switch
                id={field("upscale")}
                checked={s.resize.upscale}
                onCheckedChange={(upscale) => resize({ upscale })}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
