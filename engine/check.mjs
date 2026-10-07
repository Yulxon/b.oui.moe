import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const articlesDir = path.join(here, "generated", "articles");
const files = (await fs.readdir(articlesDir)).filter(x => x.endsWith(".json"));
const slugs = new Set();
let failed = false;

for (const file of files) {
  const post = JSON.parse(await fs.readFile(path.join(articlesDir, file), "utf8"));
  for (const field of ["slug", "title", "date", "status", "bodyMarkdown"]) {
    if (!(field in post) || (field !== "bodyMarkdown" && !post[field])) { console.error(`${file}: missing ${field}`); failed = true; }
  }
  if (post.slug && !/^[a-z0-9][a-z0-9-]*$/.test(post.slug)) { console.error(`${file}: slug must be lowercase kebab-case`); failed = true; }
  if (post.slug && slugs.has(post.slug)) { console.error(`${file}: duplicate slug ${post.slug}`); failed = true; }
  slugs.add(post.slug);
  if (post.date && !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) { console.error(`${file}: invalid date ${post.date}`); failed = true; }
}

for (const expected of ["public/index.html", "public/taxonomy/index.html", "public/search/index.html", "public/about/index.html", "public/search-index.json"]) {
  try { await fs.access(path.join(root, expected)); }
  catch { console.error(`missing build output: ${expected}; run npm run build`); failed = true; }
}

if (failed) process.exit(1);
console.log(`Checks passed for ${files.length} generated article file(s).`);
