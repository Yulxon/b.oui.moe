export function renderSearch() {
  return `<h1 class="visually-hidden">搜寻</h1><div class="search-box"><label class="visually-hidden" for="search-input">搜索文章</label><input id="search-input" class="search-input" type="search" placeholder="标题、分类、标签、正文……" autocomplete="off"><div id="search-results" class="search-results" aria-live="polite"><p class="post-meta">搜索索引加载中。</p></div></div>`;
}
