# AGENTS.md

This repository is designed to be maintained by humans and coding agents together.

## Mental model

There are exactly three conceptual layers:

1. `data/` — append-only human/author memory.
2. `engine/` — AI-normalized content plus deterministic build code.
3. `public/` — generated static site that GitHub Pages publishes.

Do not blur these layers because doing so makes future diffs hard to understand.

## Prime directive for Data

**Never delete, rewrite, reorder, reformat, rename for cleanliness, or silently fix existing text inside `data/`.**

Data is an append-only ledger. If the author corrects an earlier statement, append an update at the end of that file. The newest explicit instruction governs the generated result, but older source text stays intact.

Before doing content work:

```sh
git diff -- data/
```

Identify the newly appended ranges. Read enough earlier context to understand them, then make the smallest necessary update to `engine/generated/`.

Use `npm run check:data` before committing local Data edits.

## Editorial behavior

When turning Data into generated article content:

- preserve the author's meaning, tone, sentence rhythm, recurring wording, uncertainty and jokes;
- improve readability conservatively;
- paragraph breaks, headings, punctuation and small connective phrases are fine;
- lively / professional / friendly / cute touches are allowed only when they fit the source;
- do not flatten everything into generic polished AI prose;
- do not invent facts, motivations, theory, memories, citations, confidence or emotional conclusions;
- if metadata is uncertain, omit it rather than guessing;
- a later append-only update overrides earlier instructions in Engine/Public.

`source` in each generated article should point back to the relevant `data/` file.

## Engine rules

`engine/generated/` is the reviewed semantic representation produced from Data. It is allowed to change normally.

`engine/build.mjs` and `engine/lib/` are deterministic implementation code. Keep them boring and readable.

KISS rules:

- prefer browser/platform APIs;
- prefer static generation;
- no server runtime;
- no database;
- no frontend framework unless a concrete requirement cannot be met simply;
- every new dependency needs a clear maintenance benefit that outweighs a small local implementation;
- avoid build-system magic and hidden conventions.

## Public rules

`public/` is generated output. Do not hand-maintain it as a second source of truth.

If you temporarily patch `public/` while debugging, port the fix back into Engine and rebuild before finishing.

## Required workflow

After any relevant change:

```sh
npm run build
npm run check
```

For a Data-driven task, the expected diff usually looks like:

- appended lines in `data/...` (human-owned input),
- a small change in `engine/generated/...` (AI-normalized content),
- regenerated `public/...` output.

Before finishing, inspect the diff for accidental prose rewrites or unrelated formatting churn.

## Visual direction

The design is inspired by the quiet, chronological reading feel of `blog.nyaw.xyz`, not by pixel-for-pixel copying.

Keep:

- generous whitespace;
- strong typography;
- chronological year/season grouping;
- unobtrusive metadata;
- simple taxonomy and tags;
- article-first reading pages.

The three maintained themes are `blue`, `pink`, and `white`. They use light blue / pink / white as a stylized trans-flag palette. Avoid turning every surface into literal stripes; the palette should feel intentional and calm.

## v1 feature contract

Do not regress these without an explicit request:

- home page;
- archive/category/tag taxonomy;
- local static search;
- about page;
- article pages;
- theme switcher with persisted preference;
- GitHub Pages deployment workflow;
- responsive layout.
