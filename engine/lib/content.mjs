import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export function parseArticle(text, filename) {
  const frontmatter = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${filename}: missing YAML frontmatter`);
  const meta = parse(frontmatter[1]);
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error(`${filename}: metadata must be a mapping`);
  const fail = message => { throw new Error(`${filename}: ${message}`); };
  const slug = meta.slug ?? path.basename(filename, '.md');
  if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail('slug must be lowercase kebab-case');
  if (typeof meta.title !== 'string' || !meta.title.trim()) fail('title must be a nonempty string');
  if (typeof meta.date !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(meta.date)) fail('date must start with YYYY-MM-DD');
  const date = meta.date.slice(0, 10);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) fail(`invalid calendar date ${date}`);
  if (meta.draft !== undefined && typeof meta.draft !== 'boolean') fail('draft must be true or false');
  if (meta.description !== undefined && typeof meta.description !== 'string') fail('description must be a string');
  const names = field => {
    const value = meta[field] ?? [];
    if (!Array.isArray(value) || value.some(name => typeof name !== 'string' || !name.trim())) fail(`${field} must be a list of nonempty strings`);
    return [...new Set(value)];
  };
  return {
    slug, title: meta.title, date,
    status: meta.draft === false ? 'published' : 'draft',
    category: names('categories')[0] || '未分类',
    tags: names('tags'), summary: meta.description || '',
    source: `data/articles/${filename}`,
    bodyMarkdown: text.replace(/^\uFEFF/, '').slice(frontmatter[0].length),
  };
}

export async function loadArticles(dataRoot) {
  const directory = path.join(dataRoot, 'articles');
  const files = (await fs.readdir(directory)).filter(file => file.endsWith('.md')).sort();
  const articles = [];
  const slugs = new Set();
  for (const filename of files) {
    const post = parseArticle(await fs.readFile(path.join(directory, filename), 'utf8'), filename);
    if (slugs.has(post.slug)) throw new Error(`${filename}: duplicate slug ${post.slug}`);
    slugs.add(post.slug);
    articles.push(post);
  }
  return articles.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
