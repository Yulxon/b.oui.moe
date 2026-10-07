# b.oui.moe — Data → Engine → Public

A small static writing site built around an append-only author workspace and a deliberately simple publishing engine.

The visual direction closely follows `blog.nyaw.xyz`: a compact corner header, centered year/season lists, small metadata, restrained paper backgrounds, and article-first reading pages. The implementation remains static HTML/CSS/JavaScript, with the reference site's single paper-and-green palette.

## Architecture

```text
Data (author history)
  ↓  Codex / AI reads the new diff and preserves voice
Engine (normalized content + deterministic generator)
  ↓  npm run build
Public (plain HTML/CSS/JS)
  ↓  GitHub Pages
Web
```

### Data

`data/` contains prompts, drafts, notes and context for AI. It is **append-only**: existing bytes are not rewritten. If something changes, append an update to the end of the file.

This makes the author's history inspectable and lets an agent use `git diff -- data/` to see what is new.

### Engine

`engine/generated/` contains the reviewed, structured representation of the content after AI/editorial processing.

`engine/build.mjs` turns that content into static pages. The implementation intentionally uses Node's standard library and browser-native HTML/CSS/JS. There is no frontend framework, server, database or runtime dependency.

### Public

`public/` is generated output and is the directory deployed to GitHub Pages. Do not maintain it by hand.

## v1 features

- chronological home page grouped by year and season;
- archive / categories / tags views with exact URL-persisted filtering and a monthly heatmap;
- client-side static search with a generated JSON index;
- about page;
- article pages with heading navigation, reading progress and return-to-top links;
- a single paper-and-green visual style matching the reference;
- responsive layout;
- GitHub Pages workflow.

Navigation, chronological lists, article tools and browser behavior are shared native components. Their reference sources and maintenance boundaries are documented in [engine/components.md](engine/components.md).

## Local use

Requires Node.js 22+.

```sh
npm run build
npm run check
npm run dev
```

`npm run dev` serves the generated site at `http://localhost:4321`.

There are no npm packages to install in v1. The existing Nix development shell is retained: run `nix develop` (or use direnv) for Node.js 24 and npm.

## Writing workflow

1. Write or append notes under `data/`.
2. Do not edit old Data text; append a correction/update instead.
3. Ask Codex to read `AGENTS.md`, inspect `git diff -- data/`, and update only the affected files in `engine/generated/`.
4. Review the generated content diff. The source voice should still sound like the author.
5. Run `npm run build && npm run check`.
6. Commit Data + Engine + Public together.

Example instruction to Codex:

```text
Read AGENTS.md. Inspect git diff -- data/ and process only the newly appended author material. Preserve the author's meaning and voice. Update the minimal affected engine/generated files, rebuild public, run checks, and summarize exactly what changed. Do not rewrite existing Data.
```

## Add an article

Create or append the raw material in `data/drafts/...`, then generate an article JSON under `engine/generated/articles/`:

```json
{
  "slug": "example-post",
  "title": "Example",
  "date": "2026-10-07",
  "category": "随笔",
  "tags": ["example"],
  "summary": "One-line summary.",
  "status": "published",
  "source": "data/drafts/example.md",
  "bodyMarkdown": "Markdown body"
}
```

Use lowercase kebab-case slugs. `npm run check` catches missing fields and duplicate/invalid slugs.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds `public/` on pushes to `main` and deploys it with the official GitHub Pages actions.

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** once. After that, pushes to `main` deploy automatically.

This repository is configured for the existing custom domain `https://b.oui.moe`, so the workflow builds with an empty base path and the generator emits `public/CNAME`.

## Style and component editing

The single palette is defined in `:root` in `engine/assets/site.css`. Shared HTML components live in `engine/lib/components.mjs`; browser components live in `engine/assets/components.js`. The header, article directory and return-to-top behavior follow the reference site using platform APIs. Old theme preferences no longer affect rendering.

## Why no framework?

Because v1 is a static personal writing site. A framework would mostly add conventions, dependencies and upgrade work without making the core tasks—render Markdown, list posts, search a JSON index, switch CSS variables—meaningfully simpler.

If future requirements genuinely demand one, the Data/Engine/Public boundary makes the rendering layer replaceable without changing the author workflow.

## Visual and interaction maintenance

Styles live in `engine/assets/site.css`; layout markup is generated by `engine/build.mjs`. `taxonomy.js` filters generated article rows without a server. Taxonomy URLs use `view=archive|category|tag`, `category=...`, `tag=...` and `month=YYYY-MM`; search keeps `q=...`. Existing article URLs remain unchanged. Season labels follow the reference site's fixed solar-term boundaries (February 4, May 6, August 8, November 7), and groups follow descending article dates.

Reference screenshots and source were reviewed during the redesign; typography uses installed platform fonts rather than third-party font services. The current local Data/Engine/Public project differs from the SolidStart tree on the GitHub main branch; these local changes do not migrate or overwrite that remote tree.
