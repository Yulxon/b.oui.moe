// Use the upstream Unicode subsets, but avoid a blocking request for the full CSS.
import { promises as fs } from 'node:fs';
import path from 'node:path';

export function parseFontFaces(css) {
  return [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(([declaration, body]) => {
    const src = body.match(/url\(['"]?([^'"\)]+)['"]?\)/)?.[1];
    const weight = body.match(/font-weight:\s*(\d+)/)?.[1];
    const range = body.match(/unicode-range:\s*([^;\n}]+)/)?.[1];
    if (!src || !weight || !range) throw new Error('Invalid self-hosted font declaration');
    const ranges = range.split(',').map(part => {
      const match = part.trim().match(/^U\+([\da-f]+)(?:-([\da-f]+))?$/i);
      if (!match) throw new Error(`Invalid font Unicode range: ${part}`);
      return [parseInt(match[1], 16), parseInt(match[2] || match[1], 16)];
    });
    return { src: src.replace(/^\.\//, ''), weight, ranges, declaration };
  });
}

function visibleText(html) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, name) => {
      if (!name.startsWith('#')) return entities[name.toLowerCase()];
      const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
      return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    });
}

export function fontResources(faces, html, extraText = '') {
  const points = [...new Set([...visibleText(html), ...extraText].map(char => char.codePointAt(0)))].sort((a, b) => a - b);
  const selected = faces.map(face => ({ ...face, points: points.filter(point => face.ranges.some(([start, end]) => point >= start && point <= end)) }))
    .filter(face => face.points.length);
  const css = selected.map(face => `@font-face{font-family:'LXGW WenKai';font-style:normal;font-weight:${face.weight};font-display:swap;src:url('/assets/fonts/lxgw-wenkai/${face.src}') format('woff2');unicode-range:${face.points.map(point => `U+${point.toString(16)}`).join(',')}}`).join('\n');
  const preloads = selected.filter(face => face.weight === '400').sort((a, b) => b.points.length - a.points.length).slice(0, 2).map(face => `/assets/fonts/lxgw-wenkai/${face.src}`);
  return { css, preloads, files: selected.map(face => face.src) };
}

export async function publishFontAssets(source, destination, faces, files) {
  await fs.rm(path.join(destination, 'files'), { recursive: true, force: true });
  await fs.mkdir(path.join(destination, 'files'), { recursive: true });
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (entry.isFile() && entry.name !== 'font.css') await fs.copyFile(path.join(source, entry.name), path.join(destination, entry.name));
  }
  for (const file of files) await fs.copyFile(path.join(source, file), path.join(destination, file));
  const css = faces.filter(face => files.has(face.src)).map(face => face.declaration).join('\n');
  await fs.writeFile(path.join(destination, 'font.css'), `${css}\n`, 'utf8');
}
