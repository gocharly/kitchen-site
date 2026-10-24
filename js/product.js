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

const KEY_SPEC_LABELS = ['Серия', 'Цвет фасада', 'Цвет корпуса', 'Материал фасада'];
const KIT_PATTERN = /комплекте|отдельно/i;
const INCLUDED_PATTERN = /комплекте/i;

function readSpecValue(item, label) {
  return item.specs?.find((spec) => spec.label === label)?.value ?? null;
}

function renderFactRow(iconName, label, value, valueClass) {
  const row = createElement('div', 'fact-row');
  const caption = createElement('span', 'fact-label');
  caption.append(createIcon(iconName), label);
  row.append(caption, createElement('span', valueClass ? `fact-value ${valueClass}` : 'fact-value', value));
  return row;
}

function renderLinkRow(iconName, label, onClick) {
  const row = createElement('button', 'link-row');
  row.type = 'button';
  row.append(createIcon(iconName), createElement('span', 'link-row-label', label), createIcon('chevron-right'));
  row.addEventListener('click', onClick);
  return row;
}

function renderTitleCard(item) {
  const card = createElement('div', 'info-card');
  card.append(createElement('h1', 'product-title', item.title));
  if (item.sku) card.append(createElement('span', 'product-code', `Артикул: ${item.sku}`));
  return card;
}

function renderPriceCard(item, orderBar) {
  const card = createElement('div', 'info-card price-card');
  card.append(createElement('div', 'product-price', formatPrice(item.price)), orderBar);
  return card;
}

function renderKeySpecsCard(item, drawer) {
  const card = createElement('div', 'info-card');
  const facts = [['Размер', item.size], ...KEY_SPEC_LABELS.map((label) => [label, readSpecValue(item, label)])].filter(([, value]) => value);
  facts.forEach(([label, value]) => card.append(renderFactRow(SPEC_ICONS[label] ?? 'info', label, value)));
  card.append(renderLinkRow('list', 'Все характеристики', () => drawer.open('Характеристики', renderSpecs(item))));
  return card;
}

function renderKitCard(item) {
  const kit = (item.specs ?? []).filter((spec) => KIT_PATTERN.test(spec.value));
  if (!kit.length) return null;
  const card = createElement('div', 'info-card');
  kit.forEach((spec) => {
    const isIncluded = INCLUDED_PATTERN.test(spec.value);
    card.append(renderFactRow(isIncluded ? 'check' : 'info', spec.label, isIncluded ? 'В комплекте' : 'Отдельно', isIncluded ? 'is-included' : ''));
  });
  return card;
}

function renderReviewsLinkCard(item) {
  const reviewCount = reviews.filter((review) => review.productId === item.id).length;
  const card = createElement('div', 'info-card');
  card.append(renderLinkRow('message-square', reviewCount ? `Отзывы (${reviewCount})` : 'Отзывы', () => document.querySelector('.reviews-section').scrollIntoView({ behavior: 'smooth' })));
  return card;
}

function renderReviewsSection(item) {
  const reviewCount = reviews.filter((review) => review.productId === item.id).length;
  const section = createElement('section', 'reviews-section');
  section.append(createElement('h2', 'section-title', reviewCount ? `Отзывы (${reviewCount})` : 'Отзывы'), renderReviews(item));
  return section;
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
  const orderBar = createElement('div', 'order-bar');
  orderBar.append(order);
  info.append(renderTitleCard(item), renderPriceCard(item, orderBar), renderKeySpecsCard(item, createDrawer()));
  const kitCard = renderKitCard(item);
  if (kitCard) info.append(kitCard);
  info.append(renderReviewsLinkCard(item));
  document.body.classList.add('has-order-bar');
  const layout = createElement('div', 'product-layout');
  layout.append(renderGallery(item.images, item.title), info);
  if (item.description) layout.append(renderDescription(item.description));
  const similar = products.filter((other) => other.id !== item.id && other.shape === item.shape);
  root.append(crumbs, layout, renderReviewsSection(item));
  if (!similar.length) return;
  const grid = createElement('div', 'tile-grid');
  grid.append(...similar.slice(0, 4).map(renderProductTile));
  root.append(createElement('h2', 'section-title similar-title', 'Похожие кухни'), grid);
}

if (product) renderProduct(product);
else renderMissing();
await markPageReady();
