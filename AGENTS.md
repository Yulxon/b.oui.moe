# AGENTS.md

This repository is maintained by humans and coding agents together.

## Layers

1. `data/` is editable author content and project instructions.
2. `engine/` is deterministic build code and shared assets.
3. `public/` is generated output published by GitHub Pages.

Data is no longer append-only. Humans and AI may edit, reorganize, or remove Markdown, `data/prompts/`, and `data/README.md` as the project evolves. Git tracks history. Preserve the author's meaning and voice when editing; do not invent facts or conclusions.

## Authoring

`data/articles/*.md` is the final article source. YAML frontmatter supplies title, date, categories, tags, description, and publication status. The build reads Markdown directly; there is no AI normalization step or duplicate article JSON. Only `draft: false` publishes an article; an omitted draft field defaults to a draft. Preserve publication status unless a request explicitly changes it.

`data/about.md` supplies the about page; `data/site.json` supplies site settings. Prompts guide optional collaboration and are not published. AI may update Markdown and instructions when requested work requires it.

## Implementation

Prefer static generation and browser APIs. No server runtime, database, or frontend framework without a concrete requirement. New dependencies need a clear maintenance benefit. YAML uses the standard `yaml` parser; fonts are self-hosted assets with their license.

Never hand-maintain `public/`. Port temporary debugging changes into Engine or Data and rebuild.

## Validation

After relevant changes run `npm run test`, `npm run check:data`, `npm run build`, and `npm run check`. Inspect the diff for unrelated changes and unintended prose edits. Verify desktop and mobile when changing layout or typography.

## Design and features

Follow the quiet reading appearance of `blog.nyaw.xyz`: generous whitespace, chronological year/season groups, unobtrusive metadata, green accents on a paper background, and article-first pages. There is one style; the previous blue/pink/white theme switcher was removed at the user's request.

Preserve home, taxonomy, local static search, about, article pages, article contents navigation, responsive navigation, back-to-top, and GitHub Pages deployment.
