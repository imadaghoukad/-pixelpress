import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const port = Number(process.env.PORT || 3000);
const root = path.resolve("out");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    try {
      let file = path.resolve(
        root,
        "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
      );
      if (file !== root && !file.startsWith(root + path.sep))
        throw new Error("Invalid path");
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      const bytes = await readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      });
      res.end(req.method === "HEAD" ? undefined : bytes);
    } catch {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(
        await readFile(path.join(root, "404.html")).catch(() => "Not found"),
      );
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Local: http://localhost:${port}`),
  );
