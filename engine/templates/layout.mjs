import { siteUrl } from '../lib/seo.mjs';

export function renderPage(
  ctx,
  {
    title,
    description = ctx.site.description,
    current = "",
    route = current || '/',
    noindex = false,
    content,
    scripts = [],
    styles = [],
  },
) {
  const canonical = siteUrl(ctx.site, ctx.href, route);
  const pageTitle = title === ctx.site.title ? title : `${title} · ${ctx.site.title}`;
  const header = ctx.siteHeader(ctx.site, current, ctx.href);
  return `<!doctype html>
<html lang="${ctx.escapeHtml(ctx.site.language || "zh-CN")}" data-base="${ctx.escapeHtml(ctx.base)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="${ctx.escapeHtml(description)}">
  <title>${ctx.escapeHtml(pageTitle)}</title>
  ${canonical ? `<link rel="canonical" href="${ctx.escapeHtml(canonical)}">` : ''}
  ${noindex ? '<meta name="robots" content="noindex, follow">' : ''}
  <meta property="og:type" content="${route.startsWith('/articles/') ? 'article' : 'website'}">
  <meta property="og:title" content="${ctx.escapeHtml(pageTitle)}">
  <meta property="og:description" content="${ctx.escapeHtml(description)}">
  <meta property="og:site_name" content="${ctx.escapeHtml(ctx.site.title)}">
  ${canonical ? `<meta property="og:url" content="${ctx.escapeHtml(canonical)}">` : ''}
  <link rel="icon" type="image/svg+xml" sizes="any" href="${ctx.href("/assets/icon.svg")}">
  <link rel="stylesheet" href="${ctx.href("/assets/site.css")}">
  ${styles.map((src) => `<link rel="stylesheet" href="${ctx.href(src)}">`).join("\n")}

</head>
<body id="top" class="${current === "/" ? "home-page" : "inner-page"}">
  <div class="site-shell">
    ${header}
    <main>${content}</main>
  </div>
  <footer class="site-footer"><a class="footer-ending" href="${ctx.href("/")}" aria-label="返回首页"><span aria-hidden="true">Ი𐑼</span></a></footer>
  <script type="module" src="${ctx.href("/assets/site.js")}"></script>
  ${scripts.map((src) => `<script src="${ctx.href(src)}" defer></script>`).join("\n")}
</body>
</html>`;
}
