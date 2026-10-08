export function renderAbout(ctx) {
  const body = ctx.markdownToHtml(ctx.aboutMarkdown).replace(
    /<a([^>]+)>(<img[^>]* alt="([^"]*)"[^>]*>)<\/a>/g,
    (_, attributes, image, label) => `<a class="about-contact"${attributes}>${image.replace(/alt="[^"]*"/, 'alt=""')}<span>${label}</span></a>`,
  );
  return `<section class="about-page" aria-labelledby="about-title">
    <header class="about-heading">
      <img class="about-mark" src="${ctx.href('/assets/icon.svg')}" width="40" height="40" alt="">
      <p class="eyebrow">ABOUT</p>
      <h1 id="about-title">关于我</h1>
      <p class="about-subtitle">${ctx.escapeHtml(ctx.site.subtitle || '')}</p>
    </header>
    <div class="prose about-body">${body}</div>
  </section>`;
}
