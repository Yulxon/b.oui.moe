import MarkdownIt from 'markdown-it';
import { bundledLanguages, bundledLanguagesAlias, createHighlighter } from 'shiki';

// One highlighter per process; only load grammars used by the current content.
const highlighter = await createHighlighter({ themes: ['github-light'], langs: [] });
const languageFor = name => Object.hasOwn(bundledLanguages, name) ? name
  : Object.hasOwn(bundledLanguagesAlias, name) ? name : null;

export async function prepareMarkdown(sources) {
  const languages = new Set();
  for (const source of sources) {
    for (const token of markdown.parse(String(source), {})) {
      if (token.type !== 'fence') continue;
      const language = languageFor(token.info.trim().split(/\s+/)[0]);
      if (language) languages.add(language);
    }
  }
  await Promise.all([...languages].map(language => highlighter.loadLanguage(language)));
}

const markdown = new MarkdownIt({
  html: false,
  typographer: false,
  highlight(code, info) {
    const language = languageFor(info);
    if (!language || !highlighter.getLoadedLanguages().includes(language)) return '';
    return highlighter.codeToHtml(code.replace(/\n$/, ''), {
      lang: language,
      theme: 'github-light',
      // Page CSS controls the code block surface, not the highlighter theme.
      transformers: [{ pre(node) { delete node.properties.style; } }],
    });
  },
});

const imageRule = markdown.renderer.rules.image;
markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
  tokens[index].attrSet('loading', 'lazy');
  return imageRule(tokens, index, options, env, renderer);
};
markdown.renderer.rules.table_open = () => '<div class="table-scroll" role="region" aria-label="表格" tabindex="0"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';

function inlineText(tokens = []) {
  return tokens.map(token => {
    if (token.type === 'image') return inlineText(token.children);
    if (token.type === 'text' || token.type === 'code_inline') return token.content;
    if (token.type === 'softbreak' || token.type === 'hardbreak') return ' ';
    return '';
  }).join('');
}

export function markdownToHtml(source = '', headings = []) {
  const tokens = markdown.parse(String(source), {});
  const ids = new Set(['top', 'site-menu']);
  for (const [index, token] of tokens.entries()) {
    if (token.type !== 'heading_open') continue;
    const title = inlineText(tokens[index + 1]?.children);
    const stem = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
    let id = stem;
    let suffix = 2;
    while (ids.has(id)) id = `${stem}-${suffix++}`;
    ids.add(id);
    token.attrSet('id', id);
    headings.push({ id, level: Number(token.tag.slice(1)), title });
  }
  return markdown.renderer.render(tokens, markdown.options, {});
}

export function stripMarkdown(source = '') {
  return markdown.parse(String(source), {}).filter(token => token.type === 'inline')
    .map(token => inlineText(token.children.filter(child => child.type !== 'image')))
    .join(' ').replace(/\s+/g, ' ').trim();
}
