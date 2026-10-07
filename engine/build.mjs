import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markdownToHtml, stripMarkdown } from "./lib/markdown.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const publicDir = path.join(root, "public");
const generatedDir = path.join(here, "generated");
const articleDir = path.join(generatedDir, "articles");
const cacheDir = path.join(here, "cache");
const base = normalizeBase(process.env.SITE_BASE || "");

function normalizeBase(value) {
  if (!value || value === "/") return "";
  return `/${String(value).replace(/^\\/+|\\/+$/g, "")}`;
}
const href = (pathname) => `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const site = JSON.parse(await fs.readFile(path.join(generatedDir, "site.json"), "utf8"));
const articleFiles = (await fs.readdir(articleDir)).filter(name => name.endsWith(".json"));
const articles = [];
for (const file of articleFiles) {
  const post = JSON.parse(await fs.readFile(path.join(articleDir, file), "utf8"));
  if (post.status === "published") articles.push(post);
}
articles.sort((a, b) => b.date.localeCompare(a.date));

function seasonFor(date) {
  const month = Number(date.slice(5, 7));
  if ([3,4,5].includes(month)) return "春";
  if ([6,7,8].includes(month)) return "夏";
  if ([9,10,11].includes(month)) return "秋";
  return "冬";
}

function page({title, description = site.description, current = "", content, scripts = []}) {
  const nav = site.nav.map(item => {
    const isCurrent = current && item.href === current;
    return `<a href="${href(item.href)}"${isCurrent ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`;
  }).join("");
  return `<!doctype html>
<html lang="${escapeHtml(site.language || "zh-CN")}" data-theme="${escapeHtml(site.defaultTheme || "white")}" data-base="${escapeHtml(base)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}${title === site.title ? "" : ` · ${escapeHtml(site.title)}`}</title>
  <link rel="stylesheet" href="${href("/assets/site.css")}">
</head>
<body>
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="${href("/")}"><strong>${escapeHtml(site.title)}</strong><span>${escapeHtml(site.subtitle || "")}</span></a>
      <div class="nav-wrap">
        <nav class="site-nav" aria-label="主导航">${nav}</nav>
        <div class="theme-switcher" aria-label="主题">
          <button type="button" data-theme-value="blue" aria-label="浅蓝主题"></button>
          <button type="button" data-theme-value="pink" aria-label="粉色主题"></button>
          <button type="button" data-theme-value="white" aria-label="白色主题"></button>
        </div>
      </div>
    </header>
    <main>${content}</main>
  </div>
  <footer class="site-footer"><span>Data → Engine → Public</span><span>Static, small, and deliberately boring.</span></footer>
  <script src="${href("/assets/site.js")}" defer></script>
  ${scripts.map(src => `<script src="${href(src)}" defer></script>`).join("\n")}
</body>
</html>`;
}

function homeContent() {
  const years = new Map();
  for (const post of articles) {
    const year = post.date.slice(0,4);
    const season = seasonFor(post.date);
    if (!years.has(year)) years.set(year, new Map());
    if (!years.get(year).has(season)) years.get(year).set(season, []);
    years.get(year).get(season).push(post);
  }
  const order = ["秋", "夏", "春", "冬"];
  const groups = [...years.entries()].map(([year, seasons]) => `
    <section class="year-group">
      <div class="year-label">${year}</div>
      ${order.filter(name => seasons.has(name)).map(name => `
        <div class="season">
          <div class="season-name">${name}</div>
          <div class="post-list">
            ${seasons.get(name).map(post => `
              <div class="post-row">
                <span class="post-date">${post.date.slice(5).replace("-", "/")}</span>
                <a class="post-title" href="${href(`/articles/${encodeURIComponent(post.slug)}/`)}">${escapeHtml(post.title)}</a>
                <span class="post-meta">${escapeHtml(post.category || "未分类")}</span>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </section>`).join("");

  return `
    <section class="hero">
      <div class="eyebrow">append-only notebook</div>
      <h1>${escapeHtml(site.title)}</h1>
      <p>${escapeHtml(site.description)}</p>
    </section>
    ${groups || '<p class="post-meta">这里还没有文章。</p>'}`;
}

function taxonomyContent() {
  const categories = new Map(), tags = new Map(), years = new Map();
  for (const post of articles) {
    categories.set(post.category || "未分类", (categories.get(post.category || "未分类") || 0) + 1);
    for (const tag of post.tags || []) tags.set(tag, (tags.get(tag) || 0) + 1);
    const year = post.date.slice(0,4);
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(post);
  }
  const tagLink = (name, count) => `<a class="pill" href="${href(`/search/?q=${encodeURIComponent(name)}`)}">${escapeHtml(name)} · ${count}</a>`;
  return `
    <header class="page-head"><div class="eyebrow">archive · ${articles.length} entries</div><h1>分类</h1><p>目录、分类和标签都只是不同的入口。文章本身仍然按时间留在这里。</p></header>
    <div class="taxonomy-grid">
      <div><section class="taxonomy-section"><h2>目录 / Archive</h2>
        ${[...years.entries()].map(([year, posts]) => `<div class="archive-year"><h3>${year}</h3><div class="post-list">${posts.map(post => `<div class="post-row"><span class="post-date">${post.date.slice(5).replace("-", "/")}</span><a class="post-title" href="${href(`/articles/${encodeURIComponent(post.slug)}/`)}">${escapeHtml(post.title)}</a><span class="post-meta">${escapeHtml(post.category || "未分类")}</span></div>`).join("")}</div></div>`).join("")}
      </section></div>
      <aside>
        <section class="taxonomy-section"><h2>分类 / Category</h2><div class="pill-list">${[...categories.entries()].sort((a,b)=>b[1]-a[1]).map(([n,c])=>tagLink(n,c)).join("")}</div></section>
        <section class="taxonomy-section"><h2>标签 / Tags</h2><div class="pill-list">${[...tags.entries()].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0], "zh-CN")).map(([n,c])=>tagLink(n,c)).join("")}</div></section>
      </aside>
    </div>`;
}

const searchContent = () => `<header class="page-head"><div class="eyebrow">local static index</div><h1>搜寻</h1><p>不接服务器，也不把你的查询发到第三方。</p></header><div class="search-box"><input id="search-input" class="search-input" type="search" placeholder="标题、分类、标签、正文……" autocomplete="off"><div id="search-results" class="search-results"><p class="post-meta">搜索索引加载中。</p></div></div>`;

function articleContent(post) {
  const tags = (post.tags || []).map(tag => `<a href="${href(`/search/?q=${encodeURIComponent(tag)}`)}">#${escapeHtml(tag)}</a>`).join(" ");
  return `<div class="article-shell"><a class="article-back" href="${href("/")}">← 返回</a><article><header class="article-header"><div class="article-meta"><a href="${href(`/search/?q=${encodeURIComponent(post.category || "未分类")}`)}">${escapeHtml(post.category || "未分类")}</a><span>·</span><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time></div><h1>${escapeHtml(post.title)}</h1><p class="article-summary">${escapeHtml(post.summary || "")}</p></header><div class="prose">${markdownToHtml(post.bodyMarkdown || "")}</div><div class="article-meta" style="margin-top:3rem">${tags}</div></article></div>`;
}

await fs.rm(publicDir, { recursive: true, force: true });
await fs.mkdir(path.join(publicDir, "assets"), { recursive: true });
await fs.mkdir(cacheDir, { recursive: true });
for (const name of ["site.css","site.js","search.js"]) await fs.copyFile(path.join(here, "assets", name), path.join(publicDir, "assets", name));

async function writeRoute(route, html) {
  const dir = route === "/" ? publicDir : path.join(publicDir, route.replace(/^\\/+|\\/+$/g, ""));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
}

await writeRoute("/", page({ title: site.title, current: "/", content: homeContent() }));
await writeRoute("/taxonomy/", page({ title: "分类", current: "/taxonomy/", content: taxonomyContent() }));
await writeRoute("/search/", page({ title: "搜寻", current: "/search/", content: searchContent(), scripts: ["/assets/search.js"] }));
await writeRoute("/about/", page({ title: "关于我", current: "/about/", content: `<header class="page-head"><div class="eyebrow">about</div><h1>关于我</h1></header><div class="article-shell"><div class="prose">${markdownToHtml(site.aboutMarkdown || "")}</div></div>` }));
for (const post of articles) await writeRoute(`/articles/${post.slug}/`, page({ title: post.title, description: post.summary, content: articleContent(post) }));

const searchIndex = articles.map(post => ({slug: post.slug,title: post.title,date: post.date,category: post.category || "未分类",tags: post.tags || [],summary: post.summary || "",body: stripMarkdown(post.bodyMarkdown || "")}));
await fs.writeFile(path.join(publicDir, "search-index.json"), JSON.stringify(searchIndex), "utf8");
await fs.writeFile(path.join(publicDir, ".nojekyll"), "", "utf8");
if (site.customDomain) await fs.writeFile(path.join(publicDir, "CNAME"), `${site.customDomain}\n`, "utf8");
await fs.writeFile(path.join(cacheDir, "content.json"), JSON.stringify({ builtAt: new Date().toISOString(), base, articles: searchIndex }, null, 2), "utf8");
console.log(`Built ${articles.length} article(s) into ${path.relative(root, publicDir)}/ with base ${base || "/"}`);
