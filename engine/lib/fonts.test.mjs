import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFontFaces, fontResources } from './fonts.mjs';

const faces = parseFontFaces(`
@font-face { font-weight: 400; src: url('./files/latin.woff2'); unicode-range: U+20-7e; }
@font-face { font-weight: 400; src: url('./files/chinese.woff2'); unicode-range: U+4e00-4eff; }
@font-face { font-weight: 700; src: url('./files/bold.woff2'); unicode-range: U+20-7e, U+4e00-4eff; }
@font-face { font-weight: 400; src: url('./files/emoji.woff2'); unicode-range: U+1f600; }
`);

test('page fonts preserve both weights and decode visible text without selecting markup', () => {
  const result = fontResources(faces, '<p title="😀">&#x4e2d; &amp; A</p><!-- 😀 --><script>😀</script>');
  assert.match(result.css, /chinese.woff2/);
  assert.match(result.css, /bold.woff2/);
  assert.match(result.css, /U\+4e2d/);
  assert.match(result.css, /U\+26/);
  assert.doesNotMatch(result.css, /emoji.woff2/);
  assert.equal(result.preloads.length, 2);
  assert.ok(result.preloads.every(url => !url.includes('bold')));
});

test('dynamic search text includes glyphs absent from the initial page', () => {
  assert.doesNotMatch(fontResources(faces, '<p>A</p>').css, /chinese.woff2/);
  assert.match(fontResources(faces, '<p>A</p>', '中😀').css, /chinese.woff2/);
  assert.match(fontResources(faces, '<p>A</p>', '中😀').css, /U\+1f600/);
});
