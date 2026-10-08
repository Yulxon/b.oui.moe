# AGENTS.md

This repository is maintained by humans and coding agents together.

## Layers

1. `data/` is editable author content and project instructions.
2. `engine/` is deterministic build code, templates, styles and shared assets.
3. `public/` is generated output published by GitHub Pages.

Humans and AI may edit Data as requested. Preserve the author's meaning and voice; do not invent facts or conclusions. Only `draft: false` publishes an article; preserve publication state unless explicitly asked to change it.

AI is an optional collaborator, not a required publishing step. Git preserves editing history; Data is editable rather than append-only. When editing prose, preserve the author's rhythm, familiar wording, uncertainty and jokes. Paragraphs, headings, punctuation and code fences may be adjusted for readability, but do not add experiences, quotations or emotional conclusions. The user's new instructions take precedence.

## Engine boundaries

Keep these responsibilities separate:

- `engine/templates/` — HTML structure;
- `engine/styles/` — visual presentation;
- `engine/assets/` — browser JavaScript and self-hosted assets;
- `engine/lib/` — reusable content/rendering logic;
- `engine/build.mjs` — orchestration only.

Do not move large page-specific HTML strings back into `build.mjs`.

## Style editing

For visual changes, choose the smallest appropriate surface:

1. width/font/spacing/radius knob → `engine/styles/tokens.css`;
2. color → `engine/styles/palette.css`;
3. page geometry/responsive layout → `engine/styles/layout.css`;
4. text hierarchy → `engine/styles/typography.css`;
5. UI component → `engine/styles/components.css`;
6. article-reading detail → `engine/styles/article.css`;
7. tiny author-specific override → `engine/styles/custom.css`.

### Protected author overrides

`engine/styles/custom.css` is author-owned. Unless the author explicitly requests changes to that file, agents must not rewrite, delete, sort, merge, normalize, deduplicate, or move rules out of it. Do not remove a rule merely because it looks redundant or unused.

Keep colors in `palette.css` and layout values out of it. There is currently one visual palette; do not reintroduce theme switching unless explicitly requested.

## Authoring

`data/articles/*.md` is the final article source. YAML frontmatter supplies title, date, categories, tags, description and publication status. `data/about.md` supplies the about page; `data/site.json` supplies site settings.

## Implementation

Prefer static generation and browser APIs. No server runtime, database, or frontend framework without a concrete requirement. New dependencies need a clear maintenance benefit. YAML uses the standard `yaml` parser; typography uses system font stacks without downloaded web fonts.

Do not redistribute fonts from the reference site when their license is unclear.

Never hand-maintain `public/` as a second source of truth. Port temporary debugging changes into Engine or Data and rebuild.

## Validation

After relevant changes run:

```sh
npm run test
npm run check:data
npm run build
npm run check
```

For local visual work, `npm run dev` watches style files, rebuilds CSS only, and reloads the browser. Data/templates/lib changes trigger a full rebuild.

Inspect the final diff for unrelated changes and unintended prose edits. Verify desktop and mobile when changing layout or typography.

## Design and features

Follow the quiet reading appearance of `blog.nyaw.xyz`: generous whitespace, chronological year/season groups, unobtrusive metadata, a restrained paper/green palette, and article-first pages.

Preserve home, taxonomy, local static search, about, article pages, article contents navigation, responsive navigation, back-to-top, system font stacks, and GitHub Pages deployment.
