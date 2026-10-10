# 可直接编辑的内容目录

这里是网站内容的来源。作者和 AI 都可以随着项目更新修改 Markdown 和说明；历史由 Git 保存。无需 AI 生成一份最终文章 JSON。协作规则见根目录的 [AGENTS.md](../AGENTS.md)。

- `articles/*.md`：最终文章，构建时直接读取。
- `about.md`：关于页面的正文。
- `site.json`：站点设置。

文章示例：

```markdown
---
title: 一篇文章
date: "2026-10-08"
draft: false
categories: [随笔]
tags: [生活]
description: 可选的简短介绍
---

这里就是最终正文，可以直接修改。
```

`title` 和 `date` 必填。日期支持 `YYYY-MM-DD` 和既有 ISO 时间格式。默认使用文件名作为地址；可通过 `slug` 指定小写字母、数字和连字符组成的地址。分类、标签和简介可省略。

只有明确写了 `draft: false` 的文章会发布。省略 `draft` 或设置 `draft: true` 时，正文不会进入网页或搜索索引。分类列表的第一项作为主分类。

正文支持标题、段落、列表、引用、链接、图片和代码块。代码或目录树请放在围栏代码块中。修改后运行 `npm run check:data`、`npm run build` 和 `npm run check`。

AI 可以协助修改正文，但应保留作者意思和语气，不编造事实，也不自行把草稿改为公开文章。
