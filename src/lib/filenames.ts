import type { ImageMime } from "./config";
export function uniqueFilename(
  input: string,
  mime: ImageMime,
  used: Set<string>,
) {
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[mime];
  const base =
    input
      .replace(/\.[^.]*$/, "")
      .normalize("NFKC")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || "image";
  let i = 1,
    name = `${base}-pixelpress.${extension}`;
  while (used.has(name.toLowerCase()))
    name = `${base}-pixelpress-${++i}.${extension}`;
  used.add(name.toLowerCase());
  return name;
}
