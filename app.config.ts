import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import { nodeTypes } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import remarkMath from "remark-math";
import contentCollections from "@content-collections/vinxi";

import {
	transformerNotationDiff,
	transformerNotationHighlight,
	transformerNotationFocus,
	transformerNotationErrorLevel,
	transformerNotationWordHighlight,
} from "@shikijs/transformers";

import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";

// @ts-expect-error missing types
import pkg from "@vinxi/plugin-mdx";

const { default: mdx } = pkg;

/** Shift all heading levels +1 so MDX `#` becomes `<h2>` (Page.tsx provides the sole `<h1>`) */
function rehypeShiftHeadings() {
	return (tree: any) => {
		const walk = (node: any) => {
			if (node.type === "element") {
				const m = /^h([1-5])$/.exec(node.tagName);
				if (m) node.tagName = `h${parseInt(m[1]) + 1}`;
			}
			if (node.children) node.children.forEach(walk);
		};
		walk(tree);
	};
}

export default defineConfig({
	extensions: ["mdx", "md", "tsx"],
	vite: {
		plugins: [
			UnoCSS(),
			contentCollections(),
			mdx.withImports({})({
				define: {
					"import.meta.env": `'import.meta.env'`,
				},

				jsx: true,
				jsxImportSource: "solid-js",
				providerImportSource: "solid-mdx",
				rehypePlugins: [
					[
						rehypeRaw,
						{
							passThrough: nodeTypes,
						},
					],
					[rehypeSlug],
					[
						rehypeAutoLinkHeadings,
						{
							behavior: "wrap",
							properties: {
								className: "heading",
							},
						},
					],
					rehypeShiftHeadings,
					[
						rehypeShiki,
						{
							inline: "tailing-curly-colon",
							theme: "vitesse-light",
							defaultLanguage: "text",
							defaultColor: false,
							transformers: [
								transformerNotationFocus(),
								transformerNotationDiff({ matchAlgorithm: 'v3' }),
								transformerNotationHighlight(),
								transformerNotationErrorLevel(),
								transformerNotationWordHighlight(),
							],
						},
					],
				],
				remarkPlugins: [remarkGfm, remarkMath, remarkFrontmatter],
				remarkRehypeOptions: {
					footnoteLabelTagName: "h2",
					footnoteLabel: "Footnotes"
				}
			}),
			{ enforce: "pre" },
		],
	},
	server: {
		preset: "static",
		prerender: {
			crawlLinks: true,
			routes: ["/", "/taxonomy", "/search", "/me", "/links"],
			ignore: [/\{\getPath}/, /.*?emojiSvg\(.*/, /.*?QuickLinks\(.*/],
		},
	},
});
