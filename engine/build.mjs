import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadArticles } from "./lib/content.mjs";
import { markdownToHtml, stripMarkdown } from "./lib/markdown.mjs";
import { escapeHtml, siteHeader, chronologicalContent, articleTools, backToTop } from "./lib/components.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const publicDir = path.join(root, "public");
const dataDir = path.join(root, "data");
const cacheDir = path.join(here, "cache");
const base = normalizeBase(process.env.SITE_BASE || "");

function normalizeBase(value) {
  if (!value || value === "/") return "";
  return `/${String(value).replace(/^\/+|\/+$/g, "")}`;
}
const href = (pathname) => `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

const site = JSON.parse(await fs.readFile(path.join(dataDir, "site.json"), "utf8"));
const aboutMarkdown = await fs.readFile(path.join(dataDir, "about.md"), "utf8");
const articles = (await loadArticles(dataDir)).filter(post => post.status === "published");

const taxonomyHref = (kind, value) => href(`/taxonomy/?view=${kind}&${kind}=${encodeURIComponent(value)}`);

function page({title, description = site.description, current = "", content, scripts = [], styles = []}) {
  return `<!doctype html>
<html lang="${escapeHtml(site.language || "zh-CN")}" data-base="${escapeHtml(base)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}${title === site.title ? "" : ` · ${escapeHtml(site.title)}`}</title>
  <link rel="stylesheet" href="${href("/assets/fonts/lxgw-wenkai/font.css")}">
  <link rel="stylesheet" href="${href("/assets/site.css")}">
  ${styles.map(src => `<link rel="stylesheet" href="${href(src)}">`).join("\n")}
</head>
<body id="top" class="${current === "/" ? "home-page" : "inner-page"}">
  <div class="site-shell">
    ${siteHeader(site, current, href)}
    <main>${content}</main>
  </div>
  <footer class="site-footer"><a href="${href("/")}">${escapeHtml(site.title)}</a><span>${escapeHtml(site.subtitle || "")}</span></footer>
  <script type="module" src="${href("/assets/site.js")}"></script>
  ${scripts.map(src => `<script src="${href(src)}" defer></script>`).join("\n")}
</body>
</html>`;
}


function homeContent() {
  return `<h1 class="visually-hidden">${escapeHtml(site.title)}</h1><div class="chronology">${chronologicalContent(articles, { href, taxonomyHref })}</div>`;
}

function taxonomyContent() {
  const counts = (kind) => {
    const map = new Map();
    for (const post of articles) {
      for (const name of kind === "category" ? [post.category || "未分类"] : new Set(post.tags || [])) {
        map.set(name, (map.get(name) || 0) + 1);
      }
    }
    return [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"));
  };
  const rail = (kind) => `<section data-rail="${kind}"><h2 class="eyebrow">${kind === "category" ? "CATEGORIES" : "TAGS"} · ${counts(kind).length}</h2><div class="filter-list">${counts(kind).map(([name, count]) => `<a class="filter-link" href="${taxonomyHref(kind, name)}" data-filter="${kind}" data-value="${escapeHtml(name)}"><span>${escapeHtml(name)}</span><span>${count}</span></a>`).join("")}</div></section>`;
  const years = [...new Set(articles.map(post => post.date.slice(0, 4)))];
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const heatmap = `<div class="heatmap-scroll"><div class="heatmap"><span></span>${months.map(m => `<span class="month-label">${Number(m)}</span>`).join("")}${years.map(year => `<span class="heatmap-year">${year}</span>${months.map(month => {
    const matching = articles.filter(post => post.date.startsWith(`${year}-${month}`));
    return `<a class="heat-cell" data-count="${Math.min(matching.length, 3)}" data-month="${year}-${month}" href="${href(`/taxonomy/?month=${year}-${month}`)}" aria-label="${year}年${Number(month)}月，${matching.length}篇文章" title="${year}/${month} · ${matching.length}篇"></a>`;
  }).join("")}`).join("")}</div></div>`;
  return `<h1 class="visually-hidden">分类</h1><div class="taxonomy-tabs" aria-label="分类视图"><a href="${href("/taxonomy/?view=category")}" data-view="category" aria-current="page">目录 <small>category</small></a><a href="${href("/taxonomy/?view=tag")}" data-view="tag">标签 <small>tags</small></a></div><div class="taxonomy-layout"><section><div data-archive><p class="eyebrow">ARCHIVE · ${articles.length} ENTRIES · ${years.length} YEARS</p>${heatmap}<p class="heatmap-legend">less <span></span><span></span><span></span><span></span> more</p></div><div class="filter-status"><p id="filter-status" class="eyebrow" aria-live="polite">ALL · ${articles.length} ENTRIES</p><a id="filter-clear" href="${href("/taxonomy/")}" hidden>× clear</a></div><div id="taxonomy-posts">${chronologicalContent(articles, { href, taxonomyHref })}</div><p id="taxonomy-empty" class="post-meta" hidden>没有找到文章。</p></section><aside class="taxonomy-rail">${rail("category")}${rail("tag")}</aside></div>`;
}

function searchContent() {
  return `<h1 class="visually-hidden">搜寻</h1><div class="search-box"><label class="visually-hidden" for="search-input">搜索文章</label><input id="search-input" class="search-input" type="search" placeholder="标题、分类、标签、正文……" autocomplete="off"><div id="search-results" class="search-results" aria-live="polite"><p class="post-meta">搜索索引加载中。</p></div></div>`;
}

function articleContent(post) {
  const headings = [];
  const body = markdownToHtml(post.bodyMarkdown || "", headings);
  const tags = (post.tags || []).map(tag => `<a href="${taxonomyHref("tag", tag)}">#${escapeHtml(tag)}</a>`).join(" ");
  return `<div class="reading-progress" aria-hidden="true"><span></span></div><div class="article-layout">${articleTools(headings)}<div class="article-shell"><a class="article-back" href="${href("/")}">← 返回</a><article><header class="article-header"><div class="article-meta"><a href="${taxonomyHref("category", post.category || "未分类")}">${escapeHtml(post.category || "未分类")}</a><span>·</span><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date.replaceAll("-", "."))}</time></div><h1>${escapeHtml(post.title)}</h1></header><div class="prose">${body}</div><div class="article-tags">${tags}</div></article></div></div>${backToTop()}`;
}

await fs.rm(publicDir, { recursive: true, force: true });
await fs.mkdir(path.join(publicDir, "assets"), { recursive: true });
await fs.mkdir(cacheDir, { recursive: true });
for (const asset of ["site.css", "article.css", "site.js", "components.js", "search.js", "taxonomy.js"]) {
  await fs.copyFile(path.join(here, "assets", asset), path.join(publicDir, "assets", asset));
}

await fs.cp(path.join(here, "assets", "fonts"), path.join(publicDir, "assets", "fonts"), { recursive: true });

async function writeRoute(route, html) {
  const dir = route === "/" ? publicDir : path.join(publicDir, route.replace(/^\/+|\/+$/g, ""));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html.replace(/^[ \t]+$/gm, ""), "utf8");
}

await writeRoute("/", page({ title: site.title, current: "/", content: homeContent() }));
await writeRoute("/taxonomy/", page({ title: "分类", current: "/taxonomy/", content: taxonomyContent(), scripts: ["/assets/taxonomy.js"] }));
await writeRoute("/search/", page({ title: "搜寻", current: "/search/", content: searchContent(), scripts: ["/assets/search.js"] }));
await writeRoute("/about/", page({ title: "关于我", current: "/about/", content: `<div class="article-shell about-page"><div class="prose">${markdownToHtml(aboutMarkdown)}</div></div>` }));
for (const post of articles) {
  await writeRoute(`/articles/${post.slug}/`, page({ title: post.title, description: post.summary, content: articleContent(post), styles: ["/assets/article.css"] }));
}

const searchIndex = articles.map(post => ({
  slug: post.slug,
  title: post.title,
  date: post.date,
  category: post.category || "未分类",
  tags: post.tags || [],
  summary: post.summary || "",
  body: stripMarkdown(post.bodyMarkdown || "")
}));
await fs.writeFile(path.join(publicDir, "search-index.json"), JSON.stringify(searchIndex), "utf8");
await fs.writeFile(path.join(publicDir, ".nojekyll"), "", "utf8");
if (site.customDomain) await fs.writeFile(path.join(publicDir, "CNAME"), `${site.customDomain}\n`, "utf8");
await fs.writeFile(path.join(cacheDir, "content.json"), JSON.stringify({ builtAt: new Date().toISOString(), base, articles: searchIndex }, null, 2), "utf8");

console.log(`Built ${articles.length} article(s) into ${path.relative(root, publicDir)}/ with base ${base || "/"}`);
