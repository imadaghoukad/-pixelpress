import {
  LIMITS,
  type ImageInfo,
  type ImageMime,
  type Result,
  type Settings,
} from "./config";
import { assertDimensions, calculateGeometry } from "./dimensions";
import {
  decodeImage,
  makeCanvas,
  context,
  encodeCanvas,
  type Surface,
} from "./canvas";
import { inspectContent, validateFileSize } from "./validation";
import { optimizePng } from "./png";
import { targetBytes } from "./numbers";
import { searchQuality } from "./search";

export async function inspectImage(
  file: File,
  check: () => void,
): Promise<ImageInfo> {
  validateFileSize(file.size);
  const bytes = new Uint8Array(await file.arrayBuffer());
  check();
  const { mime } = inspectContent(bytes);
  const decoded = await decodeImage(new Blob([file], { type: mime }));
  let canvas: Surface | undefined;
  try {
    assertDimensions(decoded.width, decoded.height);
    check();
    // Full alpha scan: small thumbnails can miss isolated transparent pixels.
    canvas = makeCanvas(decoded.width, decoded.height);
    const ctx = context(canvas);
    ctx.drawImage(decoded.source, 0, 0);
    let transparent = false;
    if (mime !== "image/jpeg") {
      for (let y = 0; y < decoded.height && !transparent; y += 64) {
        const rgba = ctx.getImageData(
          0,
          y,
          decoded.width,
          Math.min(64, decoded.height - y),
        ).data;
        for (let i = 3; i < rgba.length; i += 4)
          if (rgba[i] < 255) {
            transparent = true;
            break;
          }
        check();
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    const ratio = Math.min(1, 240 / Math.max(decoded.width, decoded.height));
    canvas.width = Math.max(1, Math.round(decoded.width * ratio));
    canvas.height = Math.max(1, Math.round(decoded.height * ratio));
    context(canvas).drawImage(
      decoded.source,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const thumbnail = await encodeCanvas(canvas, "image/png");
    check();
    return {
      mime,
      width: decoded.width,
      height: decoded.height,
      transparent,
      thumbnail,
    };
  } finally {
    decoded.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

export async function processImage(
  file: File,
  settings: Settings,
  check: () => void,
  progress: (attempt: number) => void,
): Promise<Result> {
  validateFileSize(file.size);
  const { mime: inputMime } = inspectContent(
    new Uint8Array(await file.arrayBuffer()),
  );
  check();
  const mime: ImageMime =
    settings.format === "original" ? inputMime : settings.format;
  const target =
    settings.mode === "target"
      ? targetBytes(settings.target, settings.targetUnit)
      : undefined;
  if (
    !Number.isFinite(settings.quality) ||
    settings.quality < 0.05 ||
    settings.quality > 1 ||
    !/^#[0-9a-f]{6}$/i.test(settings.background)
  )
    throw new Error("invalidSettings");
  const decoded = await decodeImage(new Blob([file], { type: inputMime }));
  let canvas: Surface | undefined;
  try {
    const geometry = calculateGeometry(
      decoded.width,
      decoded.height,
      settings.resize,
    );
    check();
    const mayKeepOriginal =
      !settings.resize.enabled && settings.format === "original";
    const original: Result = {
      blob: new Blob([file], { type: inputMime }),
      width: decoded.width,
      height: decoded.height,
      mime: inputMime,
      keptOriginal: true,
      attempts: 0,
      targetReached: target === undefined ? undefined : file.size <= target,
    };
    if (mayKeepOriginal && target !== undefined && file.size <= target)
      return original;
    let best: Result | undefined,
      attempts = 0;
    const rounds =
      target !== undefined && settings.allowSmaller
        ? LIMITS.dimensionAttempts
        : 1;
    for (let round = 0; round < rounds; round++) {
      check();
      const scale = Math.pow(0.72, round);
      const width = Math.max(1, Math.round(geometry.width * scale)),
        height = Math.max(1, Math.round(geometry.height * scale));
      assertDimensions(width, height);
      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
      }
      canvas = makeCanvas(width, height);
      const ctx = context(canvas);
      if (mime === "image/jpeg") {
        ctx.fillStyle = settings.background;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        decoded.source,
        geometry.sx,
        geometry.sy,
        geometry.sw,
        geometry.sh,
        (geometry.dx * width) / geometry.width,
        (geometry.dy * height) / geometry.height,
        (geometry.dw * width) / geometry.width,
        (geometry.dh * height) / geometry.height,
      );
      const encode = async (quality: number) => {
        check();
        const blob = await encodeCanvas(canvas!, mime, quality);
        check();
        attempts++;
        progress(attempts);
        return { value: blob, size: blob.size };
      };
      let blob: Blob, quality: number | undefined;
      if (mime === "image/png") {
        const optimized = await optimizePng(
          ctx.getImageData(0, 0, width, height).data,
          width,
          height,
          check,
        );
        const native = await encodeCanvas(canvas, mime);
        attempts += 2;
        progress(attempts);
        blob = optimized.size < native.size ? optimized : native;
      } else if (target !== undefined) {
        const search = await searchQuality(encode, target, check);
        blob = search.best.value;
        quality = search.best.quality;
      } else {
        quality = settings.quality;
        blob = (await encode(quality)).value;
      }
      check();
      // Confirm both encoder MIME and actual file signature, not the requested type.
      if (
        blob.type !== mime ||
        inspectContent(new Uint8Array(await blob.arrayBuffer())).mime !== mime
      )
        throw new Error("encodeUnavailable");
      const candidate: Result = {
        blob,
        width,
        height,
        mime,
        quality,
        attempts,
        keptOriginal: false,
        targetReached: target === undefined ? undefined : blob.size <= target,
      };
      if (!best || blob.size < best.blob.size || candidate.targetReached)
        best = candidate;
      if (target === undefined || candidate.targetReached) break;
    }
    check();
    if (mayKeepOriginal && original.blob.size <= best!.blob.size)
      return { ...original, attempts };
    return { ...best!, attempts };
  } finally {
    decoded.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}
