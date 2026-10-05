import { test, expect, type Page, type Download } from "@playwright/test";
import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { unzipSync } from "fflate";

const fixture = (name: string) => path.resolve("tests/fixtures", name);
const cards = (page: Page) => page.getByTestId("image-card");
async function upload(page: Page, names: string[]) {
  await page.getByTestId("file-input").setInputFiles(names.map(fixture));
  await expect(cards(page)).toHaveCount(names.length);
  await expect(
    page.getByRole("button", { name: "Process images", exact: true }),
  ).toBeEnabled();
}
async function processAll(page: Page, count: number) {
  await page
    .getByRole("button", { name: "Process images", exact: true })
    .click();
  await expect(cards(page).getByText("Completed", { exact: true })).toHaveCount(
    count,
  );
}
async function chooseFormat(page: Page, label: string) {
  await expect(page.getByText("Checking browser support…")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Output format", exact: true })
    .click();
  await page.getByRole("option", { name: label, exact: true }).click();
}
async function bytes(download: Download) {
  return readFile((await download.path())!);
}
async function downloadFirst(page: Page) {
  const pending = page.waitForEvent("download");
  await cards(page)
    .first()
    .getByRole("button", { name: /^Download / })
    .click();
  return pending;
}
async function targetMode(page: Page, kb: string) {
  await page.getByRole("tab", { name: "Target size", exact: true }).click();
  await page.getByLabel("Maximum file size", { exact: true }).fill(kb);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("drag-and-drop and keyboard quality controls work", async ({ page }) => {
  const data = [...(await readFile(fixture("photo.jpg")))];
  const transfer = await page.evaluateHandle((bytes) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array(bytes)], "dropped.jpg", { type: "image/jpeg" }),
    );
    return transfer;
  }, data);
  await page
    .locator(".dropzone")
    .dispatchEvent("drop", { dataTransfer: transfer });
  await transfer.dispose();
  await expect(cards(page)).toHaveCount(1);
  const slider = page.getByRole("slider", {
    name: "Image quality",
    exact: true,
  });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "81");
  await expect(
    page.getByRole("tabpanel", { name: "Quality", exact: true }),
  ).toBeVisible();
  await processAll(page, 1);
  expect(
    await sharp(await bytes(await downloadFirst(page))).metadata(),
  ).toMatchObject({ format: "jpeg", width: 480, height: 320 });
});

test("upload → process → preview → download real JPEG", async ({ page }) => {
  await upload(page, ["photo.jpg"]);
  await processAll(page, 1);
  await cards(page)
    .first()
    .getByRole("button", { name: "Before & after" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("tab", { name: "Original", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Original: photo.jpg", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  const download = await downloadFirst(page),
    output = await bytes(download);
  expect(download.suggestedFilename()).toBe("photo-pixelpress.jpg");
  expect(await sharp(output).metadata()).toMatchObject({
    format: "jpeg",
    width: 480,
    height: 320,
  });
  expect(output.length).toBeLessThan(
    (await readFile(fixture("photo.jpg"))).length,
  );
});

test("mixed formats and add more preserve the batch; ZIP has actual outputs", async ({
  page,
}) => {
  await upload(page, ["photo.jpg"]);
  await page
    .getByTestId("file-input")
    .setInputFiles([fixture("transparent.png"), fixture("photo.webp")]);
  await expect(cards(page)).toHaveCount(3);
  const webpSupported = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 2;
        canvas.toBlob(
          (blob) => resolve(blob?.type === "image/webp"),
          "image/webp",
        );
      }),
  );
  if (webpSupported) await processAll(page, 3);
  else {
    // A browser without a WebP encoder must fail clearly, never substitute PNG.
    await page
      .getByRole("button", { name: "Process images", exact: true })
      .click();
    await expect(
      cards(page).getByText("Completed", { exact: true }),
    ).toHaveCount(2);
    const webp = cards(page).filter({
      has: page.getByRole("heading", { name: "photo.webp", exact: true }),
    });
    await expect(webp.getByText("Failed", { exact: true })).toBeVisible();
    await expect(webp).toContainText("cannot encode the requested format");
    await webp
      .getByRole("button", { name: "Image settings photo.webp", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("combobox", { name: "Output format", exact: true })
      .click();
    await page
      .getByRole("option", { name: "WebP", exact: true })
      .isEnabled()
      .then((enabled) => expect(enabled).toBe(false));
    await page.getByRole("option", { name: "JPG", exact: true }).click();
    await dialog
      .getByRole("button", { name: "Apply to this image", exact: true })
      .click();
    await webp.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(
      cards(page).getByText("Completed", { exact: true }),
    ).toHaveCount(3);
  }
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download all", exact: false })
    .click();
  const entries = unzipSync(await bytes(await pending));
  expect(Object.keys(entries).sort()).toEqual([
    ...(webpSupported
      ? ["photo-pixelpress.jpg", "photo-pixelpress.webp"]
      : ["photo-pixelpress-2.jpg", "photo-pixelpress.jpg"]),
    "transparent-pixelpress.png",
  ]);
  for (const [name, data] of Object.entries(entries)) {
    const meta = await sharp(data).metadata();
    expect(meta.format).toBe(
      name.endsWith(".jpg") ? "jpeg" : name.endsWith(".png") ? "png" : "webp",
    );
    expect(meta.width).toBe(name.startsWith("transparent") ? 120 : 480);
  }
});

test("target size checks real bytes and keeps requested dimensions", async ({
  page,
}) => {
  await upload(page, ["photo.jpg"]);
  // 30 KB is feasible for this fixture even on WebKit's higher minimum JPEG size.
  await targetMode(page, "30");
  await processAll(page, 1);
  await expect(
    cards(page).getByText("Target reached", { exact: true }),
  ).toBeVisible();
  const result = await bytes(await downloadFirst(page));
  expect(result.length).toBeLessThanOrEqual(30_000);
  expect(await sharp(result).metadata()).toMatchObject({
    width: 480,
    height: 320,
    format: "jpeg",
  });
});

test("impossible target is reported honestly without changing dimensions", async ({
  page,
}) => {
  await upload(page, ["photo.jpg"]);
  await targetMode(page, "0.001");
  await processAll(page, 1);
  await expect(
    cards(page).getByText("Target not reached", { exact: true }),
  ).toBeVisible();
  const result = await bytes(await downloadFirst(page));
  expect(result.length).toBeGreaterThan(1);
  expect(await sharp(result).metadata()).toMatchObject({
    width: 480,
    height: 320,
  });
});

test("dimension reduction only happens after opting in", async ({ page }) => {
  await upload(page, ["photo.jpg"]);
  await targetMode(page, "3");
  await processAll(page, 1);
  await expect(
    cards(page).getByText("Target not reached", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("switch", { name: "Allow smaller dimensions", exact: true })
    .click();
  await expect(
    cards(page).getByText("Outdated", { exact: true }),
  ).toBeVisible();
  await processAll(page, 1);
  await expect(
    cards(page).getByText("Target reached", { exact: true }),
  ).toBeVisible();
  const result = await bytes(await downloadFirst(page)),
    meta = await sharp(result).metadata();
  expect(result.length).toBeLessThanOrEqual(3000);
  expect(meta.width).toBeLessThan(480);
});

test("transparent PNG to JPG uses the selected background", async ({
  page,
}) => {
  await upload(page, ["transparent.png"]);
  await chooseFormat(page, "JPG");
  await page.getByLabel("JPG background", { exact: true }).fill("#2244cc");
  await processAll(page, 1);
  const output = await bytes(await downloadFirst(page));
  expect(await sharp(output).metadata()).toMatchObject({
    format: "jpeg",
    width: 120,
    height: 80,
    hasAlpha: false,
  });
  const pixel = await sharp(output)
    .extract({ left: 2, top: 2, width: 1, height: 1 })
    .raw()
    .toBuffer();
  expect(Math.abs(pixel[0] - 34)).toBeLessThan(6);
  expect(Math.abs(pixel[1] - 68)).toBeLessThan(6);
  expect(Math.abs(pixel[2] - 204)).toBeLessThan(6);
});

test("PNG optimization preserves transparency and every decoded pixel", async ({
  page,
}) => {
  await upload(page, ["transparent.png"]);
  await expect(page.getByRole("slider", { name: "Image quality" })).toHaveCount(
    0,
  );
  await processAll(page, 1);
  const output = await bytes(await downloadFirst(page));
  const before = await sharp(fixture("transparent.png"))
    .ensureAlpha()
    .raw()
    .toBuffer();
  const after = await sharp(output).ensureAlpha().raw().toBuffer();
  expect(after.equals(before)).toBe(true);
  expect(output.length).toBeLessThan(
    (await readFile(fixture("transparent.png"))).length / 10,
  );
});

test("EXIF orientation is applied once and metadata is normalized", async ({
  page,
}) => {
  await upload(page, ["rotated.jpg"]);
  await expect(
    cards(page).getByText("80 × 120", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("switch", { name: "Resize images", exact: true })
    .click();
  await page.getByRole("tab", { name: "Percentage", exact: true }).click();
  await page.getByLabel("Scale", { exact: true }).fill("50");
  await processAll(page, 1);
  const output = await bytes(await downloadFirst(page));
  const meta = await sharp(output).metadata();
  expect(meta).toMatchObject({ width: 40, height: 60 });
  expect(meta.orientation).toBeUndefined();
  const top = await sharp(output)
    .extract({ left: 20, top: 5, width: 1, height: 1 })
    .raw()
    .toBuffer();
  const bottom = await sharp(output)
    .extract({ left: 20, top: 55, width: 1, height: 1 })
    .raw()
    .toBuffer();
  expect(top[0]).toBeGreaterThan(200);
  expect(top[2]).toBeLessThan(40);
  expect(bottom[2]).toBeGreaterThan(200);
});

test("animated, corrupted, oversized, and unsupported files do not block valid files", async ({
  page,
}) => {
  await page
    .getByTestId("file-input")
    .setInputFiles([
      fixture("animated.png"),
      fixture("animated.webp"),
      fixture("corrupt.png"),
      fixture("oversized.png"),
      fixture("photo.jpg"),
    ]);
  await expect(cards(page)).toHaveCount(1);
  await expect(page.locator(".notices[role=alert]")).toContainText(
    "Animated or multi-frame",
  );
  await expect(page.locator(".notices[role=alert]")).toContainText(
    "Unsupported file content",
  );
  await expect(page.locator(".notices[role=alert]")).toContainText(
    "16 megapixels",
  );
  await processAll(page, 1);
  await page.getByTestId("file-input").setInputFiles({
    name: "too-large.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(25_000_001),
  });
  await expect(page.locator(".notices[role=alert]")).toContainText(
    "25 MB limit",
  );
  await expect(cards(page)).toHaveCount(1);
});

test("actual file content wins over extension or declared MIME", async ({
  page,
}) => {
  await page.getByTestId("file-input").setInputFiles({
    name: "disguised.jpg",
    mimeType: "image/jpeg",
    buffer: await readFile(fixture("transparent.png")),
  });
  await expect(cards(page)).toHaveCount(1);
  await processAll(page, 1);
  const download = await downloadFirst(page);
  expect(download.suggestedFilename()).toBe("disguised-pixelpress.png");
  expect((await sharp(await bytes(download)).metadata()).format).toBe("png");
});

test("settings invalidate results and reprocessing starts from the original", async ({
  page,
}) => {
  await upload(page, ["photo.jpg"]);
  await page
    .getByRole("switch", { name: "Resize images", exact: true })
    .click();
  await page.getByRole("tab", { name: "Percentage", exact: true }).click();
  await page.getByLabel("Scale", { exact: true }).fill("50");
  await processAll(page, 1);
  expect(
    await sharp(await bytes(await downloadFirst(page))).metadata(),
  ).toMatchObject({ width: 240, height: 160 });
  await page.getByLabel("Scale", { exact: true }).fill("25");
  await expect(
    cards(page).getByText("Outdated", { exact: true }),
  ).toBeVisible();
  await expect(
    cards(page).getByRole("button", { name: /^Download / }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: /Download all/ })).toHaveCount(
    0,
  );
  await processAll(page, 1);
  expect(
    await sharp(await bytes(await downloadFirst(page))).metadata(),
  ).toMatchObject({ width: 120, height: 80 });
});

test("per-file failure can be retried; removing and clearing release the batch", async ({
  page,
}) => {
  await upload(page, ["photo.jpg"]);
  await page
    .getByRole("switch", { name: "Resize images", exact: true })
    .click();
  await page.getByLabel("Width", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Process images", exact: true })
    .click();
  await expect(cards(page).getByText("Failed", { exact: true })).toBeVisible();
  await page.getByLabel("Width", { exact: true }).fill("240");
  await cards(page).getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    cards(page).getByText("Completed", { exact: true }),
  ).toBeVisible();
  await cards(page)
    .getByRole("button", { name: "Remove photo.jpg", exact: true })
    .click();
  await expect(cards(page)).toHaveCount(0);
  await upload(page, ["transparent.png"]);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(cards(page)).toHaveCount(0);
});

test("cancellation ignores worker results and can be retried", async ({
  page,
}) => {
  await upload(page, ["large.png", "texture.png"]);
  await page
    .getByRole("button", { name: "Process images", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cancel processing", exact: true })
    .click();
  await expect(cards(page).getByText("Cancelled", { exact: true })).toHaveCount(
    2,
  );
  await processAll(page, 2);
});

test("settings changes cancel active work and removed files never reappear", async ({
  page,
}) => {
  await upload(page, ["large.png", "texture.png"]);
  await page
    .getByRole("button", { name: "Process images", exact: true })
    .click();
  await page.getByRole("tab", { name: "Target size", exact: true }).click();
  await expect(cards(page).getByText("Cancelled", { exact: true })).toHaveCount(
    2,
  );
  await page
    .getByRole("button", { name: "Process images", exact: true })
    .click();
  await cards(page)
    .first()
    .getByRole("button", { name: "Remove large.png", exact: true })
    .click();
  await expect(cards(page)).toHaveCount(1);
  await expect(
    cards(page).getByText("Cancelled", { exact: true }),
  ).toBeVisible();
  await expect(
    cards(page).getByRole("heading", { name: "texture.png", exact: true }),
  ).toBeVisible();
});

test("per-image overrides stay independent and ZIP names are collision-safe", async ({
  page,
}) => {
  const file = {
    name: "same.jpg",
    mimeType: "image/jpeg",
    buffer: await readFile(fixture("photo.jpg")),
  };
  await page.getByTestId("file-input").setInputFiles([file, file]);
  await expect(cards(page)).toHaveCount(2);
  await cards(page)
    .first()
    .getByRole("button", { name: "Image settings same.jpg", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("switch", { name: "Resize images", exact: true })
    .click();
  await dialog.getByLabel("Width", { exact: true }).fill("120");
  await dialog
    .getByRole("button", { name: "Apply to this image", exact: true })
    .click();
  await processAll(page, 2);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download all/ }).click();
  const zip = unzipSync(await bytes(await pending));
  expect(Object.keys(zip)).toEqual([
    "same-pixelpress.jpg",
    "same-pixelpress-2.jpg",
  ]);
  expect(await sharp(zip["same-pixelpress.jpg"]).metadata()).toMatchObject({
    width: 120,
    height: 80,
  });
  expect(await sharp(zip["same-pixelpress-2.jpg"]).metadata()).toMatchObject({
    width: 480,
    height: 320,
  });
});

test("fit, crop, and padding create the requested decoded geometry", async ({
  page,
}) => {
  await upload(page, ["photo.jpg"]);
  await chooseFormat(page, "PNG");
  await page
    .getByRole("switch", { name: "Resize images", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Unlock aspect ratio", exact: true })
    .click();
  await page.getByLabel("Width", { exact: true }).fill("120");
  await page.getByLabel("Height", { exact: true }).fill("120");
  await processAll(page, 1);
  expect(
    await sharp(await bytes(await downloadFirst(page))).metadata(),
  ).toMatchObject({ width: 120, height: 80 });
  for (const mode of [
    "Exact dimensions · crop",
    "Exact dimensions · padding",
  ]) {
    await page
      .getByRole("combobox", { name: "Resize behavior", exact: true })
      .click();
    await page.getByRole("option", { name: mode, exact: true }).click();
    await processAll(page, 1);
    const output = await bytes(await downloadFirst(page));
    expect(await sharp(output).metadata()).toMatchObject({
      width: 120,
      height: 120,
    });
    if (mode.endsWith("padding")) {
      const pixel = await sharp(output)
        .ensureAlpha()
        .extract({ left: 1, top: 1, width: 1, height: 1 })
        .raw()
        .toBuffer();
      expect(pixel[3]).toBe(0);
    }
  }
});

test("worker and OffscreenCanvas fallback processes real files", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "Worker", { value: undefined });
    Object.defineProperty(window, "OffscreenCanvas", { value: undefined });
    Object.defineProperty(window, "createImageBitmap", { value: undefined });
  });
  await page.reload();
  await upload(page, ["transparent.png", "rotated.jpg"]);
  await processAll(page, 2);
  const output = await bytes(await downloadFirst(page));
  expect((await sharp(output).metadata()).format).toBe("png");
});

test("images, names, and result data never leave the browser", async ({
  page,
}) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on("request", (req) => {
    if (/^https?:/.test(req.url()))
      requests.push({
        url: req.url(),
        method: req.method(),
        body: req.postData(),
      });
  });
  await page.getByTestId("file-input").setInputFiles({
    name: "PRIVATE_IMAGE_SENTINEL_732.jpg",
    mimeType: "image/jpeg",
    buffer: await readFile(fixture("photo.jpg")),
  });
  await expect(cards(page)).toHaveCount(1);
  await processAll(page, 1);
  await downloadFirst(page);
  await expect(
    page.getByText("Images stay on your device", { exact: true }),
  ).toBeVisible();
  expect(
    requests.every(
      (r) =>
        new URL(r.url).origin === "http://127.0.0.1:3000" &&
        ["GET", "HEAD"].includes(r.method) &&
        r.body === null,
    ),
  ).toBe(true);
  expect(JSON.stringify(requests)).not.toContain("PRIVATE_IMAGE_SENTINEL");
  const storage = await page.evaluate(() => ({
    local: JSON.stringify(localStorage),
    session: JSON.stringify(sessionStorage),
  }));
  expect(JSON.stringify(storage)).not.toContain("PRIVATE_IMAGE_SENTINEL");
});

test("preset routes initialize working settings; privacy and metadata exist", async ({
  page,
}) => {
  for (const [route, amount, unit] of [
    ["100kb", "100", "KB"],
    ["200kb", "200", "KB"],
    ["500kb", "500", "KB"],
    ["1mb", "1", "MB"],
  ]) {
    await page.goto(`/compress-image-to-${route}/`);
    await expect(
      page.getByRole("tab", { name: "Target size", exact: true }),
    ).toHaveAttribute("data-state", "active");
    await expect(
      page.getByLabel("Maximum file size", { exact: true }),
    ).toHaveValue(amount);
    await expect(
      page.getByRole("combobox", { name: "File size unit", exact: true }),
    ).toContainText(unit);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/compress-image-to-${route}/$`),
    );
  }
  await upload(page, ["photo.jpg"]);
  await processAll(page, 1);
  await expect(
    cards(page).getByText("Target reached", { exact: true }),
  ).toBeVisible();
  await page.goto("/resize-image/");
  await expect(
    page.getByRole("switch", { name: "Resize images", exact: true }),
  ).toBeChecked();
  await page.goto("/privacy/");
  await expect(
    page.getByRole("heading", { name: "Your images are yours.", exact: true }),
  ).toBeVisible();
});

test("mobile layout, keyboard operation, and dark theme", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Choose images", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Toggle color theme", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await upload(page, ["transparent.png"]);
  await processAll(page, 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("mobile-dark.png"),
    fullPage: true,
    animations: "disabled",
  });
  await cards(page)
    .first()
    .getByRole("button", { name: "Before & after", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page
    .getByRole("button", { name: "Toggle color theme", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("desktop-light.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath("desktop-empty.png"),
    animations: "disabled",
    fullPage: true,
  });
});
