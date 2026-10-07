// Native static components, independently implemented after reviewing blog.nyaw.xyz.
// Source references and maintenance boundaries: engine/components.md.

export const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export function seasonFor(date) {
  const day = date.slice(5);
  if (day >= "02-04" && day < "05-06") return "春";
  if (day >= "05-06" && day < "08-08") return "夏";
  if (day >= "08-08" && day < "11-07") return "秋";
  return "冬";
}

export function siteHeader(site, current, href) {
  const order = ["/about/", "/taxonomy/", "/search/", "/"];
  const nav = [...site.nav].sort((a, b) => order.indexOf(a.href) - order.indexOf(b.href)).map(item => {
    const active = current === item.href ? ' aria-current="page"' : "";
    return `<a href="${href(item.href)}"${active}>${escapeHtml(item.label)}</a>`;
  }).join("");
  return `<header class="site-header">
    <a class="brand" href="${href("/")}"><span class="brand-mark" aria-hidden="true"></span><strong>${escapeHtml(site.title)}</strong></a>
    <button class="menu-toggle" type="button" aria-label="打开导航" aria-expanded="false" aria-controls="site-menu"><span></span><span></span><span></span></button>
    <div class="nav-wrap" id="site-menu"><nav class="site-nav" aria-label="主导航"><span class="nav-highlight" aria-hidden="true"></span>${nav}</nav></div>
  </header>`;
}

export function articleTools() {
  return `<aside class="toc-rail"><details class="article-toc" open><summary>On this page</summary><nav aria-label="文章目录"></nav><div class="reading-status"><span>READING</span><output aria-label="阅读进度">0%</output></div></details></aside>`;
}

export function backToTop() {
  return '<a class="back-top" href="#top" aria-label="返回顶部" hidden><span aria-hidden="true">⌃</span></a>';
}

export function chronologicalContent(posts, { href, taxonomyHref }) {
  const years = new Map();
  for (const post of posts) {
    const year = post.date.slice(0,4);
    const season = seasonFor(post.date);
    if (!years.has(year)) years.set(year, []);
    const groups = years.get(year);
    if (groups.at(-1)?.name !== season) groups.push({ name: season, posts: [] });
    groups.at(-1).posts.push(post);
  }
  const groups = [...years.entries()].map(([year, seasons]) => `
    <section class="year-group">
      <h2 class="year-label">${year}</h2>
      ${seasons.map(({ name, posts }) => `
        <div class="season">
          <div class="season-name" data-season="${name}">${name}</div>
          <div class="post-list">
            ${posts.map(post => `
              <div class="post-row" data-date="${escapeHtml(post.date)}" data-category="${escapeHtml(post.category || "未分类")}" data-tags="${escapeHtml(JSON.stringify(post.tags || []))}">
                <time class="post-date" datetime="${escapeHtml(post.date)}">${post.date.slice(5).replace("-", "/")}</time>
                <a class="post-title" href="${href(`/articles/${encodeURIComponent(post.slug)}/`)}">${escapeHtml(post.title)}</a>
                <a class="post-meta" href="${taxonomyHref("category", post.category || "未分类")}">${escapeHtml(post.category || "未分类")}</a>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </section>`).join("");

  return groups || '<p class="post-meta">这里还没有文章。</p>';
}
