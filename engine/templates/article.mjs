export function renderArticle(ctx, post) {
  const headings = [];
  const body = ctx.markdownToHtml(post.bodyMarkdown || "", headings);
  const tags = (post.tags || []).map(tag => `<a href="${ctx.taxonomyHref("tag", tag)}">#${ctx.escapeHtml(tag)}</a>`).join(" ");
  return `<div class="reading-progress" aria-hidden="true"><span></span></div><div class="article-layout">${ctx.articleTools(headings)}<div class="article-shell"><a class="article-back" href="${ctx.href("/")}">← 返回</a><article><header class="article-header"><div class="article-meta"><a href="${ctx.taxonomyHref("category", post.category || "未分类")}">${ctx.escapeHtml(post.category || "未分类")}</a><span>·</span><time datetime="${ctx.escapeHtml(post.date)}">${ctx.escapeHtml(post.date.replaceAll("-", "."))}</time></div><h1>${ctx.escapeHtml(post.title)}</h1></header><div class="prose">${body}</div><div class="article-tags">${tags}</div></article></div></div>${ctx.backToTop()}`;
}
