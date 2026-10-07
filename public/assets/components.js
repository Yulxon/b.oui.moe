// Independent platform implementations of the reference site's shared UI.
export function initHeader(header) {
  if (!header) return;
  const toggle = header.querySelector('.menu-toggle');
  const menu = header.querySelector('.nav-wrap');
  const nav = header.querySelector('.site-nav');
  const highlight = nav.querySelector('.nav-highlight');
  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  function follow(link) {
    if (!link) { highlight.hidden = true; return; }
    highlight.hidden = false;
    highlight.style.width = `${link.offsetWidth}px`;
    highlight.style.height = `${link.offsetHeight}px`;
    highlight.style.transform = `translate(${link.offsetLeft}px, ${link.offsetTop}px)`;
  }
  for (const link of nav.querySelectorAll('a')) {
    link.addEventListener('pointerenter', () => follow(link));
    link.addEventListener('focus', () => follow(link));
  }
  nav.addEventListener('pointerleave', () => follow(nav.contains(document.activeElement) ? document.activeElement : null));
  nav.addEventListener('focusout', event => follow(nav.contains(event.relatedTarget) ? event.relatedTarget : null));
  follow(null);
  window.matchMedia('(min-width: 768px)').addEventListener('change', () => { setOpen(false); follow(null); });
}

export function initArticle(layout) {
  if (!layout) return;
  const prose = layout.querySelector('.prose');
  const root = document.documentElement;
  const headings = [...prose.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const toc = layout.querySelector('.article-toc');
  const nav = toc.querySelector('nav');
  const reading = toc.querySelector('output');
  toc.parentElement.hidden = headings.length === 0;
  nav.replaceChildren();
  const ids = new Set([...document.querySelectorAll('[id]')].filter(el => !headings.includes(el)).map(el => el.id));
  const links = [];
  for (const [index, heading] of headings.entries()) {
    const stem = heading.id || `section-${index + 1}`;
    let id = stem;
    let suffix = 2;
    while (ids.has(id)) id = `${stem}-${suffix++}`;
    ids.add(id);
    heading.id = id;
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(id)}`;
    link.textContent = heading.textContent;
    link.dataset.level = heading.tagName.slice(1);
    nav.append(link);
    links.push(link);
  }
  const progress = document.querySelector('.reading-progress span');
  const backTop = document.querySelector('.back-top');
  const minutes = Math.max(1, Math.ceil(prose.textContent.length / 500));
  let scheduled = false;
  function update() {
    scheduled = false;
    const height = root.scrollHeight - window.innerHeight;
    const ratio = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 1;
    progress.style.width = `${ratio * 100}%`;
    reading.textContent = `${Math.round(ratio * 100)}% · ~${Math.ceil(minutes * (1 - ratio))} min left`;
    backTop.hidden = window.scrollY <= 350 || root.clientWidth <= 930;
    let current = headings[0];
    for (const heading of headings) if (heading.getBoundingClientRect().top < 120) current = heading;
    for (const [index, link] of links.entries()) {
      if (headings[index] === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(prose);
  update();
  layout.querySelector('.article-back').addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
      event.preventDefault();
      history.back();
    }
  });
}
