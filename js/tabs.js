import { SHAPE_LABELS, createElement } from './common.js';
import { createIcon } from './icons.js';

export function renderTabs(container, items, activeValue, onSelect) {
  container.replaceChildren();
  items.forEach(([value, label, iconName]) => {
    const tab = createElement('button', value === activeValue ? 'tab is-active' : 'tab');
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(value === activeValue));
    if (iconName) tab.append(createIcon(iconName));
    tab.append(label);
    tab.addEventListener('click', () => onSelect(value));
    container.append(tab);
  });
}

export function renderShapeTabs(container, activeShape, onSelect) {
  renderTabs(container, [['', 'Все'], ...Object.entries(SHAPE_LABELS)], activeShape, onSelect);
}
