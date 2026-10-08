export function renderPage(
  ctx,
  {
    title,
    description = ctx.site.description,
    current = "",
    content,
    scripts = [],
    styles = [],
  },
) {
  const header = ctx.siteHeader(ctx.site, current, ctx.href);
  const fonts = ctx.fontResources(`${header}${content}<span>Ი𐑼</span>`, current);
  return `<!doctype html>
<html lang="${ctx.escapeHtml(ctx.site.language || "zh-CN")}" data-base="${ctx.escapeHtml(ctx.base)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="${ctx.escapeHtml(description)}">
  <title>${ctx.escapeHtml(title)}${title === ctx.site.title ? "" : ` · ${ctx.escapeHtml(ctx.site.title)}`}</title>
  <link rel="icon" type="image/svg+xml" sizes="any" href="${ctx.href("/assets/icon.svg")}">
  ${fonts.preloads.map(src => `<link rel="preload" href="${src}" as="font" type="font/woff2" crossorigin>`).join('\n')}
  <style data-page-fonts>${fonts.css}</style>
  <link rel="stylesheet" href="${ctx.href("/assets/site.css")}">
  ${styles.map((src) => `<link rel="stylesheet" href="${ctx.href(src)}">`).join("\n")}
  <link rel="stylesheet" href="${ctx.href("/assets/custom.css")}">
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
