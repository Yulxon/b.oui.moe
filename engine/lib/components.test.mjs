import test from 'node:test';
import assert from 'node:assert/strict';
import { seasonFor, siteHeader, chronologicalContent } from './components.mjs';

const href = path => `/preview${path}`;
const taxonomyHref = (kind, value) => href(`/taxonomy/?view=${kind}&${kind}=${encodeURIComponent(value)}`);

test('season labels change on the reference solar-term boundaries', () => {
  for (const [day, season] of [['02-03', '冬'], ['02-04', '春'], ['05-05', '春'], ['05-06', '夏'], ['08-07', '夏'], ['08-08', '秋'], ['11-06', '秋'], ['11-07', '冬']]) {
    assert.equal(seasonFor(`2026-${day}`), season);
  }
});

test('December and January winter groups preserve descending chronology', () => {
  const posts = ['2026-12-01', '2026-09-01', '2026-01-01'].map((date, i) => ({ date, slug: `post-${i}`, title: date, category: '记录', tags: [] }));
  const html = chronologicalContent(posts, { href, taxonomyHref });
  assert.equal((html.match(/data-season="冬"/g) || []).length, 2);
  assert.ok(html.indexOf('2026-12-01') < html.indexOf('2026-09-01'));
  assert.ok(html.indexOf('2026-09-01') < html.indexOf('2026-01-01'));
  assert.match(html, /href="\/preview\/articles\/post-0\/"/);
});

test('shared header escapes author metadata and preserves accessible links', () => {
  const html = siteHeader({ title: '<title>', nav: [{ label: 'Search & find', href: '/search/' }] }, '/search/', href);
  assert.match(html, /&lt;title&gt;/);
  assert.match(html, /href="\/preview\/search\/" aria-current="page"/);
  assert.match(html, /Search &amp; find/);
  assert.match(html, /aria-controls="site-menu"/);
  assert.doesNotMatch(html, /theme/);
});
