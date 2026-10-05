import { Zlib } from "fflate";
import { crc32 } from "./validation";
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
function chunk(type: string, data: Uint8Array) {
  const b = new Uint8Array(data.length + 12),
    v = new DataView(b.buffer);
  v.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) b[4 + i] = type.charCodeAt(i);
  b.set(data, 8);
  v.setUint32(b.length - 4, crc32(b.subarray(4, b.length - 4)));
  return b;
}
function paeth(a: number, b: number, c: number) {
  const p = a + b - c,
    pa = Math.abs(p - a),
    pb = Math.abs(p - b),
    pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}
/** Exact palette (when <=256 colors), otherwise RGBA. Adaptive PNG filters + level-9
 * streaming DEFLATE. No quantization. Chunking yields for the non-worker fallback. */
export async function optimizePng(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  check: () => void,
): Promise<Blob> {
  const palette = new Map<number, number>();
  let indexed = true;
  for (let p = 0; p < rgba.length; p += 4) {
    const key =
      ((rgba[p] << 24) |
        (rgba[p + 1] << 16) |
        (rgba[p + 2] << 8) |
        rgba[p + 3]) >>>
      0;
    if (!palette.has(key)) palette.set(key, palette.size);
    if (palette.size > 256) {
      indexed = false;
      break;
    }
    if (p % 262144 === 0) {
      check();
      await tick();
    }
  }
  const channels = indexed ? 1 : 4,
    stride = width * channels;
  const header = new Uint8Array(13),
    hv = new DataView(header.buffer);
  hv.setUint32(0, width);
  hv.setUint32(4, height);
  header[8] = 8;
  header[9] = indexed ? 3 : 6;
  const parts: BlobPart[] = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
  ];
  if (indexed) {
    const colors = new Uint8Array(palette.size * 3),
      alpha = new Uint8Array(palette.size);
    for (const [key, i] of palette) {
      colors[i * 3] = key >>> 24;
      colors[i * 3 + 1] = key >>> 16;
      colors[i * 3 + 2] = key >>> 8;
      alpha[i] = key & 255;
    }
    parts.push(chunk("PLTE", colors));
    if (alpha.some((a) => a < 255)) parts.push(chunk("tRNS", alpha));
  }
  const deflater = new Zlib({ level: 9 }, (data) => {
    if (data.length) parts.push(chunk("IDAT", data));
  });
  let previous = new Uint8Array(stride);
  const rowsPerBlock = Math.max(
    1,
    Math.min(32, Math.floor(131072 / (stride + 1))),
  );
  let block = new Uint8Array((stride + 1) * rowsPerBlock),
    rowInBlock = 0;
  for (let y = 0; y < height; y++) {
    const raw = new Uint8Array(stride);
    if (indexed) {
      for (let x = 0; x < width; x++) {
        const p = (y * width + x) * 4;
        const key =
          ((rgba[p] << 24) |
            (rgba[p + 1] << 16) |
            (rgba[p + 2] << 8) |
            rgba[p + 3]) >>>
          0;
        raw[x] = palette.get(key)!;
      }
    } else raw.set(rgba.subarray(y * stride, (y + 1) * stride));
    let best = raw,
      bestFilter = 0,
      bestScore = Infinity;
    for (let filter = 0; filter <= 4; filter++) {
      const line = new Uint8Array(stride);
      let score = 0;
      for (let x = 0; x < stride; x++) {
        const a = x >= channels ? raw[x - channels] : 0,
          b = previous[x],
          c = x >= channels ? previous[x - channels] : 0;
        const predictor =
          filter === 0
            ? 0
            : filter === 1
              ? a
              : filter === 2
                ? b
                : filter === 3
                  ? (a + b) >>> 1
                  : paeth(a, b, c);
        const value = (raw[x] - predictor) & 255;
        line[x] = value;
        score += Math.min(value, 256 - value);
      }
      if (score < bestScore) {
        bestScore = score;
        best = line;
        bestFilter = filter;
      }
    }
    const offset = rowInBlock * (stride + 1);
    block[offset] = bestFilter;
    block.set(best, offset + 1);
    rowInBlock++;
    previous = raw;
    if (rowInBlock === rowsPerBlock || y === height - 1) {
      check();
      deflater.push(
        block.subarray(0, rowInBlock * (stride + 1)),
        y === height - 1,
      );
      block = new Uint8Array((stride + 1) * rowsPerBlock);
      rowInBlock = 0;
      await tick();
    }
  }
  check();
  parts.push(chunk("IEND", new Uint8Array()));
  return new Blob(parts, { type: "image/png" });
}
