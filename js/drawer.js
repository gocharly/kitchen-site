import { createElement } from './common.js';
import { createIcon } from './icons.js';

export function createDrawer(onClose) {
  const drawer = createElement('div', 'drawer');
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  const backdrop = createElement('div', 'drawer-backdrop');
  const panel = createElement('aside', 'drawer-panel');
  const top = createElement('div', 'drawer-top');
  const title = createElement('h2', 'drawer-title');
  const closeButton = createElement('button', 'menu-button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Закрыть');
  closeButton.append(createIcon('close'));
  const body = createElement('div', 'drawer-body');
  top.append(title, closeButton);
  panel.append(top, body);
  drawer.append(backdrop, panel);
  document.body.append(drawer);

  const close = () => {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    onClose?.();
  };
  backdrop.addEventListener('click', close);
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  const open = (heading, content) => {
    title.textContent = heading;
    drawer.setAttribute('aria-label', heading);
    body.replaceChildren(content);
    body.scrollTop = 0;
    drawer.classList.add('is-open');
    document.body.classList.add('is-locked');
    closeButton.focus({ preventScroll: true });
  };
  return { open, close };
}
