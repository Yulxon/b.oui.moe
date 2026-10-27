# Shared reading-site components

Components are independent native implementations for a quiet, article-first reading site. The design uses the author's wallpaper-inspired palette rather than an external site's appearance as its specification.

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
- `palette.css` — wallpaper-inspired paper/ink/rose colors and shared color tokens;
- `layout.css` — widths and responsive geometry;
- `typography.css` — shared type hierarchy;
- `components.css` — navigation, taxonomy, search, TOC and controls;
- `article.css` — article-only reading refinements.

Make adjustments directly in the stylesheet responsible for them; there is no separate author override layer.

The palette takes its cream, dusty rose and lavender cues from the author's wallpaper reference: gray-cream paper `#f1e9e7`, warm off-white surfaces `#f8f1ec`, ink `#423c4d`, muted `#726573`, rules `#ddd1d5`, and rose accent `#8b4f69`. Decorative rose and seasonal colors are softened with gray to echo the illustration without sacrificing text contrast. Darker text tones preserve reading contrast; lighter rose tones are reserved for decorative marks and selected surfaces. Keep all UI colors in `palette.css`, including selection, shadows, code surfaces and heatmap steps. `--accent-200/300/400` name the decorative ramp independently of its hue.

The site automatically follows `prefers-color-scheme`, including live system changes, without JavaScript or a stored override. The dark palette uses purple-charcoal paper `#24212b`, pale lavender ink `#e8dfe8`, and rose accent `#e0a5c0`. Both palettes live in `palette.css`; the page declares `color-scheme: light dark` for native browser controls. Shiki emits light and dark token colors at build time, with the same media query selecting dark syntax colors.

Article contents links are rendered during the build, including all heading levels with unique anchors. JavaScript enhances active-section tracking and reading progress.
