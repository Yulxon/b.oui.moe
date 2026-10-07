import { initHeader, initArticle } from './components.js';

document.documentElement.classList.add('js');
initHeader(document.querySelector('.site-header'));
initArticle(document.querySelector('.article-layout'));
