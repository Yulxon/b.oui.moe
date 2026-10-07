import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadArticles } from './lib/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const articles = await loadArticles(path.join(root, 'data'));
const routes = ['public/index.html', 'public/taxonomy/index.html', 'public/search/index.html', 'public/about/index.html', 'public/search-index.json', 'public/assets/fonts/lxgw-wenkai/OFL.txt'];
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
const fontRoot = path.join(root, 'public/assets/fonts/lxgw-wenkai');
const fontCss = await fs.readFile(path.join(fontRoot, 'font.css'), 'utf8');
for (const match of fontCss.matchAll(/url\(([^)]+)\)/g)) await fs.access(path.join(fontRoot, match[1].replace(/^['"]|['"]$/g, '')));
console.log('Draft exclusion, search publication status, and all font subset assets verified.');
