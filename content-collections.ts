import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "src/routes/(post)",
  include: "**/*.mdx",
  parser: 'frontmatter-only',
  schema: z.object({
    date: z.codec(z.string(), z.date(), {
      decode: (isoString) => new Date(isoString),
      encode: (date) => date.toISOString(),
    }),
    title: z.string(),
    description: z.string().optional(),
    categories: z.array(z.string()).optional().nullable(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    author: z.string().optional(),
  }),
});

export default defineConfig({
  content: [posts],
});
