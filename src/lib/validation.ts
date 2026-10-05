import { LIMITS, type ImageMime } from "./config";
import { assertDimensions } from "./dimensions";

const ascii = (b: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...b.subarray(start, start + length));
const crcTable = Uint32Array.from({ length: 256 }, (_, i) => {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  return c >>> 0;
});
export const crc32 = (data: Uint8Array) => {
  let c = 0xffffffff;
  for (const byte of data) c = (c >>> 8) ^ crcTable[(c ^ byte) & 255];
  return (c ^ 0xffffffff) >>> 0;
};
export function validateFileSize(size: number) {
  if (!size) throw new Error("emptyFile");
  if (size > LIMITS.fileBytes) throw new Error("fileLimit");
}
export function validateBatch(count: number, bytes: number, nextBytes: number) {
  if (count >= LIMITS.files) throw new Error("countLimit");
  if (bytes + nextBytes > LIMITS.batchBytes) throw new Error("batchLimit");
}
/** Content checks precede allocation of decoded pixels. Browser decoding is also mandatory. */
export function inspectContent(b: Uint8Array): {
  mime: ImageMime;
  width: number;
  height: number;
} {
  if (b.length < 12) throw new Error("corruptFile");
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let width = 0,
    height = 0;
  let mime: ImageMime;
  if (b[0] === 137 && ascii(b, 1, 3) === "PNG") {
    mime = "image/png";
    if (
      ascii(b, 12, 4) !== "IHDR" ||
      b.length < 33 ||
      v.getUint32(8) !== 13 ||
      v.getUint32(4) !== 0x0d0a1a0a
    )
      throw new Error("corruptFile");
    width = v.getUint32(16);
    height = v.getUint32(20);
    assertDimensions(width, height);
    let ended = false,
      data = false;
    for (let p = 8; p + 12 <= b.length;) {
      const length = v.getUint32(p),
        type = ascii(b, p + 4, 4);
      if (length > b.length - p - 12) throw new Error("corruptFile");
      if (type === "acTL" || type === "fcTL" || type === "fdAT")
        throw new Error("animatedFile");
      if (
        crc32(b.subarray(p + 4, p + 8 + length)) !== v.getUint32(p + 8 + length)
      )
        throw new Error("corruptFile");
      if (type === "IDAT") data = true;
      if (type === "IEND") {
        ended = true;
        break;
      }
      p += length + 12;
    }
    if (!ended || !data) throw new Error("corruptFile");
  } else if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") {
    mime = "image/webp";
    if (v.getUint32(4, true) + 8 !== b.length) throw new Error("corruptFile");
    for (let p = 12; p + 8 <= b.length;) {
      const type = ascii(b, p, 4),
        length = v.getUint32(p + 4, true),
        o = p + 8;
      if (length > b.length - o) throw new Error("corruptFile");
      if (type === "ANIM" || type === "ANMF" || (type === "VP8X" && b[o] & 2))
        throw new Error("animatedFile");
      if (type === "VP8X" && length >= 10) {
        width = 1 + b[o + 4] + (b[o + 5] << 8) + (b[o + 6] << 16);
        height = 1 + b[o + 7] + (b[o + 8] << 8) + (b[o + 9] << 16);
      } else if (type === "VP8 " && length >= 10 && !width) {
        width = v.getUint16(o + 6, true) & 0x3fff;
        height = v.getUint16(o + 8, true) & 0x3fff;
      } else if (type === "VP8L" && length >= 5 && !width) {
        const bits = v.getUint32(o + 1, true);
        width = (bits & 0x3fff) + 1;
        height = ((bits >>> 14) & 0x3fff) + 1;
      }
      p += 8 + length + (length & 1);
    }
  } else if (b[0] === 0xff && b[1] === 0xd8) {
    mime = "image/jpeg";
    let end = false;
    for (let p = b.length - 2; p >= Math.max(2, b.length - 1024); p--)
      if (b[p] === 0xff && b[p + 1] === 0xd9) {
        end = true;
        break;
      }
    if (!end) throw new Error("corruptFile");
    for (let p = 2; p + 4 < b.length;) {
      if (b[p] !== 255) throw new Error("corruptFile");
      while (b[p] === 255) p++;
      const marker = b[p++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (p + 2 > b.length) throw new Error("corruptFile");
      const length = v.getUint16(p);
      if (length < 2 || p + length > b.length) throw new Error("corruptFile");
      if (marker === 0xe2 && ascii(b, p + 2, 4) === "MPF\0")
        throw new Error("animatedFile");
      if ([0xc0, 0xc1, 0xc2].includes(marker) && length >= 8) {
        height = v.getUint16(p + 3);
        width = v.getUint16(p + 5);
      }
      p += length;
    }
  } else {
    if (ascii(b, 0, 3) === "GIF") throw new Error("unsupportedAnimation");
    throw new Error("unsupportedFile");
  }
  assertDimensions(width, height);
  return { mime, width, height };
}
