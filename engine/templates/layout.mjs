export function renderPage(ctx, { title, description = ctx.site.description, current = "", content, scripts = [], styles = [] }) {
  return `<!doctype html>
<html lang="${ctx.escapeHtml(ctx.site.language || "zh-CN")}" data-base="${ctx.escapeHtml(ctx.base)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="${ctx.escapeHtml(description)}">
  <title>${ctx.escapeHtml(title)}${title === ctx.site.title ? "" : ` · ${ctx.escapeHtml(ctx.site.title)}`}</title>
  <link rel="stylesheet" href="${ctx.href("/assets/fonts/lxgw-wenkai/font.css")}">
  <link rel="stylesheet" href="${ctx.href("/assets/site.css")}">
  ${styles.map(src => `<link rel="stylesheet" href="${ctx.href(src)}">`).join("\n")}
  <link rel="stylesheet" href="${ctx.href("/assets/custom.css")}">
</head>
<body id="top" class="${current === "/" ? "home-page" : "inner-page"}">
  <div class="site-shell">
    ${ctx.siteHeader(ctx.site, current, ctx.href)}
    <main>${content}</main>
  </div>
  <footer class="site-footer"><a href="${ctx.href("/")}">${ctx.escapeHtml(ctx.site.title)}</a><span>${ctx.escapeHtml(ctx.site.subtitle || "")}</span></footer>
  <script type="module" src="${ctx.href("/assets/site.js")}"></script>
  ${scripts.map(src => `<script src="${ctx.href(src)}" defer></script>`).join("\n")}
</body>
</html>`;
}
