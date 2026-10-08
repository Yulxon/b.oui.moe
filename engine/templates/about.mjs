export function renderAbout(ctx) {
  return `<div class="article-shell about-page"><div class="prose">${ctx.markdownToHtml(ctx.aboutMarkdown)}</div></div>`;
}
