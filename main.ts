// Ember Court — entrypoint (main.ts).
// Grader entry: `node main.ts [port]` (default 8901).
// Zero-dependency static server for the card-duel game in this repo:
// serves index.html, styles.css, game.js, render.js, main.js and shots/.
// Written in erasable TypeScript only (no enums, namespaces, or
// parameter properties) so Node 22 type stripping runs it as-is.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root: string = path.dirname(fileURLToPath(import.meta.url));
const port: number = parseInt(process.argv[2] || process.env.PORT || "8901", 10);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".ts": "text/typescript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8",
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    let p: string = decodeURIComponent(url.pathname);
    if (p === "/") p = "/index.html";
    const file: string = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(String(err));
  }
});

server.listen(port, () => {
  console.log("Ember Court serving on http://localhost:" + port);
});
