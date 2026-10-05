import { LIMITS } from "./config";

export function targetBytes(value: string | number, unit: "KB" | "MB"): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error("invalidTarget");
  const bytes = Math.floor(n * (unit === "KB" ? 1000 : 1_000_000));
  if (bytes < 1 || bytes > LIMITS.batchBytes) throw new Error("invalidTarget");
  return bytes;
}
export function meetsTarget(size: number, target: number) {
  return size <= target;
}
export function savings(original: number, output: number) {
  return {
    bytes: original - output,
    percent: original > 0 ? ((original - output) / original) * 100 : 0,
  };
}
export function formatBytes(bytes: number) {
  if (Math.abs(bytes) >= 1_000_000)
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  if (Math.abs(bytes) >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
}
