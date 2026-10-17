import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve("out");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      `.${decodeURIComponent(new URL(req.url, "http://localhost").pathname)}`,
    );
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const file = (await stat(path)).isDirectory()
      ? resolve(path, "index.html")
      : path;
    res.setHeader(
      "Content-Type",
      mime[extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(await readFile(resolve(root, "404.html")).catch(() => "Not found"));
  }
}).listen(
  Number(process.env.PORT || process.argv[2] || 3000),
  "127.0.0.1",
  () =>
    console.log(
      `Local: http://127.0.0.1:${process.env.PORT || process.argv[2] || 3000}`,
    ),
);
