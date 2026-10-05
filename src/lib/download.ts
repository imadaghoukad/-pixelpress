import { Zip, ZipPassThrough } from "fflate";
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  // Delay revocation for Safari's download navigation.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export async function createZip(files: { name: string; blob: Blob }[]) {
  const parts: BlobPart[] = [];
  const zip = new Zip((error, data) => {
    if (error) throw error;
    parts.push(new Uint8Array(data));
  });
  // Images are already compressed: store avoids recompression and reduces CPU use.
  for (const file of files) {
    const entry = new ZipPassThrough(file.name);
    zip.add(entry);
    const reader = file.blob.stream().getReader();
    while (true) {
      const { value, done } = await reader.read();
      entry.push(value ?? new Uint8Array(), done);
      if (done) break;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  zip.end();
  return new Blob(parts, { type: "application/zip" });
}
