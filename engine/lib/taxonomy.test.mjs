import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTaxonomy } from '../templates/taxonomy.mjs';
import { escapeHtml, chronologicalContent } from './components.mjs';

const href = path => `/preview${path}`;
const taxonomyHref = (kind, value) => href(`/taxonomy/?view=${kind}&${kind}=${encodeURIComponent(value)}`);
const render = articles => renderTaxonomy({ articles, href, taxonomyHref, escapeHtml, chronologicalContent });
const post = (date, category, tags = []) => ({ date, category, tags, slug: `post-${date}`, title: date });
const railEntries = (html, kind) => {
  const section = html.match(new RegExp(`<section data-rail="${kind}"[^>]*>([\\s\\S]*?)</section>`))[1];
  return [...section.matchAll(/data-value="([^"]*)"><span>[^<]*<\/span><span>(\d+)<\/span>/g)]
    .map(([, name, count]) => [name, Number(count)]);
};
const cell = (html, month) => [...html.matchAll(/<a class="heat-cell"[^>]*>/g)]
  .map(match => match[0]).find(value => value.includes(`data-month="${month}"`));

test('heatmap preserves year encounter order, empty months and uncapped article labels', () => {
  const articles = [
    post('2025-12-31', '随笔'),
    ...Array.from({ length: 5 }, (_, i) => post(`2026-10-0${i + 1}`, '技术')),
    post('2025-01-01', '随笔'),
  ];
  const html = render(articles);
  assert.deepEqual([...html.matchAll(/class="heatmap-year">(\d+)</g)].map(match => match[1]), ['2025', '2026']);
  assert.equal([...html.matchAll(/class="heat-cell"/g)].length, 24);
  assert.match(cell(html, '2026-10'), /data-count="4"/);
  assert.match(cell(html, '2026-10'), /aria-label="2026年10月，5篇文章" title="2026\/10 · 5篇"/);
  assert.match(cell(html, '2026-10'), /href="\/preview\/taxonomy\/\?month=2026-10"/);
  assert.match(cell(html, '2026-02'), /data-count="0"/);
  assert.match(cell(html, '2026-02'), /aria-label="2026年2月，0篇文章" title="2026\/02 · 0篇"/);
  assert.match(cell(html, '2025-12'), /data-count="1"/);
  assert.match(cell(html, '2025-01'), /data-count="1"/);
  assert.match(html, /ARCHIVE · 7 ENTRIES · 2 YEARS/);
});

test('rails sort by count then Chinese name, use fallback categories and deduplicate tags per post', () => {
  const html = render([
    post('2026-10-04', '乙', ['乙', '乙', '甲']),
    post('2026-10-03', '甲', ['甲', '丙']),
    post('2026-10-02', undefined, ['乙']),
    post('2026-10-01', '', undefined),
    post('2025-12-31', '甲', ['甲']),
  ]);
  const categories = [['甲', 2], ['未分类', 2]].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
  assert.deepEqual(railEntries(html, 'category'), [...categories, ['乙', 1]]);
  assert.deepEqual(railEntries(html, 'tag'), [['甲', 3], ['乙', 2], ['丙', 1]]);
  assert.match(html, /CATEGORIES · 3/);
  assert.match(html, /TAGS · 3/);
  assert.match(html, /data-rail="tag" hidden/);
  assert.ok(html.includes(`href="${taxonomyHref('category', '未分类')}"`));

  const ties = ['乙', '丙', '甲'];
  const tiedHtml = render(ties.map((name, i) => post(`2026-01-0${i + 1}`, name, [name])));
  const expected = ties.sort((a, b) => a.localeCompare(b, 'zh-CN')).map(name => [name, 1]);
  assert.deepEqual(railEntries(tiedHtml, 'category'), expected);
  assert.deepEqual(railEntries(tiedHtml, 'tag'), expected);
});

test('empty archives retain empty rails and have no heatmap year rows', () => {
  const html = render([]);
  assert.deepEqual(railEntries(html, 'category'), []);
  assert.deepEqual(railEntries(html, 'tag'), []);
  assert.match(html, /ARCHIVE · 0 ENTRIES · 0 YEARS/);
  assert.match(html, /CATEGORIES · 0/);
  assert.match(html, /TAGS · 0/);
  assert.doesNotMatch(html, /class="heat-cell"|class="heatmap-year"/);
});
