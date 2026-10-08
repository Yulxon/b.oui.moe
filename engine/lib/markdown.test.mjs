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
