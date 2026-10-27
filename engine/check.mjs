import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadArticles } from './lib/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const articles = await loadArticles(path.join(root, 'data'));
const routes = ['public/index.html', 'public/taxonomy/index.html', 'public/search/index.html', 'public/about/index.html', 'public/search-index.json'];
for (const post of articles.filter(post => post.status === 'published')) routes.push(`public/articles/${post.slug}/index.html`);
for (const route of routes) await fs.access(path.join(root, route));
console.log(`Checks passed for ${articles.length} Markdown article(s) and required build output.`);
const search = JSON.parse(await fs.readFile(path.join(root, 'public/search-index.json'), 'utf8'));
const published = articles.filter(post => post.status === 'published');
if (search.length !== published.length || search.some(item => !published.some(post => post.slug === item.slug))) throw new Error('Search index does not match published articles');
for (const post of articles.filter(post => post.status === 'draft')) {
  try {
    await fs.access(path.join(root, 'public/articles', post.slug, 'index.html'));
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  throw new Error(`Draft article was published: ${post.slug}`);
}
console.log('Draft exclusion and search publication status verified.');
const site = JSON.parse(await fs.readFile(path.join(root, 'data/site.json'), 'utf8'));
await fs.access(path.join(root, 'public/robots.txt'));
if (site.customDomain) {
  const { siteUrl, renderSitemap } = await import('./lib/seo.mjs');
  const home = await fs.readFile(path.join(root, 'public/index.html'), 'utf8');
  const base = home.match(/data-base="([^"]*)"/)?.[1] || '';
  const href = route => `${base}${route}`;
  const sitemap = await fs.readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
  if (sitemap !== renderSitemap(site, href, published)) throw new Error('Sitemap does not match published routes');
  for (const route of ['/', '/taxonomy/', '/about/', '/search/', ...published.map(post => `/articles/${post.slug}/`)]) {
    const html = await fs.readFile(path.join(root, 'public', route, 'index.html'), 'utf8');
    if (!html.includes(`rel="canonical" href="${siteUrl(site, href, route)}"`)) throw new Error(`Missing canonical: ${route}`);
    if (route === '/search/' && !html.includes('content="noindex, follow"')) throw new Error('Search page must be noindex');
  }
}
console.log('Search engine metadata and sitemap verified.');
