export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  "http://localhost:3000";
export const toolPages = {
  "compress-image": {
    title: "Compress JPG, PNG & WebP images",
    description:
      "Compress static JPG, PNG, and WebP images on your device. Choose quality or a target file size, preview results, and download your batch.",
    initial: "compress" as const,
  },
  "resize-image": {
    title: "Resize images by dimensions or percentage",
    description:
      "Resize JPG, PNG, and WebP images in your browser. Fit, crop, or pad to your dimensions and download individual files or a ZIP.",
    initial: "resize" as const,
  },
  "compress-image-to-100kb": {
    title: "Compress images to 100 KB",
    description:
      "Try a 100 KB target for JPG, PNG, and WebP images. Pixelpress verifies actual bytes and tells you when the target cannot be reached.",
    target: 100_000,
  },
  "compress-image-to-200kb": {
    title: "Compress images to 200 KB",
    description:
      "Fit your images to a 200 KB limit with verified byte sizes, local processing, and optional resizing.",
    target: 200_000,
  },
  "compress-image-to-500kb": {
    title: "Compress images to 500 KB",
    description:
      "Set a 500 KB target for your images. Find a practical quality on your device, compare results, and download a batch.",
    target: 500_000,
  },
  "compress-image-to-1mb": {
    title: "Compress images to 1 MB",
    description:
      "Try a 1 MB target for your JPG, PNG, and WebP images, with verified file sizes and optional smaller dimensions.",
    target: 1_000_000,
  },
};
export const homeMetadata = {
  title: "Pixelpress — Image compressor & resizer",
  description:
    "Make images smaller, right in your browser. Compress and resize JPG, PNG, and WebP files, choose a target size, and download your batch.",
};
