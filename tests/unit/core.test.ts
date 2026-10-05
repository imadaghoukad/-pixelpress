import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { DEFAULT_SETTINGS, LIMITS } from "../../src/lib/config";
import { calculateGeometry, assertDimensions } from "../../src/lib/dimensions";
import {
  targetBytes,
  meetsTarget,
  savings,
  formatBytes,
} from "../../src/lib/numbers";
import { uniqueFilename } from "../../src/lib/filenames";
import { searchQuality } from "../../src/lib/search";
import {
  inspectContent,
  validateBatch,
  validateFileSize,
  crc32,
} from "../../src/lib/validation";
import { optimizePng } from "../../src/lib/png";
const settings = (patch = {}) => ({
  ...DEFAULT_SETTINGS.resize,
  enabled: true,
  ...patch,
});
describe("resize geometry", () => {
  it("keeps dimensions when resizing is off", () =>
    expect(calculateGeometry(400, 300, DEFAULT_SETTINGS.resize)).toMatchObject({
      width: 400,
      height: 300,
    }));
  it("calculates height from width", () =>
    expect(
      calculateGeometry(400, 300, settings({ width: "200" })),
    ).toMatchObject({ width: 200, height: 150 }));
  it("calculates width from height", () =>
    expect(
      calculateGeometry(400, 300, settings({ height: "150" })),
    ).toMatchObject({ width: 200, height: 150 }));
  it("fits without cropping", () =>
    expect(
      calculateGeometry(400, 300, settings({ width: "200", height: "200" })),
    ).toMatchObject({ width: 200, height: 150, sw: 400, sh: 300 }));
  it("crops from the center", () =>
    expect(
      calculateGeometry(
        400,
        300,
        settings({ width: "200", height: "200", mode: "crop" }),
      ),
    ).toMatchObject({
      width: 200,
      height: 200,
      sx: 50,
      sy: 0,
      sw: 300,
      sh: 300,
    }));
  it("pads without stretching", () =>
    expect(
      calculateGeometry(
        400,
        300,
        settings({ width: "200", height: "200", mode: "pad" }),
      ),
    ).toMatchObject({
      width: 200,
      height: 200,
      dx: 0,
      dy: 25,
      dw: 200,
      dh: 150,
    }));
  it("allows a larger padded canvas without enlarging image pixels", () =>
    expect(
      calculateGeometry(
        400,
        300,
        settings({ width: "800", height: "800", mode: "pad" }),
      ),
    ).toMatchObject({
      width: 800,
      height: 800,
      dw: 400,
      dh: 300,
      dx: 200,
      dy: 250,
    }));
  it("stretches only in explicit stretch mode", () =>
    expect(
      calculateGeometry(
        400,
        300,
        settings({ width: "200", height: "200", mode: "stretch" }),
      ),
    ).toMatchObject({ sw: 400, sh: 300, dw: 200, dh: 200 }));
  it("resizes by percentage", () =>
    expect(
      calculateGeometry(400, 300, settings({ unit: "percent", percent: "25" })),
    ).toMatchObject({ width: 100, height: 75 }));
  it("does not upscale by default", () =>
    expect(
      calculateGeometry(400, 300, settings({ width: "800" })),
    ).toMatchObject({ width: 400, height: 300 }));
  it("does not secretly shrink exact dimensions", () =>
    expect(() =>
      calculateGeometry(
        400,
        300,
        settings({ width: "800", height: "800", mode: "crop" }),
      ),
    ).toThrow("upscaleRequired"));
  it("allows explicit upscaling", () =>
    expect(
      calculateGeometry(400, 300, settings({ width: "800", upscale: true })),
    ).toMatchObject({ width: 800, height: 600 }));
  it.each(["0", "-10", "NaN", "1.5", "Infinity"])(
    "rejects invalid pixels %s",
    (width) =>
      expect(() => calculateGeometry(400, 300, settings({ width }))).toThrow(),
  );
  it("requires at least one dimension", () =>
    expect(() => calculateGeometry(400, 300, settings())).toThrow(
      "missingDimensions",
    ));
  it("enforces pixel and side limits", () => {
    expect(() => assertDimensions(5000, 5000)).toThrow("pixelLimit");
    expect(() => assertDimensions(9000, 1)).toThrow("pixelLimit");
  });
});
describe("bytes and savings", () => {
  it("uses decimal KB and MB", () => {
    expect(targetBytes("100", "KB")).toBe(100000);
    expect(targetBytes("1", "MB")).toBe(1000000);
    expect(targetBytes("0.001", "KB")).toBe(1);
  });
  it.each(["", "0", "-1", "no", "Infinity", "999999999"])(
    "rejects bad targets %s",
    (v) => expect(() => targetBytes(v, "KB")).toThrow(),
  );
  it("compares actual bytes inclusively", () => {
    expect(meetsTarget(100000, 100000)).toBe(true);
    expect(meetsTarget(100001, 100000)).toBe(false);
  });
  it("reports negative savings without hiding expansion", () => {
    expect(savings(100, 150)).toEqual({ bytes: -50, percent: -50 });
    expect(savings(100, 25)).toEqual({ bytes: 75, percent: 75 });
    expect(savings(0, 0).percent).toBe(0);
  });
  it("formats decimal units", () => {
    expect(formatBytes(1000000)).toBe("1.00 MB");
    expect(formatBytes(1000)).toBe("1.0 KB");
  });
});
describe("quality search", () => {
  it("stops after the maximum-quality candidate already fits", async () => {
    const r = await searchQuality(async (q) => ({ value: q, size: 10 }), 100);
    expect(r.attempts).toBe(1);
    expect(r.best.quality).toBe(LIMITS.maxQuality);
  });
  it("finds practical high quality with bounded iterations", async () => {
    const r = await searchQuality(
      async (q) => ({ value: q, size: Math.round(q * 10000) }),
      5000,
    );
    expect(r.reached).toBe(true);
    expect(r.best.size).toBeLessThanOrEqual(5000);
    expect(r.best.quality).toBeGreaterThan(0.49);
    expect(r.attempts).toBeLessThanOrEqual(LIMITS.qualityAttempts);
  });
  it("keeps a non-monotonic feasible high-quality candidate", async () => {
    const r = await searchQuality(
      async (q) => ({ value: q, size: q > 0.8 && q < 0.9 ? 400 : 1000 }),
      500,
    );
    expect(r.best.quality).toBeGreaterThan(0.8);
    expect(r.reached).toBe(true);
  });
  it("returns the smallest found candidate when impossible", async () => {
    const r = await searchQuality(
      async (q) => ({ value: q, size: q < 0.2 ? 100 : 200 }),
      1,
    );
    expect(r.reached).toBe(false);
    expect(r.best.size).toBe(100);
    expect(r.attempts).toBe(7);
  });
  it("honors cancellation between candidates", async () => {
    let calls = 0;
    await expect(
      searchQuality(
        async (q) => ({ value: q, size: 1000 }),
        1,
        () => {
          if (++calls > 2) throw new Error("cancel");
        },
      ),
    ).rejects.toThrow("cancel");
  });
});
describe("safe filenames", () => {
  it("uses the actual MIME extension and avoids case-insensitive collisions", () => {
    const used = new Set<string>();
    expect(uniqueFilename("photo.png", "image/jpeg", used)).toBe(
      "photo-pixelpress.jpg",
    );
    expect(uniqueFilename("PHOTO.png", "image/jpeg", used)).toBe(
      "PHOTO-pixelpress-2.jpg",
    );
  });
  it("removes paths and unsafe characters", () => {
    expect(uniqueFilename("../../a?.png", "image/webp", new Set())).toBe(
      "a-pixelpress.webp",
    );
    expect(uniqueFilename(".png", "image/png", new Set())).toBe(
      "image-pixelpress.png",
    );
  });
});
describe("content validation", () => {
  it.each([
    "photo.jpg",
    "texture.png",
    "photo.webp",
    "rotated.jpg",
    "transparent.png",
  ])("recognizes real content %s", (name) =>
    expect(
      inspectContent(readFileSync(`tests/fixtures/${name}`)).width,
    ).toBeGreaterThan(0),
  );
  it.each(["animated.png", "animated.webp"])("rejects animation %s", (name) =>
    expect(() =>
      inspectContent(readFileSync(`tests/fixtures/${name}`)),
    ).toThrow("animatedFile"),
  );
  it("rejects corruption, truncation and extreme dimensions", () => {
    for (const name of ["corrupt.png", "oversized.png"])
      expect(() =>
        inspectContent(readFileSync(`tests/fixtures/${name}`)),
      ).toThrow();
    expect(() =>
      inspectContent(readFileSync("tests/fixtures/photo.jpg").subarray(0, 100)),
    ).toThrow();
  });
  it("checks PNG CRCs", () => {
    const bytes = readFileSync("tests/fixtures/transparent.png");
    bytes[30] ^= 1;
    expect(() => inspectContent(bytes)).toThrow("corruptFile");
  });
  it("checks file and batch limits", () => {
    expect(() => validateFileSize(0)).toThrow("emptyFile");
    expect(() => validateFileSize(LIMITS.fileBytes + 1)).toThrow("fileLimit");
    expect(() => validateBatch(LIMITS.files, 0, 1)).toThrow("countLimit");
    expect(() => validateBatch(1, LIMITS.batchBytes, 1)).toThrow("batchLimit");
  });
  it("calculates standard CRC32", () =>
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926));
});
describe("real PNG optimization", () => {
  it.each(["transparent.png", "texture.png"])(
    "preserves every decoded RGBA pixel in %s",
    async (name) => {
      const { data, info } = await sharp(`tests/fixtures/${name}`)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const blob = await optimizePng(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        () => {},
      );
      const encoded = Buffer.from(await blob.arrayBuffer());
      const output = await sharp(encoded).ensureAlpha().raw().toBuffer();
      expect(output.equals(data)).toBe(true);
      expect(inspectContent(encoded).mime).toBe("image/png");
      if (name === "transparent.png")
        expect(blob.size).toBeLessThan(
          readFileSync(`tests/fixtures/${name}`).length / 10,
        );
    },
  );
});
