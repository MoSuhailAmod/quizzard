// Tiny static file server using only Node built-ins.
// Usage: node scripts/serve.mjs <folder>   (PORT env var overrides 3000)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "src");
const port = Number(process.env.PORT ?? 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = join(root, normalize(urlPath));
    if (!file.startsWith(root)) throw new Error("outside root");
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
