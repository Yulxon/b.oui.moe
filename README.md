# b.oui.moe

一个直接从 Markdown 构建的静态博客。Data 保存可编辑内容，Engine 负责确定性生成，Public 是最终发布结果。

## 内容与构建

```text
data/    可编辑 Markdown 和站点配置
  ↓ npm run build
engine/  模板、样式、Markdown 渲染和静态页面生成
  ↓
public/  GitHub Pages 发布的 HTML、CSS 和 JavaScript
```

直接编辑 `data/articles/*.md` 即可更新文章；`data/about.md` 是关于页面，`data/site.json` 是站点配置。没有第二份文章 JSON 正文。

## 协作与迁移背景

项目从 SolidStart 迁移为静态 Markdown 构建时，将七篇旧文章迁入 `data/articles/`，保留原有发布时间和公开/草稿状态，移除了旧的 AI 生成文章 JSON。

Data 可以直接编辑，不要求追加式更新。AI 是可选的协作者，不是发布流水线的必要步骤；协作和编辑原则集中在 [AGENTS.md](AGENTS.md)，内容格式说明见 [data/README.md](data/README.md)。

## 本地开发

需要 Node.js 22 或更高版本，CI 使用 Node.js 24；NixOS 可直接 `nix develop` / `direnv allow`。

```sh
npm ci
npm run dev
```

访问 `http://localhost:4321`。开发服务器会自动监视：

- `engine/styles/`：只重新生成 CSS，然后自动刷新浏览器；
- `data/`、`engine/templates/`、`engine/lib/`、`engine/assets/`：重新构建站点并自动刷新。

完整验证：

```sh
npm run test
npm run check:data
npm run build
npm run check
```

## 手动微调样式

日常调样式不需要碰 `build.mjs`。优先按下面顺序找：

```text
engine/styles/
├── tokens.css       最常改：宽度、字号、行高、圆角、间距
├── palette.css      颜色
├── base.css         全局基础规则
├── layout.css       页面宽度、网格、header/footer、响应式
├── typography.css   标题、列表元信息、基础正文
├── components.css   导航、归档、搜索、TOC、按钮等组件
├── article.css      仅文章阅读页的细节
└── custom.css       作者手工覆盖层，永远最后加载
```

最常用的是 `tokens.css`。例如：

```css
:root {
  --home-width: 50%;
  --article-width: 50%;
  --body-size: 16px;
  --post-title-size: 15.5px;
  --article-title-size: 32px;
  --prose-size: 17px;
}
```

觉得文章太宽，只改 `--article-width`；正文太密，只改字号/行高；不想研究规则来源的细小审美调整直接写进 `custom.css`。

`custom.css` 是作者所有的“视觉草稿纸”。`AGENTS.md` 明确要求 AI 默认不得整理、合并或删除它。

## HTML 结构

页面结构也从生成器主体中拆开了：

```text
engine/templates/
├── layout.mjs
├── home.mjs
├── taxonomy.mjs
├── search.mjs
├── about.mjs
└── article.mjs
```

比如想把文章日期从标题上方挪到标题旁边，直接改 `article.mjs` 和相应 CSS，不需要在巨大的 `build.mjs` 模板字符串里翻找。

## 字体与依赖

`yaml` 解析文章 frontmatter，`markdown-it` 解析正文（包括表格和嵌套列表），`Shiki` 在构建时生成代码高亮。高亮实例在一次构建中复用，只加载已发布内容使用的语言；未知语言退回纯文本，浏览器无需加载高亮库。表格和代码块支持横向滚动。搜索文本从 Markdown 解析结果提取，继续排除代码块和图片。

网站字体采用系统字体栈，无需额外下载 Web Font：正文优先宋体/思源宋体，文章标题和关于页标题优先楷体，导航和界面使用系统无衬线字体。字体栈集中在 `engine/styles/tokens.css`，具体应用在 `typography.css` 和 `article.css`。不同操作系统安装字体不同，因此实际显示会有差异。

网站继续使用单一纸色/绿色视觉体系；颜色集中在 `palette.css`，布局和颜色互不混杂。

## Public

`public/` 是构建结果，不要直接维护。如果在浏览器里临时改 CSS 找到了满意值，把修改放回 Engine 后重新构建。

GitHub Pages workflow 会在 PR 中验证，在 `main` push 后构建并发布备用的 Pages 站点；正式域名 `b.oui.moe` 由下述 Workers 部署提供。

## Cloudflare Workers 静态部署

`wrangler.jsonc` 将 `public/` 部署为纯静态 Assets，不运行请求处理脚本。页面地址保持尾斜杠；不存在的地址返回 404，不回退到首页。

```sh
npx wrangler login
npm run deploy
```

部署前自动运行测试、数据检查、构建和产物检查。发布到 `https://b-oui-moe.20533.workers.dev` 和配置中绑定的 Custom Domain `b.oui.moe`。`public/CNAME` 仅供 GitHub Pages 使用，不会绑定 Workers 域名。

GitHub Actions 的 `Deploy Cloudflare Workers` workflow 可手动触发，需要仓库 secrets `CLOUDFLARE_API_TOKEN`（目标账号的 Workers Scripts 编辑权限）和 `CLOUDFLARE_ACCOUNT_ID`。凭据不写入仓库。

`b.oui.moe` 已绑定到 Workers。GitHub Pages workflow 暂时保留作为备用发布；它不会更新 Workers。当前 Workers 自动部署尚未启用，更新线上站点需运行 `npm run deploy`，或配置上述 secrets 后手动触发 Workers workflow。
