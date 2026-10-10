export function renderTaxonomy(ctx) {
  const counts = (kind) => {
    const map = new Map();
    for (const post of ctx.articles) {
      for (const name of kind === "category" ? [post.category || "未分类"] : new Set(post.tags || [])) {
        map.set(name, (map.get(name) || 0) + 1);
      }
    }
    return [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"));
  };
  const rail = (kind) => `<section data-rail="${kind}"${kind === "tag" ? " hidden" : ""}><h2 class="eyebrow">${kind === "category" ? "CATEGORIES" : "TAGS"} · ${counts(kind).length}</h2><div class="filter-list">${counts(kind).map(([name, count]) => `<a class="filter-link" href="${ctx.taxonomyHref(kind, name)}" data-filter="${kind}" data-value="${ctx.escapeHtml(name)}"><span>${ctx.escapeHtml(name)}</span><span>${count}</span></a>`).join("")}</div></section>`;
  const years = [...new Set(ctx.articles.map(post => post.date.slice(0, 4)))];
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const heatmap = `<div class="heatmap-scroll"><div class="heatmap"><span></span>${months.map(m => `<span class="month-label">${Number(m)}</span>`).join("")}${years.map(year => `<span class="heatmap-year">${year}</span>${months.map(month => {
    const matching = ctx.articles.filter(post => post.date.startsWith(`${year}-${month}`));
    return `<a class="heat-cell" data-count="${Math.min(matching.length, 4)}" data-month="${year}-${month}" href="${ctx.href(`/taxonomy/?month=${year}-${month}`)}" aria-label="${year}年${Number(month)}月，${matching.length}篇文章" title="${year}/${month} · ${matching.length}篇"></a>`;
  }).join("")}`).join("")}</div></div>`;
  return `<h1 class="visually-hidden">分类</h1><div class="taxonomy-tabs" aria-label="分类视图"><a href="${ctx.href("/taxonomy/?view=category")}" data-view="category" aria-current="page">目录 <small>category</small></a><a href="${ctx.href("/taxonomy/?view=tag")}" data-view="tag">标签 <small>tags</small></a></div><div class="taxonomy-layout"><section><div data-archive><p class="eyebrow">ARCHIVE · ${ctx.articles.length} ENTRIES · ${years.length} YEARS</p>${heatmap}<p class="heatmap-legend">less ${[0, 1, 2, 3, 4].map(level => `<span data-count="${level}" title="${level === 4 ? '4 篇及以上' : `${level} 篇`}"></span>`).join("")} more</p></div><div class="filter-status"><p id="filter-status" class="eyebrow" aria-live="polite">ALL · ${ctx.articles.length} ENTRIES</p><a id="filter-clear" href="${ctx.href("/taxonomy/")}" hidden>× clear</a></div><div id="taxonomy-posts">${ctx.chronologicalContent(ctx.articles, { href: ctx.href, taxonomyHref: ctx.taxonomyHref })}</div><p id="taxonomy-empty" class="post-meta" hidden>没有找到文章。</p></section><aside class="taxonomy-rail">${rail("category")}${rail("tag")}</aside></div>`;
}
