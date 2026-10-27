import test from 'node:test';
import assert from 'node:assert/strict';
import { siteUrl, articleDescription, renderSitemap, renderRobots } from './seo.mjs';
import { renderPage } from '../templates/layout.mjs';
import { escapeHtml } from './components.mjs';

const site = { customDomain: 'b.oui.moe', title: 'Blog', description: 'A blog' };
const href = route => route;

test('canonical URLs use the production domain and respect a deployment base', () => {
  assert.equal(siteUrl(site, href, '/articles/example/'), 'https://b.oui.moe/articles/example/');
  assert.equal(siteUrl(site, route => `/blog${route}`, '/about/'), 'https://b.oui.moe/blog/about/');
  assert.equal(siteUrl({}, href, '/'), '');
});

test('article descriptions prefer author summaries and fall back to plain text', () => {
  assert.equal(articleDescription({ summary: 'Author summary', bodyMarkdown: 'Other text' }), 'Author summary');
  assert.equal(articleDescription({ summary: '', bodyMarkdown: '**Hello**\n\nworld' }), 'Hello world');
  assert.equal(Array.from(articleDescription({ summary: '', bodyMarkdown: '文'.repeat(200) })).length, 160);
});

test('sitemap lists supplied published routes but not internal search or query filters', () => {
  const xml = renderSitemap(site, href, [{ slug: 'example' }]);
  assert.match(xml, /https:\/\/b\.oui\.moe\/articles\/example\//);
  assert.match(xml, /<loc>https:\/\/b\.oui\.moe\/about\/<\/loc>/);
  for (const [, url] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    assert.doesNotMatch(url, /search|\?/);
  }
  assert.match(renderRobots(site, href), /Sitemap: https:\/\/b\.oui\.moe\/sitemap\.xml/);
  assert.doesNotMatch(renderRobots({}, href), /Sitemap:/);
});

test('page metadata has a route-specific canonical and supports search noindex', () => {
  const ctx = { site, href, escapeHtml, siteHeader: () => '', base: '' };
  const article = renderPage(ctx, { title: 'A & B', route: '/articles/example/', content: '' });
  assert.match(article, /rel="canonical" href="https:\/\/b\.oui\.moe\/articles\/example\/"/);
  assert.match(article, /property="og:type" content="article"/);
  assert.match(article, /property="og:title" content="A &amp; B · Blog"/);
  assert.doesNotMatch(article, /noindex/);
  const search = renderPage(ctx, { title: 'Search', current: '/search/', noindex: true, content: '' });
  assert.match(search, /name="robots" content="noindex, follow"/);
});
