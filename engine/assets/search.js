const input = document.querySelector("#search-input");
const results = document.querySelector("#search-results");
const base = document.documentElement.dataset.base || "";
let index = [];
const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
function score(post, terms) {
  const title = post.title.toLowerCase(), category = post.category.toLowerCase();
  const tags = post.tags.join(" ").toLowerCase(), summary = post.summary.toLowerCase(), body = post.body.toLowerCase();
  let total = 0;
  for (const term of terms) {
    if (!term) continue;
    let hit = 0;
    if (title.includes(term)) hit += 12;
    if (category.includes(term)) hit += 7;
    if (tags.includes(term)) hit += 6;
    if (summary.includes(term)) hit += 4;
    if (body.includes(term)) hit += 1;
    if (!hit) return 0;
    total += hit;
  }
  return total;
}
function render(query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) { results.innerHTML = '<p class="post-meta">输入标题、分类、标签或正文中的词。</p>'; return; }
  const matched = index.map(post => ({post, score: score(post, terms)})).filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score || b.post.date.localeCompare(a.post.date)).slice(0, 30);
  if (!matched.length) { results.innerHTML = '<p class="post-meta">没有找到。也可能只是它还没被写出来。</p>'; return; }
  results.innerHTML = matched.map(({post}) => `
    <article class="search-card">
      <h2><a href="${base}/articles/${encodeURIComponent(post.slug)}/">${escapeHtml(post.title)}</a></h2>
      <p>${escapeHtml(post.date)} · ${escapeHtml(post.category)} · ${post.tags.map(escapeHtml).join(" / ")}</p>
      <p>${escapeHtml(post.summary)}</p>
    </article>`).join("");
}
fetch(`${base}/search-index.json`).then(r => r.json()).then(data => {
  index = data;
  render(input.value);
  input.addEventListener("input", () => render(input.value));
  const q = new URLSearchParams(location.search).get("q");
  if (q) { input.value = q; render(q); }
}).catch(() => { results.innerHTML = '<p class="post-meta">搜索索引加载失败。</p>'; });
