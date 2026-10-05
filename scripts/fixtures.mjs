import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { zlibSync } from "fflate";
const dir = "tests/fixtures";
await mkdir(dir, { recursive: true });
const width = 480,
  height = 320,
  raw = Buffer.alloc(width * height * 3);
let seed = 42;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    raw[i] = ((x / width) * 180 + (seed & 127)) & 255;
    raw[i + 1] = ((y / height) * 180 + ((seed >>> 8) & 127)) & 255;
    raw[i + 2] = (80 + ((seed >>> 16) & 127)) & 255;
  }
const source = sharp(raw, { raw: { width, height, channels: 3 } });
await source.clone().jpeg({ quality: 100 }).toFile(`${dir}/photo.jpg`);
await source.clone().png().toFile(`${dir}/texture.png`);
await source.clone().webp({ quality: 100 }).toFile(`${dir}/photo.webp`);
await source.clone().resize(1600, 1000).png().toFile(`${dir}/large.png`);
const transparent = Buffer.alloc(120 * 80 * 4);
for (let y = 20; y < 60; y++)
  for (let x = 30; x < 90; x++) {
    const p = (y * 120 + x) * 4;
    transparent[p] = 240;
    transparent[p + 1] = 90;
    transparent[p + 2] = 40;
    transparent[p + 3] = 255;
  }
await sharp(transparent, { raw: { width: 120, height: 80, channels: 4 } })
  .png({ compressionLevel: 0 })
  .toFile(`${dir}/transparent.png`);
const oriented = Buffer.alloc(120 * 80 * 3);
for (let y = 0; y < 80; y++)
  for (let x = 0; x < 120; x++) {
    const i = (y * 120 + x) * 3;
    oriented[i] = x < 60 ? 245 : 10;
    oriented[i + 1] = 20;
    oriented[i + 2] = x < 60 ? 10 : 245;
  }
await sharp(oriented, { raw: { width: 120, height: 80, channels: 3 } })
  .jpeg({ quality: 95 })
  .withMetadata({ orientation: 6 })
  .toFile(`${dir}/rotated.jpg`);
await writeFile(
  `${dir}/corrupt.png`,
  Buffer.from("This is not an image, even though its extension is PNG."),
);
function crc(data) {
  let c = 0xffffffff;
  for (const b of data) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const b = Buffer.alloc(data.length + 12);
  b.writeUInt32BE(data.length);
  b.write(type, 4);
  data.copy(b, 8);
  b.writeUInt32BE(crc(b.subarray(4, -4)), b.length - 4);
  return b;
}
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(2, 0);
ihdr.writeUInt32BE(2, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const actl = Buffer.alloc(8);
actl.writeUInt32BE(2);
function frame(seq) {
  const b = Buffer.alloc(26);
  b.writeUInt32BE(seq);
  b.writeUInt32BE(2, 4);
  b.writeUInt32BE(2, 8);
  b.writeUInt16BE(1, 20);
  b.writeUInt16BE(10, 22);
  return b;
}
const pixels = (color) =>
  Buffer.from(
    zlibSync(Uint8Array.from([0, ...color, ...color, 0, ...color, ...color])),
  );
const fdat = Buffer.concat([
  Buffer.from([0, 0, 0, 2]),
  pixels([0, 0, 255, 255]),
]);
await writeFile(
  `${dir}/animated.png`,
  Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("acTL", actl),
    chunk("fcTL", frame(0)),
    chunk("IDAT", pixels([255, 0, 0, 255])),
    chunk("fcTL", frame(1)),
    chunk("fdAT", fdat),
    chunk("IEND", Buffer.alloc(0)),
  ]),
);
const stacked = Buffer.alloc(2 * 4 * 4, 255);
stacked.fill(0, 16, 24);
await sharp(stacked, {
  raw: { width: 2, height: 4, channels: 4, pageHeight: 2 },
})
  .webp({ loop: 0, delay: [100, 100] })
  .toFile(`${dir}/animated.webp`);
const oversized = Buffer.from(ihdr);
oversized.writeUInt32BE(9000, 0);
await writeFile(
  `${dir}/oversized.png`,
  Buffer.concat([
    sig,
    chunk("IHDR", oversized),
    chunk("IDAT", pixels([0, 0, 0, 255])),
    chunk("IEND", Buffer.alloc(0)),
  ]),
);
console.log(
  "Created real JPEG, PNG, WebP, transparent, oriented, animated, corrupt, and oversized fixtures.",
);
