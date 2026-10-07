export function renderHome(ctx) {
  return `<h1 class="visually-hidden">${ctx.escapeHtml(ctx.site.title)}</h1><div class="chronology">${ctx.chronologicalContent(ctx.articles, { href: ctx.href, taxonomyHref: ctx.taxonomyHref })}</div>`;
}
