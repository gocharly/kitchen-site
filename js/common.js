import { startRevealOnScroll } from './animations.js';
import { createIcon } from './icons.js';

const SHAPE_LABELS = { straight: 'Прямые', corner: 'Угловые', 'u-shape': 'П-образные' };
const LAYOUT_LABELS = { straight: 'Вдоль одной стены', corner: 'По двум стенам', 'u-shape': 'По трём стенам' };
const NAV_ITEMS = [
  { href: 'index.html', label: 'Главная' },
  { href: 'catalog.html', label: 'Каталог' },
  { href: 'about.html', label: 'О нас' },
  { href: 'contacts.html', label: 'Контакты' },
];
const ORDER_STEPS = [
  { icon: 'layout-grid', title: 'Выберите кухню', text: 'Форма, размер и цена указаны в карточке.' },
  { icon: 'cursor', title: 'Нажмите «Заказать»', text: 'Откроется WhatsApp с готовым сообщением.' },
  { icon: 'message-circle', title: 'Оформим в чате', text: 'Уточним размеры и условия заказа.' },
];
const GENERAL_MESSAGE = 'Здравствуйте! Хочу подобрать кухню.';

export { SHAPE_LABELS, LAYOUT_LABELS, ORDER_STEPS };

export const formatPrice = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

export async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Не загрузился файл ${path}: ${response.status}`);
  return response.json();
}

export function buildWhatsAppLink(phone, message) {
  const digits = (phone ?? '').replace(/\D/g, '');
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildProductMessage(product) {
  const url = new URL(`product.html?id=${product.id}`, location.href).href;
  return ['Здравствуйте! Хочу заказать кухню:', product.title, `Размер: ${product.size}`, `Цена: ${formatPrice(product.price)}`, url].join('\n');
}

export function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function createWhatsAppLink(phone, message, className, label) {
  const link = createElement('a', className);
  link.href = buildWhatsAppLink(phone, message);
  link.target = '_blank';
  link.rel = 'noopener';
  link.append(createIcon('whatsapp', 'icon icon-button'), label);
  return link;
}

export function renderProductTile(product) {
  const link = createElement('a', 'tile');
  link.href = `product.html?id=${product.id}`;
  const frame = createElement('div', 'tile-image');
  const image = createElement('img');
  const cover = product.images[0];
  image.src = cover.src;
  image.alt = product.title;
  image.loading = 'lazy';
  image.style.objectPosition = cover.position;
  frame.append(image);
  const text = createElement('div', 'tile-text');
  text.append(createElement('span', 'tile-title', product.title), createElement('span', 'tile-price', formatPrice(product.price)));
  if (product.roomArea) text.append(createElement('span', 'tile-meta', `Для кухни ${product.roomArea}`));
  const caption = createElement('div', 'tile-caption');
  caption.append(text, createIcon('arrow-up-right', 'icon tile-arrow'));
  link.append(frame, caption);
  return link;
}

function renderMobileLink(href, label, index, extraClass) {
  const link = createElement('a', `mobile-menu-link ${extraClass ?? ''}`.trim());
  link.href = href;
  link.style.setProperty('--i', index);
  link.append(createElement('span', 'mobile-menu-number', String(index + 1).padStart(2, '0')), createElement('span', 'mobile-menu-label', label), createIcon('arrow-right'));
  return link;
}

function renderMobileGroup(title, rows, startIndex) {
  const group = createElement('div', 'mobile-menu-group');
  group.style.setProperty('--i', startIndex);
  group.append(createElement('span', 'mobile-menu-heading', title), ...rows);
  return group;
}

function renderMobileContact(iconName, value, href) {
  const row = createElement(href ? 'a' : 'span', 'mobile-menu-contact');
  if (href) row.href = href;
  row.append(createIcon(iconName), value);
  return row;
}

function renderMobileMenu(site, activePage, closeMenu) {
  const menu = createElement('div', 'mobile-menu');
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Меню');
  const top = createElement('div', 'mobile-menu-top');
  const brand = createElement('a', 'brand', site.name);
  brand.href = 'index.html';
  const closeButton = createElement('button', 'menu-button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Закрыть меню');
  closeButton.append(createIcon('close'));
  closeButton.addEventListener('click', closeMenu);
  top.append(brand, closeButton);
  const nav = createElement('nav', 'mobile-menu-nav');
  NAV_ITEMS.forEach((item, index) => nav.append(renderMobileLink(item.href, item.label, index, item.href === activePage ? 'is-active' : '')));
  const shapeRows = Object.entries(SHAPE_LABELS).map(([shape, label], index) => renderMobileLink(`catalog.html?shape=${shape}`, label, index, 'is-small'));
  const phoneDigits = (site.phone ?? '').replace(/[^\d+]/g, '');
  const contactRows = [['phone', site.phone, `tel:${phoneDigits}`], ['mail', site.email, `mailto:${site.email}`], ['map-pin', site.address, null]].filter(([, value]) => value).map(([iconName, value, href]) => renderMobileContact(iconName, value, href));
  const order = createWhatsAppLink(site.whatsappPhone, GENERAL_MESSAGE, 'button button-green', 'Написать в WhatsApp');
  menu.append(top, nav, renderMobileGroup('Каталог по форме', shapeRows, NAV_ITEMS.length));
  if (contactRows.length) menu.append(renderMobileGroup('Контакты', contactRows, NAV_ITEMS.length + 1));
  menu.append(order);
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  return menu;
}

function renderMenuButton(openMenu) {
  const button = createElement('button', 'menu-button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Открыть меню');
  button.append(createIcon('menu'));
  button.addEventListener('click', openMenu);
  return button;
}

function renderHeader(site, activePage) {
  const header = createElement('header', 'site-header');
  const inner = createElement('div', 'site-header-inner');
  const brand = createElement('a', 'brand', site.name);
  brand.href = 'index.html';
  const nav = createElement('nav', 'site-nav');
  NAV_ITEMS.forEach((item) => {
    const link = createElement('a', item.href === activePage ? 'is-active' : '', item.label);
    link.href = item.href;
    nav.append(link);
  });
  const write = createWhatsAppLink(site.whatsappPhone, GENERAL_MESSAGE, 'header-action', 'Написать');
  const setMenuOpen = (isOpen) => {
    header.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('is-locked', isOpen);
  };
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  inner.append(brand, nav, write, renderMenuButton(() => setMenuOpen(true)));
  header.append(inner, renderMobileMenu(site, activePage, () => setMenuOpen(false)));
  return header;
}

function renderFooterContact(iconName, value) {
  const row = createElement('span', 'footer-contact');
  row.append(createIcon(iconName), value);
  return row;
}

function renderFooter(site) {
  const footer = createElement('footer', 'site-footer');
  const columns = createElement('div', 'footer-columns');
  const menu = createElement('div', 'footer-column');
  menu.append(createElement('span', 'footer-heading', 'Меню'));
  NAV_ITEMS.forEach((item) => {
    const link = createElement('a', '', item.label);
    link.href = item.href;
    menu.append(link);
  });
  columns.append(menu);
  const contacts = createElement('div', 'footer-column');
  contacts.append(createElement('span', 'footer-heading', 'Контакты'));
  [['phone', site.phone], ['mail', site.email], ['map-pin', site.address]].filter(([, value]) => value).forEach(([iconName, value]) => contacts.append(renderFooterContact(iconName, value)));
  if (contacts.children.length > 1) columns.append(contacts);
  footer.append(columns, createElement('div', 'footer-wordmark', site.name));
  return footer;
}

export async function mountLayout(activePage) {
  startRevealOnScroll();
  const site = await fetchJson('data/site.json');
  document.body.prepend(renderHeader(site, activePage));
  document.body.append(renderFooter(site));
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    link.href = buildWhatsAppLink(site.whatsappPhone, link.dataset.whatsapp);
    link.target = '_blank';
    link.rel = 'noopener';
    link.prepend(createIcon('whatsapp', 'icon icon-button'));
  });
  document.querySelectorAll('[data-arrow]').forEach((link) => link.append(createIcon('arrow-right', 'icon icon-arrow')));
  document.querySelectorAll('[data-site-name]').forEach((element) => (element.textContent = site.name));
  return site;
}

export function renderOrderSteps(container) {
  ORDER_STEPS.forEach((step, index) => {
    const row = createElement('div', 'step-row');
    row.append(createElement('span', 'step-number', String(index + 1).padStart(2, '0')), createElement('span', 'step-title', step.title), createElement('span', 'step-text', step.text), createIcon(step.icon, 'icon step-icon'));
    container.append(row);
  });
}
