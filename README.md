# Pixelpress

A complete, static image compressor and resizer. Built with Next.js, TypeScript, Tailwind CSS, locally owned shadcn/ui-style Radix components, and Lucide icons. All image processing runs in the browser; no image-processing server, authentication, database, analytics, or API keys are part of the application.

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open <http://localhost:3000>. For a production preview:

```sh
npm run build
npm run start
```

The production build generates `out/`, a fully static export. The included preview server accepts only GET and HEAD and binds to loopback. Set `PORT=3001` to use a different local port.

## Features

- Content-validated static JPEG, PNG, and WebP uploads; picker, drag-and-drop, batches, add/remove/clear, normalized thumbnails, dimensions, and per-file errors.
- Quality presets and a slider for lossy formats; decimal-byte targets with actual size verification, bounded search, and explicit optional dimension reduction.
- Real PNG optimization: exact palettes for images with at most 256 colors, adaptive PNG row filters, and level-9 streaming DEFLATE. Compares against native PNG output and keeps the smaller candidate. No lossy color quantization.
- Fit, center crop, transparent padding, or explicit stretching; width-only, height-only, percentage, aspect-ratio lock, and upscaling controls. Global settings plus per-image dialogs.
- Actual-result previews, individual downloads, collision-safe ZIPs, savings totals, target status, cancellation, retry, and stale-result tracking.
- Responsive light/dark UI, keyboard-operable Radix controls, visible focus states, live announcements, and centralized interface copy.

## Architecture

| Location                                              | Responsibility                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/lib/validation.ts`                               | Byte signatures, structure/CRC checks, animation rejection, size and pixel limits before decoding |
| `src/lib/capabilities.ts`                             | Real decoding and MIME-verified encoding probes using tiny bundled fixtures                       |
| `src/lib/canvas.ts`                                   | Canvas abstraction and orientation-aware image decoding                                           |
| `src/lib/dimensions.ts`                               | Pure resize, fit, crop, padding, and upscale geometry                                             |
| `src/lib/png.ts`                                      | Lossless optimization of decoded 8-bit RGBA pixels, with chunked processing                       |
| `src/lib/search.ts`                                   | Bounded quality sampling and refinement; retains feasible and smallest candidates                 |
| `src/lib/engine.ts`                                   | Combined resize/compress operation; MIME/signature verification; original-file retention          |
| `src/lib/processor.ts`, `src/workers/image.worker.ts` | Locally bundled worker execution, aborts, cleanup, and main-thread fallback                       |
| `src/lib/download.ts`, `src/lib/filenames.ts`         | Blob downloads, streamed ZIP storage, and correct collision-safe extensions                       |
| `src/components/image-tool.tsx`                       | Sequential batch queue, status, object-URL ownership, override and result state                   |
| `src/lib/i18n.ts`                                     | English interface dictionary and error messages                                                   |

Each worker owns one operation and is terminated after completion or cancellation. Without Worker/OffscreenCanvas support, the same engine runs with HTML canvas and yields between PNG blocks. Worker initialization/codec failures fall back to the browser path. Settings changes abort active processing; aborted results are ignored. Reprocessing always starts from the original `File`. Existing results retain their settings fingerprint and cannot be downloaded as current until reprocessed.

EXIF orientation is delegated once to `createImageBitmap({ imageOrientation: "from-image" })`, or the browser's `<img>` decoder when unavailable. There is no second manual rotation. Bitmaps, canvases, and replaced/removed object URLs are released. Download URLs are revoked after 30 seconds for Safari compatibility.

## Configuration

Limits are centralized in `src/lib/config.ts`:

| Limit                              | Default                                             |
| ---------------------------------- | --------------------------------------------------- |
| Files per batch                    | 20                                                  |
| Original file size                 | 25,000,000 bytes                                    |
| Total original batch size          | 150,000,000 bytes                                   |
| Decoded and output pixels          | 16,000,000                                          |
| Longest side                       | 8,192 pixels                                        |
| Quality candidates per dimension   | At most 12                                          |
| Dimension candidates when opted in | At most 5; each successive candidate scales by 0.72 |

The UI displays the configured file, batch, and pixel limits. Keep localized validation text consistent if changing limits. KB always means 1,000 bytes and MB 1,000,000 bytes.

The target search first samples seven qualities across 0.05–0.98. It then refines above the highest fitting sample, up to the attempt limit. Every candidate's actual byte count is considered, including non-monotonic outputs. The first feasible dimension candidate is preferred to preserve resolution. If none fits, the smallest actual output found is returned with **Target not reached**. PNG has no quality slider; it tests lossless optimization at the requested dimensions and, only if allowed, smaller dimensions.

An original is kept only when format is “Keep original,” resizing is off, and it either already meets the target or is no larger than the best encoded result. Explicit format conversion, resizing, crop, padding, and backgrounds are never skipped by substituting an original. An unchanged original retains its source metadata.

## Pages and deployment

Production: [pixelpress-imadaghoukad.netlify.app](https://pixelpress-imadaghoukad.netlify.app/), owned by **imadaghoukad’s team**. Manage it in the [Netlify dashboard](https://app.netlify.com/projects/pixelpress-imadaghoukad/overview).

All pages use one shared tool:

- `/` and `/compress-image/`
- `/resize-image/`
- `/compress-image-to-100kb/`, `/compress-image-to-200kb/`, `/compress-image-to-500kb/`, `/compress-image-to-1mb/`
- `/privacy/`

Set the deployment origin **before building**:

```sh
NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build
```

For this project's current production address, use `NEXT_PUBLIC_SITE_URL=https://pixelpress-imadaghoukad.netlify.app npm run build` when building locally before uploading `out/`.

This controls canonical URLs, sitemap URLs, and metadata. On Netlify builds, the primary project URL is read automatically from `URL` unless `NEXT_PUBLIC_SITE_URL` overrides it. The local fallback is `http://localhost:3000`. Rebuild after changing the production domain. Upload `out/` to any static host with directory index support. No Node server is required in production.

`netlify.toml` sets the build command, `out` publish directory, Node 24, and skips the unnecessary Next.js server runtime. To publish a prebuilt export, sign in to Netlify and upload the `out` directory through the dashboard, or use the official CLI:

```sh
npx netlify-cli login
npx netlify-cli deploy --prod --no-build --dir=out
```

The CLI lets you select the destination team and create or link a project. For Git-based deployment, import this repository into Netlify; the checked-in configuration supplies the build settings. The earlier `.openai/hosting.json` is unrelated to Netlify and is not used by this deployment.

The production document includes a Content Security Policy restricting scripts, styles, connections, and workers to the site origin (with inline hydration/styles and Blob workers/images as required). The application makes static GET/HEAD requests only. Images and filenames are never included in those requests. A hosting provider may add its own access controls and normal request logs.

## Verification

```sh
npm run fixtures                 # Regenerate deterministic real image fixtures
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:browser
npm run licenses
npm audit
```

Browser tests use the static production build and **real encoders**. They verify decoded output dimensions, format signatures, pixel colors/alpha, EXIF orientation, actual target bytes, ZIP contents, duplicate filenames, original-based reprocessing, cancellation, settings changes, input rejection, fallback behavior, mobile layout, keyboard interaction, and no image/filename transmission. Codec output is never mocked. `sharp` is used only to generate fixtures and independently inspect downloaded files in tests. Browser artifacts are in `test-results/` and `playwright-report/`.

On restricted machines, install browsers into a writable directory with `PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers npx playwright install` and pass the same environment variable when running tests. Local server/browser execution may require sandbox permission.

## Privacy and practical limitations

- Only static JPG/JPEG, PNG, and WebP are supported. Animated PNG/WebP, GIF, MPO/multi-frame JPEG, SVG, and HEIC are rejected. Renaming an extension does not bypass validation.
- Available encoders are tested on the device. If a requested MIME cannot be produced, the app reports an error instead of silently converting to PNG. Browser encoder behavior and file sizes differ across engines.
- In the tested WebKit build, WebP decoding works but WebP encoding is unavailable. Choose JPG or PNG explicitly to transform a WebP there. WebKit also produces a larger minimum JPEG for some inputs than Chromium; target status still uses the actual byte count.
- PNG optimization preserves the **decoded 8-bit canvas pixels**. It does not preserve original bit depth, ICC profiles, EXIF, hidden RGB under fully transparent pixels, HDR, or wide-gamut representation. JPEG/WebP are lossy when re-encoded. Browser color management may change colors.
- Targets are best-effort under bounded search and the user's constraints; the app makes no promise that every target or smaller result is possible. Dimension reduction does not continue indefinitely.
- Large images may exceed memory on lower-memory devices even below the limits. Processing is sequential to reduce peak use. Native decode/encode and small parts of the fallback path may briefly occupy the main thread; cancellation results are ignored immediately, but native browser work cannot always be interrupted mid-call.
- Aspect lock keeps the original ratio for each image. Entering a width or height while locked clears the other field so mixed-ratio batches remain correct. Unlock to enter a bounding box or choose explicit crop/padding/stretch. Exact crop/stretch requiring upscaling is rejected unless allowed; padding can enlarge the canvas without enlarging image pixels.
- Files live only in the current tab. Reloading or navigating to another public page clears the batch. Header Compress/Resize switches preserve the current batch. Local storage contains only theme, quality, and background preferences.

Dependency licenses are recorded in [docs/DEPENDENCY-LICENSES.md](docs/DEPENDENCY-LICENSES.md). The only compression utility dependency is MIT-licensed `fflate`, shared by PNG and ZIP code. Official references used: [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [shadcn/ui manual setup](https://ui.shadcn.com/docs/installation/manual), [fflate](https://github.com/101arrowz/fflate), and [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap).
