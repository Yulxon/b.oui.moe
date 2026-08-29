# b.oui.moe

Yulxon's blog, rebuilt from scratch as a **SolidStart (Vinxi) + MDX + UnoCSS** static site, modeled on [blog.nyaw.xyz](https://github.com/oluceps/blog.nyaw.xyz).

## Stack

- [SolidStart](https://start.solidjs.com) (Vinxi) — file-based routing, SSR/prerender
- [MDX](https://mdxjs.com) — posts live under `src/routes/(post)/*.mdx`
- [UnoCSS](https://unocss.dev) — utility CSS with a custom theme (`uno.config.ts`)
- [Shiki](https://shiki.style) — syntax highlighting with notation transformers
- [content-collections](https://content-collections.dev) — Zod-validated post frontmatter
- Static output (`.output/public`) deployed to GitHub Pages

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static build -> .output/public
pnpm gen        # regenerate public/rss.xml + public/sitemap.xml
pnpm build:all  # build && gen
```

## Project layout

```
app.config.ts            # Vinxi/SolidStart + MDX + UnoCSS pipeline
content-collections.ts   # post collection schema (date/title/description/tags/categories/draft/toc)
src/
  constant.tsx           # site config (title, author, menu, about)
  components/            # Header, Footer(+glow), Arti (index), Page+TOC, Taxo, Mdx mapping...
  ingredients/           # MDX ingredients (Emph, QuickLink, RandReveal, Comment...)
  routes/
    index.tsx            # 序 — seasonal post index
    (post)/*.mdx         # posts
    (post).tsx           # post layout (title, meta, TOC, tags)
    taxonomy.tsx         # categories/tags archive with heatmap
    search.tsx           # client-side search over posts
    me/                  # about page
    links.tsx            # 友链
    [...404].tsx         # 404
scripts/                 # RSS + sitemap generation (run after build)
.github/workflows/       # GitHub Pages build & deploy
```

## Writing a post

Add a file to `src/routes/(post)/`:

```mdx
---
date: '2026-01-01T00:00:00.000Z'
title: My post
description: optional one-liner
tags: [tag1, tag2]
categories: [随笔]
draft: false
toc: true
---

## content here
```

Set `draft: true` to hide it from the index, taxonomy, RSS and sitemap.

## Nix development environment

A [flake](flake.nix) provides a reproducible dev shell (NixOS / nix with flakes):

```bash
nix develop          # or: direnv allow  (see .envrc)
pnpm dev             # http://localhost:3000
```

The shell pins **nodejs 22** (matching the GitHub Actions CI) and **corepack**;
`pnpm` follows the `packageManager` field in `package.json` (pnpm 9.15.9, same
as CI). `flake.lock` pins the exact nixpkgs revision.

## Deployment

GitHub Actions (`pnpm build:all`) prerenders the site into `.output/public` and
uploads it to GitHub Pages. `rss.xml`/`sitemap.xml` are generated after the
build and copied into the artifact. Domain: `https://b.oui.moe`.
