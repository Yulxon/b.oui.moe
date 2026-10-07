# Shared reading-site components

The reference is [blog.nyaw.xyz](https://github.com/oluceps/blog.nyaw.xyz).
These are independent native implementations of its visible patterns, not copied Solid source or an automatically synchronized upstream package. No new dependencies are required.

| Component | Reference | Local implementation |
| --- | --- | --- |
| Header and mobile menu | `src/components/Header.tsx` | `engine/lib/components.mjs` and `engine/assets/components.js` |
| Chronological article list | `src/components/Arti.tsx` | `engine/lib/components.mjs`, shared by home and taxonomy |
| Article table of contents | `src/components/Toc.tsx` | `engine/lib/markdown.mjs`, `engine/lib/components.mjs`, and `engine/assets/components.js` |
| Back to top | `src/components/BackTopBtn.tsx` | `engine/lib/components.mjs` and `engine/assets/components.js` |

`site.js` initializes the browser components. `build.mjs` assembles pages and copies their assets. All output remains in `public/`; all author text is read directly from editable Markdown in Data.

The single palette follows the reference: paper `#fbfaf6`, ink `#2a2a28`, muted `#8b8b86`, rules `#ebe9e1`, green accent `#6f9052`. Old theme preferences are ignored. There is no theme picker or theme storage code.

Maintenance: adjust a component in its shared module, update its CSS, run `npm run test`, `npm run build`, and `npm run check`. Review desktop/mobile navigation, article heading links, and taxonomy URL filters after relevant UI changes.

Article typography is isolated in `engine/assets/article.css`, loaded only on article routes. Paragraphs remain 17px with 1.625 line-height at every viewport; container sizes control heading/list scale. The shared font stack begins with self-hosted LXGW WenKai, distributed under OFL 1.1. Unicode subsets load only when needed, with system fallback while loading. The font assets, provenance, and license live in `engine/assets/fonts/lxgw-wenkai/`; code retains its monospace stack.

Article contents links are rendered during the build, including all heading levels with unique anchors. They work without JavaScript. The Chinese contents panel starts expanded on desktop and mobile; JavaScript enhances active-section tracking and reading progress.
