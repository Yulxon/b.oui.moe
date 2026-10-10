import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadArticles } from "./lib/content.mjs";
import { markdownToHtml, stripMarkdown, prepareMarkdown } from "./lib/markdown.mjs";
import { escapeHtml, siteHeader, chronologicalContent, articleTools, backToTop } from "./lib/components.mjs";
import { renderPage } from "./templates/layout.mjs";
import { renderHome } from "./templates/home.mjs";
import { renderTaxonomy } from "./templates/taxonomy.mjs";
import { renderSearch } from "./templates/search.mjs";
import { renderAbout } from "./templates/about.mjs";
import { renderArticle } from "./templates/article.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const publicDir = path.join(root, "public");
const dataDir = path.join(root, "data");
const cacheDir = path.join(here, "cache");
const styleDir = path.join(here, "styles");

const siteStyleOrder = [
  "tokens.css",
  "palette.css",
  "base.css",
  "layout.css",
  "typography.css",
  "components.css",
];

function normalizeBase(value) {
  if (!value || value === "/") return "";
  return `/${String(value).replace(/^\/+|\/+$/g, "")}`;
}

async function concatStyles(files) {
  const chunks = [];
  for (const file of files) {
    const source = (await fs.readFile(path.join(styleDir, file), "utf8")).trim();
    chunks.push(`/* ===== ${file} ===== */\n${source}`);
  }
  return `${chunks.join("\n\n")}\n`;
}

export async function buildStyles() {
  await fs.mkdir(path.join(publicDir, "assets"), { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(publicDir, "assets", "site.css"), await concatStyles(siteStyleOrder), "utf8"),
    fs.writeFile(path.join(publicDir, "assets", "article.css"), await concatStyles(["article.css"]), "utf8"),
    fs.copyFile(path.join(styleDir, "custom.css"), path.join(publicDir, "assets", "custom.css")),
  ]);
}

export async function build({ quiet = false } = {}) {
  const base = normalizeBase(process.env.SITE_BASE || "");
  const href = pathname => `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const site = JSON.parse(await fs.readFile(path.join(dataDir, "site.json"), "utf8"));
  const aboutMarkdown = await fs.readFile(path.join(dataDir, "about.md"), "utf8");
  const articles = (await loadArticles(dataDir)).filter(post => post.status === "published");
  await prepareMarkdown([aboutMarkdown, ...articles.map(post => post.bodyMarkdown)]);
  const taxonomyHref = (kind, value) => href(`/taxonomy/?view=${kind}&${kind}=${encodeURIComponent(value)}`);
  const ctx = {
    site,
    aboutMarkdown,
    articles,
    base,
    href,
    taxonomyHref,
    escapeHtml,
    siteHeader,
    chronologicalContent,
    articleTools,
    backToTop,
    markdownToHtml,
  };

  await fs.rm(publicDir, { recursive: true, force: true });
  await fs.mkdir(path.join(publicDir, "assets"), { recursive: true });
  await fs.mkdir(cacheDir, { recursive: true });
  await buildStyles();

  for (const asset of ["site.js", "components.js", "search.js", "taxonomy.js", "icon.svg"]) {
    await fs.copyFile(path.join(here, "assets", asset), path.join(publicDir, "assets", asset));
  }

  async function writeRoute(route, html) {
    const dir = route === "/" ? publicDir : path.join(publicDir, route.replace(/^\/+|\/+$/g, ""));
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), html.replace(/^[ \t]+$/gm, ""), "utf8");
  }

  await writeRoute("/", renderPage(ctx, { title: site.title, current: "/", content: renderHome(ctx) }));
  await writeRoute("/taxonomy/", renderPage(ctx, { title: "分类", current: "/taxonomy/", content: renderTaxonomy(ctx), scripts: ["/assets/taxonomy.js"] }));
  await writeRoute("/search/", renderPage(ctx, { title: "搜寻", current: "/search/", content: renderSearch(ctx), scripts: ["/assets/search.js"] }));
  await writeRoute("/about/", renderPage(ctx, { title: "关于我", current: "/about/", content: renderAbout(ctx) }));
  for (const post of articles) {
    await writeRoute(`/articles/${post.slug}/`, renderPage(ctx, { title: post.title, description: post.summary, content: renderArticle(ctx, post), styles: ["/assets/article.css"] }));
  }

  const searchIndex = articles.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category || "未分类",
    tags: post.tags || [],
    summary: post.summary || "",
    body: stripMarkdown(post.bodyMarkdown || ""),
  }));
  await fs.writeFile(path.join(publicDir, "search-index.json"), JSON.stringify(searchIndex), "utf8");
  await fs.writeFile(path.join(publicDir, ".nojekyll"), "", "utf8");
  if (site.customDomain) await fs.writeFile(path.join(publicDir, "CNAME"), `${site.customDomain}\n`, "utf8");
  await fs.writeFile(path.join(cacheDir, "content.json"), JSON.stringify({ builtAt: new Date().toISOString(), base, articles: searchIndex }, null, 2), "utf8");

  if (!quiet) console.log(`Built ${articles.length} article(s) into ${path.relative(root, publicDir)}/ with base ${base || "/"}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) await build();
