import type { ImageMime } from "./config";
export type Surface = OffscreenCanvas | HTMLCanvasElement;
export type Context =
  OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
export function makeCanvas(width: number, height: number): Surface {
  let canvas: Surface;
  if (typeof document !== "undefined")
    canvas = document.createElement("canvas");
  else if (typeof OffscreenCanvas !== "undefined")
    canvas = new OffscreenCanvas(width, height);
  else throw new Error("workerFallback");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
export function context(canvas: Surface): Context {
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  }) as Context | null;
  if (!ctx) throw new Error("memoryError");
  return ctx;
}
export async function encodeCanvas(
  canvas: Surface,
  type: ImageMime,
  quality?: number,
): Promise<Blob> {
  const blob =
    "convertToBlob" in canvas
      ? await canvas.convertToBlob({ type, quality })
      : await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("encodeFailed"))),
            type,
            quality,
          ),
        );
  if (blob.type !== type || !blob.size) throw new Error("encodeUnavailable");
  return blob;
}
export async function decodeImage(blob: Blob): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}> {
  if (typeof createImageBitmap !== "undefined") {
    try {
      // Both this API and <img> honor EXIF orientation. Never rotate their output again.
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      if (typeof document === "undefined") throw new Error("workerFallback");
    }
  }
  if (typeof document === "undefined") throw new Error("workerFallback");
  const url = URL.createObjectURL(blob),
    img = new Image();
  try {
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      close: () => {
        img.src = "";
        URL.revokeObjectURL(url);
      },
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("decodeFailed");
  }
}
