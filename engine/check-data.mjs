import { fileURLToPath } from 'node:url';
import { loadArticles } from './lib/content.mjs';

const articles = await loadArticles(fileURLToPath(new URL('../data/', import.meta.url)));
console.log(`Data checks passed for ${articles.length} editable Markdown article(s).`);
