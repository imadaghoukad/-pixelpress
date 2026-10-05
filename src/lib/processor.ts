import type { ImageInfo, Result, Settings } from "./config";
import { inspectImage, processImage } from "./engine";
export function abortCheck(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
}
/** One task per worker. Terminating it immediately frees resources on cancel. */
export async function runJob(
  kind: "inspect",
  file: File,
  signal: AbortSignal,
): Promise<ImageInfo>;
export async function runJob(
  kind: "process",
  file: File,
  signal: AbortSignal,
  settings: Settings,
  progress?: (attempt: number) => void,
): Promise<Result>;
export async function runJob(
  kind: "inspect" | "process",
  file: File,
  signal: AbortSignal,
  settings?: Settings,
  progress: (attempt: number) => void = () => {},
): Promise<ImageInfo | Result> {
  abortCheck(signal);
  if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
    try {
      return await new Promise<ImageInfo | Result>((resolve, reject) => {
        let worker: Worker;
        try {
          worker = new Worker(
            new URL("../workers/image.worker.ts", import.meta.url),
          );
        } catch {
          reject(new Error("workerFallback"));
          return;
        }
        const id = crypto.randomUUID();
        const cleanup = () => {
          worker.terminate();
          signal.removeEventListener("abort", onAbort);
        };
        const onAbort = () => {
          cleanup();
          reject(new DOMException("Cancelled", "AbortError"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
        worker.onerror = () => {
          cleanup();
          reject(new Error("workerFallback"));
        };
        worker.onmessage = (event) => {
          if (event.data.id !== id || signal.aborted) return;
          if (event.data.attempt !== undefined) {
            progress(event.data.attempt);
            return;
          }
          cleanup();
          if (event.data.error) reject(new Error(event.data.error));
          else resolve(event.data.result);
        };
        try {
          worker.postMessage({ id, kind, file, settings });
        } catch {
          cleanup();
          reject(new Error("workerFallback"));
        }
      });
    } catch (error) {
      abortCheck(signal);
      if (
        !(error instanceof Error) ||
        !["workerFallback", "encodeUnavailable"].includes(error.message)
      )
        throw error;
    }
  }
  const check = () => abortCheck(signal);
  return kind === "inspect"
    ? inspectImage(file, check)
    : processImage(file, settings!, check, progress);
}
