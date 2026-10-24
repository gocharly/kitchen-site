import { LAYOUT_LABELS, SHAPE_LABELS, buildProductMessage, createElement, createWhatsAppLink, fetchJson, formatPrice, mountLayout, renderProductTile } from './common.js';
import { startAutoSlide } from './slider.js';
import { markPageReady } from './animations.js';
import { createIcon } from './icons.js';
import { createDrawer } from './drawer.js';

const SPEC_ICONS = { 'Форма': 'shapes', 'Расположение': 'move-horizontal', 'Размер': 'ruler', 'Длина': 'ruler', 'Высота': 'ruler', 'Глубина': 'ruler', 'Глубина со столешницей': 'ruler', 'Площадь кухни': 'maximize', 'Серия': 'layout-grid', 'Стиль': 'shapes', 'Цвет фасада': 'door', 'Цвет корпуса': 'box', 'Материал фасада': 'door', 'Покрытие фасада': 'door', 'Тип поверхности': 'door', 'Материал корпуса': 'box', 'Столешница': 'layers', 'Ручки': 'sliders', 'Доводчики': 'sliders', 'Стеновая панель': 'layers', 'Торцевые фасады': 'door', 'Цена за погонный метр': 'tag', 'Артикул': 'tag' };

const dataRequests = Promise.all([fetchJson('data/products.json'), fetchJson('data/reviews.json')]);
const site = await mountLayout('catalog.html');
const [{ products }, { reviews }] = await dataRequests;
const product = products.find((item) => item.id === new URLSearchParams(location.search).get('id'));
const root = document.getElementById('product-root');

function renderGallery(images, title) {
  const gallery = createElement('div', 'gallery');
  const main = createElement('img', 'gallery-main');
  main.alt = title;
  const thumbs = createElement('div', 'gallery-thumbs');
  const select = (image, thumb) => {
    main.classList.remove('is-swapping');
    void main.offsetWidth;
    main.classList.add('is-swapping');
    main.src = image.src;
    main.style.objectPosition = image.position;
    thumbs.querySelectorAll('.is-active').forEach((active) => active.classList.remove('is-active'));
    thumb.classList.add('is-active');
  };
  images.forEach((image, index) => {
    const thumb = createElement('button', 'gallery-thumb');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `Фото ${index + 1}`);
    const preview = createElement('img');
    preview.src = image.thumb ?? image.src;
    preview.alt = '';
    preview.style.objectPosition = image.position;
    thumb.append(preview);
    thumb.addEventListener('click', () => select(image, thumb));
    thumbs.append(thumb);
  });
  select(images[0], thumbs.firstChild);
  gallery.append(main, thumbs);
  return gallery;
}

function renderSpecs(item) {
  const rows = [['Форма', SHAPE_LABELS[item.shape]], ['Расположение', LAYOUT_LABELS[item.shape]], ['Размер', item.size], ['Площадь кухни', item.roomArea], ...(item.specs ?? []).map((spec) => [spec.label, spec.value]), ['Артикул', item.sku]].filter(([, value]) => value);
  const card = createElement('div', 'spec-card');
  rows.forEach(([label, value]) => {
    const row = createElement('div', 'spec-row');
    const caption = createElement('span', 'spec-label');
    caption.append(createIcon(SPEC_ICONS[label] ?? 'info'), label);
    row.append(caption, createElement('span', 'spec-value', value));
    card.append(row);
  });
  return card;
}

function renderReview(review) {
  const card = createElement('div', 'review');
  const avatar = createElement('span', 'review-avatar');
  avatar.append(createIcon('user'));
  const body = createElement('div', 'review-body');
  body.append(createElement('span', 'review-author', review.author), createElement('p', 'review-text', review.text));
  card.append(avatar, body);
  return card;
}

function renderReviews(item) {
  const list = createElement('div', 'review-track');
  const own = reviews.filter((review) => review.productId === item.id);
  if (!own.length) {
    const empty = createElement('div', 'review-empty');
    empty.append(createIcon('message-square'), 'Отзывов пока нет.');
    list.append(empty);
  }
  own.forEach((review) => list.append(renderReview(review)));
  startAutoSlide(list);
  return list;
}

function renderDescription(text) {
  const block = createElement('div', 'product-description');
  block.append(createElement('h2', 'section-title', 'Описание'), createElement('p', 'section-text', text));
  return block;
}

function renderDrawerTrigger(drawer, { iconName, label, heading, buildContent }) {
  const trigger = createElement('button', 'drawer-trigger');
  trigger.type = 'button';
  trigger.append(createIcon(iconName), createElement('span', 'drawer-trigger-label', label), createIcon('chevron-right'));
  trigger.addEventListener('click', () => drawer.open(heading, buildContent()));
  return trigger;
}

function renderDrawerTriggers(item, drawer) {
  const reviewCount = reviews.filter((review) => review.productId === item.id).length;
  const triggers = createElement('div', 'drawer-triggers');
  triggers.append(
    renderDrawerTrigger(drawer, { iconName: 'list', label: 'Характеристики', heading: 'Характеристики', buildContent: () => renderSpecs(item) }),
    renderDrawerTrigger(drawer, { iconName: 'message-square', label: reviewCount ? `Отзывы (${reviewCount})` : 'Отзывы', heading: 'Отзывы', buildContent: () => renderReviews(item) }),
  );
  return triggers;
}

function renderMissing() {
  root.append(createElement('h1', 'page-title', 'Кухня не найдена'));
  const back = createElement('a', 'button button-dark', 'В каталог');
  back.href = 'catalog.html';
  back.append(createIcon('arrow-right', 'icon icon-arrow'));
  root.append(back);
}

function renderProduct(item) {
  document.title = item.title;
  const crumbs = createElement('div', 'crumbs');
  const catalogLink = createElement('a', '', 'Каталог');
  catalogLink.href = 'catalog.html';
  crumbs.append(catalogLink, createIcon('chevron-right'), createElement('span', '', item.title));
  const info = createElement('div', 'product-info');
  const order = createWhatsAppLink(site.whatsappPhone, buildProductMessage(item), 'button button-green', 'Заказать');
  info.append(createElement('h1', 'product-title', item.title), createElement('div', 'product-price', formatPrice(item.price)));
  const orderBar = createElement('div', 'order-bar');
  orderBar.append(order);
  info.append(orderBar, renderDrawerTriggers(item, createDrawer()));
  document.body.classList.add('has-order-bar');
  const layout = createElement('div', 'product-layout');
  layout.append(renderGallery(item.images, item.title), info);
  if (item.description) layout.append(renderDescription(item.description));
  const similar = products.filter((other) => other.id !== item.id && other.shape === item.shape);
  root.append(crumbs, layout);
  if (!similar.length) return;
  const grid = createElement('div', 'tile-grid');
  grid.append(...similar.slice(0, 4).map(renderProductTile));
  root.append(createElement('h2', 'section-title similar-title', 'Похожие кухни'), grid);
}

if (product) renderProduct(product);
else renderMissing();
await markPageReady();
