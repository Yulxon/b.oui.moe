import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const port = Number(process.env.PORT || 4321);
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let target = path.join(root, decodeURIComponent(url.pathname));
    const stat = await fs.stat(target).catch(() => null);
    if (stat?.isDirectory()) target = path.join(target, "index.html");
    if (!stat && path.extname(target) === "") target = path.join(target, "index.html");
    const data = await fs.readFile(target);
    res.writeHead(200, {"content-type": types[path.extname(target)] || "application/octet-stream"});
    res.end(data);
  } catch {
    res.writeHead(404, {"content-type":"text/plain; charset=utf-8"});
    res.end("404");
  }
}).listen(port, () => console.log(`Preview: http://localhost:${port}`));
