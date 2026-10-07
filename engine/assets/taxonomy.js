const rows = [...document.querySelectorAll('#taxonomy-posts .post-row')];
const tabs = [...document.querySelectorAll('[data-view]')];
const links = [...document.querySelectorAll('[data-filter]')];
const cells = [...document.querySelectorAll('[data-month]')];
const clear = document.querySelector('#filter-clear');

function render() {
  const params = new URLSearchParams(location.search);
  const view = ['category', 'tag'].includes(params.get('view')) ? params.get('view') : 'category';
  const category = params.get('category');
  const tag = params.get('tag');
  const month = params.get('month');
  let count = 0;
  for (const row of rows) {
    row.hidden = Boolean((category && row.dataset.category !== category) ||
      (tag && !JSON.parse(row.dataset.tags).includes(tag)) ||
      (month && !row.dataset.date.startsWith(`${month}-`)));
    if (!row.hidden) count++;
  }
  for (const group of document.querySelectorAll('#taxonomy-posts .season, #taxonomy-posts .year-group')) {
    group.hidden = ![...group.querySelectorAll('.post-row')].some(row => !row.hidden);
  }
  for (const tab of tabs) {
    if (tab.dataset.view === view) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  for (const link of links) {
    if (params.get(link.dataset.filter) === link.dataset.value) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  for (const cell of cells) {
    if (cell.dataset.month === month) cell.setAttribute('aria-current', 'true');
    else cell.removeAttribute('aria-current');
  }
  for (const rail of document.querySelectorAll('[data-rail]')) rail.hidden = rail.dataset.rail !== (view === 'tag' ? 'tag' : 'category');
  document.querySelector('.taxonomy-rail').hidden = false;
  document.querySelector('[data-archive]').hidden = false;
  document.querySelector('#filter-status').textContent = `${category || tag || month || 'ALL'} · ${count} ENTRIES`;
  document.querySelector('#taxonomy-empty').hidden = count > 0;
  clear.hidden = !category && !tag && !month;
  clear.href = `${document.documentElement.dataset.base}/taxonomy/?view=${view}`;
}
for (const link of [...tabs, ...links, ...cells, clear]) {
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = new URL(link.href);
    if (link.hasAttribute('aria-current') && !link.dataset.view) {
      target.search = link.dataset.filter ? `view=${link.dataset.filter}` : '';
    }
    history.pushState(null, '', target);
    render();
  });
}
window.addEventListener('popstate', render);
render();
