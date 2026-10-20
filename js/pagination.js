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

export function renderPagination(container, pageCount, currentPage, onSelect) {
  container.replaceChildren();
  if (pageCount < 2) return;
  const previous = renderPageButton(createIcon('chevron-left'), 'Предыдущая страница', false, currentPage === 1, () => onSelect(currentPage - 1));
  const next = renderPageButton(createIcon('chevron-right'), 'Следующая страница', false, currentPage === pageCount, () => onSelect(currentPage + 1));
  const numbers = Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => renderPageButton(String(page), `Страница ${page}`, page === currentPage, false, () => onSelect(page)));
  container.append(previous, ...numbers, next);
}
