import { MIMES, type Capabilities, type ImageMime } from "./config";
import { CODEC_FIXTURES } from "./capability-fixtures";
import { makeCanvas, context, decodeImage, encodeCanvas } from "./canvas";
let cached: Promise<Capabilities> | undefined;
export function detectCapabilities() {
  cached ??= (async () => {
    const decode = {} as Record<ImageMime, boolean>,
      encode = {} as Record<ImageMime, boolean>;
    const canvas = makeCanvas(2, 2);
    context(canvas).fillRect(0, 0, 2, 2);
    for (const mime of MIMES) {
      try {
        const image = await decodeImage(
          new Blob([new Uint8Array(CODEC_FIXTURES[mime])], { type: mime }),
        );
        image.close();
        decode[mime] = true;
      } catch {
        decode[mime] = false;
      }
      try {
        await encodeCanvas(canvas, mime, 0.8);
        encode[mime] = true;
      } catch {
        encode[mime] = false;
      }
    }
    canvas.width = canvas.height = 1;
    return {
      decode,
      encode,
      worker:
        typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined",
    };
  })();
  return cached;
}
