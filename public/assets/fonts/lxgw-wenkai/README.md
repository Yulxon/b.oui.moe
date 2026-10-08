# LXGW WenKai / 霞鹜文楷

Self-hosted regular (400) and bold (700) Unicode subsets from lxgw-wenkai-webfont 1.7.0.

Package: https://registry.npmjs.org/lxgw-wenkai-webfont/-/lxgw-wenkai-webfont-1.7.0.tgz
Typeface: https://github.com/lxgw/LxgwWenKai
Webfont packaging: https://github.com/chawyehsu/lxgw-wenkai-webfont

Font license: SIL OFL 1.1 (OFL.txt). Packaging license: MIT (LICENSE). VERSION records the upstream font version. font.css combines the original regular and bold CSS; paths and Unicode ranges are unchanged. Keep licenses, CSS, and referenced subsets together when updating. No runtime CDN is required.

`font.css` is the source manifest, not a blocking stylesheet loaded by pages. `engine/lib/fonts.mjs` selects the subsets and Unicode code points used on each page, inlines their declarations in HTML, and preloads the two most relevant regular subsets. Search and taxonomy include published content and browser UI text so dynamically displayed results retain WenKai.

Engine retains the complete upstream subsets and both font weights for future content. Public includes only subsets referenced by the current pages, a filtered `font.css`, and the original licenses and metadata. New content automatically adds any required subsets on rebuild; unused subsets are excluded from deployment.
