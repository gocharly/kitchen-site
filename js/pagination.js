import { createElement } from './common.js';
import { createIcon } from './icons.js';

function renderPageButton(content, label, isActive, isDisabled, onClick) {
  const button = createElement('button', isActive ? 'page-button is-active' : 'page-button');
  button.type = 'button';
  button.disabled = isDisabled;
  button.setAttribute('aria-label', label);
  if (isActive) button.setAttribute('aria-current', 'page');
  button.append(content);
  button.addEventListener('click', onClick);
  return button;
}

function listVisiblePages(pageCount, currentPage) {
  const wanted = [1, currentPage - 1, currentPage, currentPage + 1, pageCount].filter((page) => page >= 1 && page <= pageCount);
  return [...new Set(wanted)].sort((first, second) => first - second);
}

export function renderPagination(container, pageCount, currentPage, onSelect) {
  container.replaceChildren();
  if (pageCount < 2) return;
  const previous = renderPageButton(createIcon('chevron-left'), 'Предыдущая страница', false, currentPage === 1, () => onSelect(currentPage - 1));
  const next = renderPageButton(createIcon('chevron-right'), 'Следующая страница', false, currentPage === pageCount, () => onSelect(currentPage + 1));
  const items = [];
  listVisiblePages(pageCount, currentPage).forEach((page, index, pages) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push(createElement('span', 'page-gap', '…'));
    items.push(renderPageButton(String(page), `Страница ${page}`, page === currentPage, false, () => onSelect(page)));
  });
  container.append(previous, ...items, next);
}
