# Verification record

Run on 5 October 2026 against the static production export on macOS, using real image encoders and fixtures.

| Check                    | Result                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prettier formatting      | Passed                                                                                                                                                                    |
| ESLint                   | Passed, no warnings                                                                                                                                                       |
| TypeScript               | Passed                                                                                                                                                                    |
| Vitest                   | 49 tests passed                                                                                                                                                           |
| Next.js production build | Passed; all tool and privacy routes statically exported                                                                                                                   |
| Chromium browser suite   | 21 tests passed                                                                                                                                                           |
| WebKit browser suite     | 21 tests passed                                                                                                                                                           |
| Firefox browser suite    | Could not run: Playwright Firefox exits before launching with “Could not find profile folder.” Retried with `TMPDIR=/private/tmp` and the same launch error persisted.    |
| Runtime privacy          | Passed in Chromium and WebKit: only same-origin GET/HEAD requests, no request bodies, no image filenames in requests, and no images/filenames in local or session storage |
| Visual inspection        | Desktop light and mobile dark screenshots inspected; no horizontal overflow at 390 px                                                                                     |
| Dependency audit         | Zero reported vulnerabilities after updating development tools                                                                                                            |
| Licenses                 | All 391 lockfile package entries reviewed; no unrecognized license expressions                                                                                            |

Browser tests check actual downloaded bytes, MIME/decoded formats and dimensions, PNG pixel equivalence, JPEG background colors, EXIF orientation, target success/failure, optional smaller dimensions, fit/crop/padding, ZIP entries, filename collisions, original-based reprocessing, animation/corruption/size rejection, cancellation, settings invalidation, retry, removal, overrides, drag-and-drop, keyboard controls, page presets, and worker/canvas fallback.

WebKit in this environment decodes WebP but does not encode it. The suite verifies that the app reports the failure without silently substituting another format, then successfully retries after the user explicitly selects JPG. Its minimum JPEG size is also different from Chromium's; success tests use a feasible 30 KB target, while impossible targets still verify actual output bytes and the “Target not reached” state.

The Firefox launch failure is an environment limitation, not a passing compatibility check. Run `npm run test:browser -- --project=firefox` on a machine where Playwright Firefox can launch before claiming Firefox verification.

## Netlify deployment — 5 October 2026

Published the static export to **imadaghoukad’s team** as [pixelpress-imadaghoukad.netlify.app](https://pixelpress-imadaghoukad.netlify.app/). Netlify project ID: `9cfdd862-5d80-4504-938a-90c05f57f900`. Production deploy ID: `6ac3c07282a4720790fb02fd`.

The production build, TypeScript check, and changed-file formatting check passed. Canonical URLs for all eight public pages, the sitemap, and robots metadata point to the Netlify hostname. The uploaded ZIP passed integrity checks and contains 79 static files.

The live site loaded successfully in the user's Chrome browser. The generated 480 × 320 JPEG fixture compressed from 197.6 KB to 71,866 bytes (63.6% smaller), displayed Completed, and downloaded successfully. The existing local Chromium/WebKit suites above cover the wider feature set; they were not rerun against the remote deployment.
