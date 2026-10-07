const input = document.querySelector('#search-input');
const results = document.querySelector('#search-results');
const base = document.documentElement.dataset.base || '';
let index = [];

function score(post, terms) {
  const fields = [[post.title, 12], [post.category, 7], [post.tags.join(' '), 6], [post.summary, 4], [post.body, 1]];
  let total = 0;
  for (const term of terms) {
    let points = 0;
    for (const [value, weight] of fields) if (value.toLowerCase().includes(term)) points += weight;
    if (!points) return 0;
    total += points;
  }
  return total;
}
function message(text) {
  const paragraph = document.createElement('p');
  paragraph.className = 'post-meta';
  paragraph.textContent = text;
  results.replaceChildren(paragraph);
}
function render() {
  const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) { message('输入标题、分类、标签或正文中的词。'); return; }
  const matched = index.map(post => ({ post, score: score(post, terms) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date));
  if (!matched.length) { message('没有找到。也可能只是它还没被写出来。'); return; }
  results.replaceChildren();
  for (const { post } of matched) {
    const article = document.createElement('article');
    article.className = 'search-card';
    const title = document.createElement('h2');
    const link = document.createElement('a');
    link.href = `${base}/articles/${encodeURIComponent(post.slug)}/`;
    link.textContent = post.title;
    title.append(link);
    const date = document.createElement('time');
    date.dateTime = post.date;
    date.textContent = post.date.replaceAll('-', '/');
    article.append(title, date);
    results.append(article);
  }
}
function restoreQuery() {
  input.value = new URLSearchParams(location.search).get('q') || '';
  render();
}
fetch(`${base}/search-index.json`).then(response => {
  if (!response.ok) throw new Error('Search index unavailable');
  return response.json();
}).then(data => {
  index = data;
  restoreQuery();
  input.addEventListener('input', () => {
    const url = new URL(location.href);
    if (input.value) url.searchParams.set('q', input.value);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    render();
  });
  window.addEventListener('popstate', restoreQuery);
}).catch(() => message('搜索索引加载失败，请刷新重试。'));
