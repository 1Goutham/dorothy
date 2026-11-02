// Local preview of the production build with the Dorothy AI API: http://localhost:8000
// Set HF_TOKEN (and optionally EMBED_URL / HF_CHAT_MODEL) to use BGE-M3 locally.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json" };
const port = Number(process.env.PORT) || 8000;

const api = await import("../api/ask.js");

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/api/ask") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request("http://localhost" + req.url, { method: req.method, headers: req.headers, body: req.method === "POST" ? Buffer.concat(chunks) : undefined });
    const r = await (req.method === "POST" ? api.POST(request) : api.GET(request));
    res.writeHead(r.status, Object.fromEntries(r.headers)).end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  if (path.endsWith("/")) path += "index.html";
  const file = normalize(join(dist, path));
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": types[".html"] }).end(await readFile(join(dist, "404.html")));
  }
}).listen(port, () => console.log(`Dorothy running at http://localhost:${port}`));
