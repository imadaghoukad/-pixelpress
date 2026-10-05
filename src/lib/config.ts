/** Memory limits apply before decoding and again before creating output canvases. */
export const LIMITS = {
  files: 20,
  fileBytes: 25_000_000,
  batchBytes: 150_000_000,
  pixels: 16_000_000,
  side: 8192,
  qualityAttempts: 12,
  dimensionAttempts: 5,
  minQuality: 0.05,
  maxQuality: 0.98,
} as const;
export const MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMime = (typeof MIMES)[number];
export type ResizeSettings = {
  enabled: boolean;
  unit: "pixels" | "percent";
  width: string;
  height: string;
  percent: string;
  lock: boolean;
  mode: "fit" | "crop" | "pad" | "stretch";
  upscale: boolean;
};
export type Settings = {
  mode: "quality" | "target";
  quality: number;
  target: string;
  targetUnit: "KB" | "MB";
  allowSmaller: boolean;
  format: "original" | ImageMime;
  background: string;
  resize: ResizeSettings;
};
export const DEFAULT_SETTINGS: Settings = {
  mode: "quality",
  quality: 0.8,
  target: "200",
  targetUnit: "KB",
  allowSmaller: false,
  format: "original",
  background: "#ffffff",
  resize: {
    enabled: false,
    unit: "pixels",
    width: "",
    height: "",
    percent: "75",
    lock: true,
    mode: "fit",
    upscale: false,
  },
};
export type ImageInfo = {
  mime: ImageMime;
  width: number;
  height: number;
  transparent: boolean;
  thumbnail: Blob;
};
export type Result = {
  blob: Blob;
  width: number;
  height: number;
  mime: ImageMime;
  quality?: number;
  targetReached?: boolean;
  keptOriginal: boolean;
  attempts: number;
};
export type Capabilities = {
  decode: Record<ImageMime, boolean>;
  encode: Record<ImageMime, boolean>;
  worker: boolean;
};
export type FileStatus =
  "ready" | "processing" | "completed" | "failed" | "cancelled";
