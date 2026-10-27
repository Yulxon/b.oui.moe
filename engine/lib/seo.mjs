import { escapeHtml } from './components.mjs';
import { stripMarkdown } from './markdown.mjs';

export function siteUrl(site, href, route) {
  if (!site.customDomain) return '';
  return new URL(href(route), `https://${site.customDomain}`).href;
}

export function articleDescription(post) {
  return post.summary.trim() || Array.from(stripMarkdown(post.bodyMarkdown).replace(/\s+/g, ' ').trim()).slice(0, 160).join('');
}

export function renderSitemap(site, href, articles) {
  const routes = ['/', '/taxonomy/', '/about/', ...articles.map(post => `/articles/${post.slug}/`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${escapeHtml(siteUrl(site, href, route))}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export function renderRobots(site, href) {
  const sitemap = siteUrl(site, href, '/sitemap.xml');
  return `User-agent: *\nAllow: /\n${sitemap ? `\nSitemap: ${sitemap}\n` : ''}`;
}
