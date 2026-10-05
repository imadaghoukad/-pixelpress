import { LIMITS } from "./config";
/** All product copy lives here so adding a locale does not require editing UI components. */
export const en = {
  brand: "pixelpress",
  compress: "Compress",
  resize: "Resize",
  privacy: "Privacy",
  theme: "Toggle color theme",
  close: "Close",
  cancel: "Cancel",
  remove: "Remove",
  retry: "Retry",
  reprocess: "Reprocess",
  download: "Download",
  preview: "Preview",
  original: "Original",
  result: "Result",
  output: "Output",
  save: "Save settings",
  reset: "Reset",
  done: "Done",
  heading: "Good images. Smaller files.",
  resizeHeading: "Just the right dimensions.",
  subtitle: "Compress, resize, and get your images ready for wherever they go.",
  resizeSubtitle:
    "Resize your images together, with the details kept in proportion.",
  local: "Images stay on your device",
  localShort: "Processed on your device",
  localDetail:
    "Your files never leave this browser. No uploads, accounts, or tracking.",
  uploadTitle: "Drop your images here",
  uploadSubtitle: "A little lighter. Just as useful.",
  browse: "Choose images",
  uploadOr: "or drag and drop them here",
  formats: "JPG, PNG, and WebP",
  limitSummary: `Up to ${LIMITS.files} images · ${LIMITS.fileBytes / 1_000_000} MB each`,
  allLimits: `${LIMITS.batchBytes / 1_000_000} MB per batch · ${LIMITS.pixels / 1_000_000} megapixels per image · ${LIMITS.side.toLocaleString("en-US")} px per side`,
  uploadLabel: "Upload JPG, PNG, or WebP images",
  add: "Add images",
  clear: "Clear all",
  yourImages: "Your images",
  emptyTitle: "Your next great image starts here",
  emptyDescription:
    "Choose a few files to get started. We’ll take care of the little details.",
  imageCount: (n: number) => `${n} ${n === 1 ? "image" : "images"}`,
  checking: "Checking images…",
  readyToGo: "Ready when you are",
  dropMore: "Drop to add images",
  dismiss: "Dismiss notification",
  batchEmpty: "Add images to start processing.",
  settings: "Settings",
  globalSettings: "Applied to all images",
  compression: "Compression",
  qualityMode: "Quality",
  targetMode: "Target size",
  quality: "Image quality",
  high: "High quality",
  balanced: "Balanced",
  small: "Small file",
  smaller: "Smaller file",
  sharper: "Higher quality",
  qualityHint:
    "Quality applies to JPG and WebP. PNG uses lossless optimization.",
  targetLabel: "Maximum file size",
  targetUnit: "File size unit",
  units: "1 KB = 1,000 bytes · 1 MB = 1,000,000 bytes",
  allowSmaller: "Allow smaller dimensions",
  allowSmallerHint: "If quality alone isn’t enough, try smaller dimensions.",
  formatLabel: "Output format",
  keepFormat: "Keep original",
  formatHint: "Keep the format, or choose a new one.",
  pngNote:
    "PNG is optimized without reducing colors. Some PNGs won’t get smaller. Resize or choose JPG / WebP for smaller files.",
  background: "JPG background",
  transparency: "JPG removes transparency. Transparent areas use this color.",
  resizeImages: "Resize images",
  resizeHint: "Keep original dimensions",
  byPixels: "Dimensions",
  byPercent: "Percentage",
  width: "Width",
  height: "Height",
  auto: "Auto",
  px: "px",
  percent: "Scale",
  lock: "Lock aspect ratio",
  unlock: "Unlock aspect ratio",
  resizeMode: "Resize behavior",
  fit: "Fit within dimensions",
  crop: "Exact dimensions · crop",
  pad: "Exact dimensions · padding",
  stretch: "Exact dimensions · stretch",
  fitHint: "Fits the whole image inside this box. No cropping.",
  cropHint: "Fills the exact size by cropping evenly from the center.",
  padHint:
    "Keeps the whole image and adds transparent padding (background color for JPG).",
  stretchHint:
    "Changes proportions to fill the exact size. Images may look distorted.",
  allowUpscale: "Allow upscaling",
  upscaleHint: "Enlarging an image can make it less sharp.",
  dimensionsHint: "Leave one dimension empty to calculate it automatically.",
  process: "Process images",
  processing: "Processing…",
  processingCount: (n: number, total: number) => `Processing ${n} of ${total}`,
  candidateCount: (n: number) =>
    `${n} ${n === 1 ? "candidate" : "candidates"} encoded`,
  cancelBatch: "Cancel processing",
  downloadAll: "Download all",
  zipBusy: "Creating ZIP…",
  zipHint: "All current results, in one ZIP",
  resultCount: (n: number) => `${n} ${n === 1 ? "result" : "results"} ready`,
  saved: "Saved",
  larger: "Larger than original",
  noSavings: "Same file size",
  saving: (n: string) => `${n}% smaller`,
  targetReached: "Target reached",
  targetMissed: "Target not reached",
  targetAlternatives:
    "Try a larger target, enable smaller dimensions, or explicitly choose JPG / WebP.",
  originalKept: "Original kept — already the smaller suitable file.",
  outdated: "Outdated",
  outdatedHint: "Settings changed. Reprocess to update this result.",
  downloadOutdated: "Reprocess before downloading",
  estimated: "Planned output",
  adjusted: "May be smaller to meet target",
  bytesExact: (n: number) => `${n.toLocaleString("en-US")} bytes`,
  overrides: "Image settings",
  usingOverrides: "Custom settings",
  overrideDescription: "Change settings just for this image.",
  useGlobal: "Use global settings",
  applyOverrides: "Apply to this image",
  beforeAfter: "Before & after",
  beforeAfterDescription:
    "Compare the original with the actual encoded result.",
  noResult: "Process this image to see the result.",
  completedAnnouncement: (n: number) =>
    `Processing finished. ${n} results are ready.`,
  cancelledAnnouncement:
    "Processing cancelled. Completed results are still available.",
  validatingAnnouncement: "Validating image files.",
  uploadedAnnouncement: (n: number) => `${n} images added.`,
  statuses: {
    ready: "Ready",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  },
  errors: {
    invalidTarget: "Enter a target between 1 byte and 150 MB.",
    invalidDimensions:
      "Enter positive, whole pixel dimensions or a positive percentage.",
    missingDimensions: "Enter a width, a height, or both.",
    pixelLimit: "This image exceeds 16 megapixels or 8,192 pixels on one side.",
    upscaleRequired:
      "This exact size requires upscaling. Enable it or choose smaller dimensions.",
    emptyFile: "This file is empty.",
    fileLimit: "This file is larger than the 25 MB limit.",
    countLimit: "A batch can contain up to 20 images.",
    batchLimit: "This would exceed the 150 MB batch limit.",
    corruptFile: "The image is damaged or incomplete. Try another copy.",
    animatedFile:
      "Animated or multi-frame images are not supported. Choose a static JPG, PNG, or WebP.",
    unsupportedAnimation:
      "GIF and animated images are not supported. Choose a static JPG, PNG, or WebP.",
    unsupportedFile:
      "Unsupported file content. Choose a static JPG, PNG, or WebP.",
    decodeFailed:
      "This browser couldn’t decode the image. The file may be damaged or unsupported.",
    encodeUnavailable:
      "This browser cannot encode the requested format. Choose another format explicitly.",
    memoryError:
      "Not enough memory to process this image. Try a smaller image or fewer files.",
    encodeFailed:
      "The browser couldn’t encode this image. Try smaller dimensions and retry.",
    invalidSettings: "Check the quality and background-color settings.",
    processingFailed:
      "This image couldn’t be processed. Try smaller dimensions and retry.",
    zipFailed: "The ZIP could not be created. Try individual downloads.",
    workerFallback: "This browser couldn’t decode the image.",
  } as Record<string, string>,
  tipsTitle: "Less file. More possibility.",
  tips: [
    {
      title: "Choose your images",
      description:
        "Add a single image or a whole batch of JPG, PNG, and WebP files.",
    },
    {
      title: "Make them fit",
      description:
        "Choose a quality, set a file size, or dial in the dimensions.",
    },
    {
      title: "Take them with you",
      description:
        "Compare the results, then download one image or a ZIP of the batch.",
    },
  ],
  shortcuts: "Have a size limit?",
  preset: (size: string) => `Compress to ${size}`,
  faqTitle: "A few good things to know",
  faqs: [
    {
      question: "Do my images get uploaded?",
      answer:
        "No. Decoding, resizing, compression, previews, and ZIP creation happen in your browser. Images are held in memory and disappear when you close or reload the page. Only theme, quality, and background-color preferences are saved on your device.",
    },
    {
      question: "Can every image fit my target size?",
      answer:
        "No. Pixelpress tests a bounded set of actual outputs and keeps the highest practical quality it finds within your limit. If no candidate fits your constraints, you’ll see “Target not reached” and the smallest result found. You can enable smaller dimensions, increase the limit, or choose a different format.",
    },
    {
      question: "How are PNGs compressed?",
      answer:
        "PNG optimization uses an exact color palette when possible, adaptive row filters, and DEFLATE compression without color quantization. The smaller of this optimized PNG and the browser’s PNG is used. Some PNGs are already well optimized; resizing or explicit conversion may help more.",
    },
    {
      question: "What happens to transparency and photo metadata?",
      answer:
        "PNG and WebP preserve transparency. JPG fills transparent areas with your chosen background color. Re-encoded files use the browser’s decoded color data, normalize photo orientation, and do not carry over EXIF or other source metadata. An unchanged original keeps its original metadata. HDR, wide-gamut, and 16-bit originals may change when converted to 8-bit canvas pixels.",
    },
    {
      question: "Which images and browsers are supported?",
      answer:
        "Static JPG, PNG, and WebP images are supported when your browser can decode them. Available output formats are tested on your device. Animated images, GIF, HEIC, and SVG are not supported. Large files are limited to protect browser memory; lower-memory devices may need smaller images.",
    },
  ],
  footer: "Made for the small things.",
  footerFormats: "JPG · PNG · WebP",
  privacyHeading: "Your images are yours.",
  privacyIntro: "Pixelpress processes images entirely in your browser.",
  privacySections: [
    {
      title: "Image processing",
      text: "Image contents, filenames, previews, and results are never uploaded by the tool. A locally bundled worker performs processing where supported, with a browser canvas fallback. Downloads and ZIP files are created on your device.",
    },
    {
      title: "Storage",
      text: "Images live only in this tab’s memory. Closing or reloading the page clears the batch. Local storage is used only for your theme, quality, and JPG background preferences. No images or filenames are saved there.",
    },
    {
      title: "Network requests",
      text: "Your browser requests the website’s static HTML, JavaScript, CSS, and locally hosted assets. There are no analytics, tracking scripts, third-party fonts, external image APIs, or image-upload endpoints in this application. Your hosting provider may retain ordinary access logs, and a private hosting preview may use its own access controls.",
    },
    {
      title: "Metadata and downloads",
      text: "Re-encoding normalizes EXIF orientation and removes source metadata. If the original is kept because it is already suitable, its metadata remains. Downloaded files are saved wherever your browser normally saves downloads.",
    },
  ],
  back: "Back to the tool",
  capabilityChecking: "Checking browser support…",
  capabilityUnsupported: "Some formats are unavailable in this browser.",
} as const;
export function errorText(error: unknown) {
  const key =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "processingFailed";
  return en.errors[key] ?? en.errors.processingFailed;
}
