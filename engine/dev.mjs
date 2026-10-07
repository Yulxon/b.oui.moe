import http from "node:http";
import { watch } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, buildStyles } from "./build.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 4321);
const clients = new Set();
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

let timer = null;
let building = false;
let queued = false;

function notifyReload() {
  for (const response of clients) response.write("data: reload\n\n");
}

async function rebuild(kind) {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  try {
    if (kind === "styles") await buildStyles();
    else await build({ quiet: true });
    console.log(kind === "styles" ? "Styles updated." : "Site rebuilt.");
    notifyReload();
  } catch (error) {
    console.error(error);
  } finally {
    building = false;
    if (queued) {
      queued = false;
      await rebuild("full");
    }
  }
}

function schedule(kind) {
  clearTimeout(timer);
  timer = setTimeout(() => rebuild(kind), 90);
}

await build({ quiet: true });

watch(path.join(here, "styles"), { recursive: true }, () => schedule("styles"));
for (const target of ["templates", "lib", "assets"]) {
  watch(path.join(here, target), { recursive: true }, () => schedule("full"));
}
watch(path.join(root, "data"), { recursive: true }, () => schedule("full"));

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/__reload") {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      res.write("data: connected\n\n");
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }

    let target = path.join(publicDir, decodeURIComponent(url.pathname));
    const stat = await fs.stat(target).catch(() => null);
    if (stat?.isDirectory()) target = path.join(target, "index.html");
    if (!stat && path.extname(target) === "") target = path.join(target, "index.html");
    let data = await fs.readFile(target);

    if (path.extname(target) === ".html") {
      const script = `<script>const r=new EventSource('/__reload');r.onmessage=e=>{if(e.data==='reload')location.reload()};</script>`;
      data = Buffer.from(data.toString("utf8").replace("</body>", `${script}</body>`));
    }

    res.writeHead(200, {
      "content-type": types[path.extname(target)] || "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
  }
}).listen(port, () => {
  console.log(`Preview: http://localhost:${port}`);
  console.log("Style edits rebuild CSS only; Data/templates/lib edits rebuild the site.");
});
