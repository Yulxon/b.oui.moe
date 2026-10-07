# Shared reading-site components

The visual reference is `blog.nyaw.xyz`. Components here are independent native implementations, not copied Solid source or an automatically synchronized upstream package.

| Component | Local implementation |
| --- | --- |
| Header and mobile menu | `engine/lib/components.mjs` + `engine/assets/components.js` |
| Chronological article list | `engine/lib/components.mjs` |
| Article table of contents | `engine/lib/markdown.mjs`, `engine/lib/components.mjs`, `engine/assets/components.js` |
| Back to top | `engine/lib/components.mjs` + `engine/assets/components.js` |
| Page HTML structure | `engine/templates/*.mjs` |
| Shared visual rules | `engine/styles/*.css` |

`site.js` initializes browser enhancements. `build.mjs` assembles templates, content and styles into `public/`.

## Style maintenance

The visual surface is deliberately human-editable:

- `tokens.css` — high-frequency tuning knobs;
- `palette.css` — paper/ink/green colors;
- `layout.css` — widths and responsive geometry;
- `typography.css` — shared type hierarchy;
- `components.css` — navigation, taxonomy, search, TOC and controls;
- `article.css` — article-only reading refinements;
- `custom.css` — protected author overrides loaded last.

The current palette remains paper `#fbfaf6`, ink `#2a2a28`, muted `#8b8b86`, rules `#ebe9e1`, and green accent `#6f9052`.

Article contents links are rendered during the build, including all heading levels with unique anchors. JavaScript enhances active-section tracking and reading progress.

The self-hosted LXGW WenKai assets and licenses remain under `engine/assets/fonts/lxgw-wenkai/` and require no runtime font CDN.
