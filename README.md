# b.oui.moe

一个直接从 Markdown 构建的静态博客。外观参考 blog.nyaw.xyz：纸色背景、绿色强调、按年份和季节排列的文章列表，以及专注阅读的正文页面。

## 内容与构建

```text
data/    可编辑 Markdown 和站点配置
  ↓ npm run build
engine/  确定性的 Markdown 渲染和静态页面生成
  ↓
public/  GitHub Pages 发布的 HTML、CSS、JavaScript 和字体
```

直接编辑 `data/articles/*.md` 即可更新最终文章，无需 AI 生成文章，也不维护第二份 JSON 正文。`data/about.md` 是关于页面；`data/site.json` 是站点配置。作者和 AI 都可以修改 Data、提示文件和说明。格式和草稿规则见 [data/README.md](data/README.md)。

## 本地开发

需要 Node.js 22 或更高版本，CI 使用 Node.js 24。也可通过保留的 Nix flake / direnv 进入开发环境。

```sh
npm ci
npm run dev
```

访问 `http://localhost:4321`。每次更新后重新构建；开发服务器没有自动构建监视器。

```sh
npm run test
npm run check:data
npm run build
npm run check
```

生成结果在 `public/`，不要直接编辑。构建支持 `SITE_BASE`，在域名根目录发布时留空。GitHub Pages 工作流安装依赖、运行检查、构建并发布静态输出。

## 功能与维护

首页、归档/分类/标签、静态本地搜索、关于页、文章目录、移动导航和返回顶部均使用浏览器原生 API。网站只有一套纸色与绿色样式。

中文使用自托管 LXGW WenKai（霞鹜文楷），提供常规与粗体字重，按 Unicode 范围分包加载，保留系统字体回退。字体文件和 OFL 许可在 `engine/assets/fonts/lxgw-wenkai/`，无需访问字体 CDN。正文保持 17px 和 1.625 倍行高；代码使用等宽字体。

`yaml` 是唯一运行依赖，用于正确处理 Markdown 元信息中的 YAML。UI 组件是独立实现的静态组件；来源和维护方式见 [engine/components.md](engine/components.md)。
