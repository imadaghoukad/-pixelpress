import { LIMITS, type ResizeSettings } from "./config";
export type Geometry = {
  width: number;
  height: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
};
export function assertDimensions(width: number, height: number) {
  if (![width, height].every((n) => Number.isInteger(n) && n > 0))
    throw new Error("invalidDimensions");
  if (
    width > LIMITS.side ||
    height > LIMITS.side ||
    width * height > LIMITS.pixels
  )
    throw new Error("pixelLimit");
}
function positive(value: string) {
  if (!value.trim()) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n))
    throw new Error("invalidDimensions");
  return n;
}
export function calculateGeometry(
  w: number,
  h: number,
  s: ResizeSettings,
): Geometry {
  assertDimensions(w, h);
  let width = w,
    height = h;
  if (s.enabled) {
    if (s.unit === "percent") {
      const p = Number(s.percent);
      if (!Number.isFinite(p) || p <= 0) throw new Error("invalidDimensions");
      const factor = s.upscale ? p / 100 : Math.min(1, p / 100);
      width = Math.max(1, Math.round(w * factor));
      height = Math.max(1, Math.round(h * factor));
    } else {
      let a = positive(s.width),
        b = positive(s.height);
      if (!a && !b) throw new Error("missingDimensions");
      a ??= Math.max(1, Math.round((w * b!) / h));
      b ??= Math.max(1, Math.round((h * a) / w));
      if (s.mode === "fit") {
        const ratio = Math.min(a / w, b / h, s.upscale ? Infinity : 1);
        width = Math.max(1, Math.round(w * ratio));
        height = Math.max(1, Math.round(h * ratio));
      } else {
        width = a;
        height = b;
        // Exact output must never silently violate requested dimensions.
        const scale =
          s.mode === "crop"
            ? Math.max(a / w, b / h)
            : s.mode === "pad"
              ? Math.min(a / w, b / h)
              : Math.max(a / w, b / h);
        if (!s.upscale && scale > 1 && s.mode !== "pad")
          throw new Error("upscaleRequired");
      }
    }
  }
  assertDimensions(width, height);
  const g: Geometry = {
    width,
    height,
    sx: 0,
    sy: 0,
    sw: w,
    sh: h,
    dx: 0,
    dy: 0,
    dw: width,
    dh: height,
  };
  if (
    !s.enabled ||
    s.unit === "percent" ||
    s.mode === "fit" ||
    s.mode === "stretch"
  )
    return g;
  if (s.mode === "crop") {
    const ratio = Math.max(width / w, height / h);
    g.sw = width / ratio;
    g.sh = height / ratio;
    g.sx = (w - g.sw) / 2;
    g.sy = (h - g.sh) / 2;
  } else {
    const ratio = Math.min(width / w, height / h, s.upscale ? Infinity : 1);
    g.dw = w * ratio;
    g.dh = h * ratio;
    g.dx = (width - g.dw) / 2;
    g.dy = (height - g.dh) / 2;
  }
  return g;
}
