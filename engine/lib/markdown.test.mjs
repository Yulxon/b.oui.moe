import test from 'node:test';
import assert from 'node:assert/strict';
import { markdownToHtml } from './markdown.mjs';
import { articleTools } from './components.mjs';

test('linked images resolve nested placeholders and preserve image query parameters', () => {
  const html = markdownToHtml('[![Email](https://example.com/email.svg?color=%238b8b86&width=32)](mailto:author@example.com)');
  assert.match(html, /<a href="mailto:author@example.com"><img /);
  assert.match(html, /src="https:\/\/example.com\/email.svg\?color=%238b8b86&amp;width=32"/);
  assert.match(html, /alt="Email"/);
  assert.doesNotMatch(html, /\u0000|&amp;amp;/);
});

test('static contents match unique heading anchors, including deep headings', () => {
  const headings = [];
  const html = markdownToHtml('# 中文\n\n## 中文\n\n```text\n## 不是标题\n```\n\n##### 深层标题\n\n## top', headings);
  assert.deepEqual(headings.map(h => h.id), ['中文', '中文-2', '深层标题', 'top-2']);
  assert.equal(headings[2].level, 5);
  const toc = articleTools(headings);
  assert.match(toc, /<summary aria-label="文章目录">/);
  assert.match(toc, /On this page/);
  assert.match(toc, /<details class="article-toc" open>/);
  for (const heading of headings) {
    assert.ok(html.includes(`id="${heading.id}"`));
    assert.ok(toc.includes(`href="#${encodeURIComponent(heading.id)}"`));
  }
  assert.doesNotMatch(toc, /不是标题/);
});

test('articles without headings hide their empty contents rail', () => {
  const headings = [];
  markdownToHtml('没有标题的正文。', headings);
  assert.match(articleTools(headings), /class="toc-rail" hidden/);
});

test('tables, nested lists and literal HTML use mature Markdown parsing', () => {
  const html = markdownToHtml('| 名称 | 数量 |\n| --- | ---: |\n| 示例 | 2 |\n\n- 外层\n  - 内层\n\n<script>alert(1)</script>');
  assert.match(html, /class="table-scroll"/);
  assert.match(html, /<thead>/);
  assert.match(html, /<td style="text-align:right">2<\/td>/);
  assert.match(html, /<ul>[\s\S]*<ul>/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(markdownToHtml('[坏链接](javascript:alert(1))'), /href="javascript:/);
});

test('build-time highlighting supports aliases and unknown-language fallback', async () => {
  const { prepareMarkdown } = await import('./markdown.mjs');
  const source = '```js\nconst answer = 42;\n```\n\n```unknown-language\n<x>\n```';
  await prepareMarkdown([source]);
  const html = markdownToHtml(source);
  assert.match(html, /class="shiki github-light"/);
  assert.match(html, /<span style="color:/);
  assert.match(html, /&lt;x&gt;/);
  assert.doesNotMatch(html, /<pre[^>]*style=/);
});

test('search text follows parsed Markdown and excludes code blocks and images', async () => {
  const { stripMarkdown } = await import('./markdown.mjs');
  assert.equal(stripMarkdown('# **标题**\n\n[链接](https://example.com) 与 `变量` &amp;\n\n![图片](image.png)\n\n```js\nsecretCode\n```'), '标题 链接 与 变量 &');
});
