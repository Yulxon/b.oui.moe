import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArticle, loadArticles } from './content.mjs';

const article = (metadata = '', body = '\n原文 **粗体**。\n') => `---\ntitle: '中文: 标题'\ndate: '2026-10-08'\n${metadata}---\n${body}`;

test('reads author Markdown verbatim and standard YAML metadata', () => {
  const body = '\n# 原文\n\n```text\na: b\n```\n';
  const post = parseArticle(article('draft: false\ncategories:\n  - 随笔\ntags: [中文, "a: b"]\n', body), 'post.md');
  assert.equal(post.bodyMarkdown, body);
  assert.equal(post.title, '中文: 标题');
  assert.equal(post.status, 'published');
  assert.equal(post.category, '随笔');
  assert.deepEqual(post.tags, ['中文', 'a: b']);
  assert.equal(post.source, 'data/articles/post.md');
});

test('publication requires an explicit boolean false and valid metadata', () => {
  assert.equal(parseArticle(article(), 'post.md').status, 'draft');
  assert.throws(() => parseArticle(article('draft: "false"\n'), 'post.md'), /draft/);
  assert.throws(() => parseArticle(article().replace('2026-10-08', '2026-02-30'), 'post.md'), /calendar/);
  assert.throws(() => parseArticle(article('tags: 中文\n'), 'post.md'), /tags/);
});

test('direct edits are read on the next build and duplicate routes fail', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-content-'));
  try {
    await fs.mkdir(path.join(root, 'articles'));
    const file = path.join(root, 'articles', 'post.md');
    await fs.writeFile(file, article('draft: false\n', '初稿\n'));
    assert.equal((await loadArticles(root))[0].bodyMarkdown, '初稿\n');
    await fs.writeFile(file, article('draft: false\n', '直接修改后的正文\n'));
    assert.equal((await loadArticles(root))[0].bodyMarkdown, '直接修改后的正文\n');
    await fs.writeFile(path.join(root, 'articles', 'other.md'), article('slug: post\n'));
    await assert.rejects(loadArticles(root), /duplicate slug/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
