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
for (const route of routes.filter(route => route.endsWith('.html'))) {
  const html = await fs.readFile(path.join(root, route), 'utf8');
  if (/data-page-fonts|\/assets\/fonts\/lxgw-wenkai\//.test(html)) throw new Error(`Legacy web font reference remains in ${route}`);
}
console.log('Draft exclusion, search publication status, and system-font-only pages verified.');
