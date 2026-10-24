import { markPageReady, startRevealOnScroll } from './animations.js';
import { LAYOUT_LABELS, SHAPE_LABELS, buildWhatsAppLink, createElement, createWhatsAppLink, fetchJson, formatPrice, renderOrderSteps } from './common.js';
import { createDrawer } from './drawer.js';
import { createIcon } from './icons.js';
import { startAutoSlide } from './slider.js';

const PAGE_SIZE_PHONE = 6;
const PAGE_SIZE_DESKTOP = 8;
const GENERAL_MESSAGE = 'Здравствуйте! Хочу подобрать кухню.';
const KITCHEN_HASH_PREFIX = '#kitchen=';
const KEY_SPEC_LABELS = ['Серия', 'Цвет фасада', 'Цвет корпуса', 'Материал фасада'];
const SPEC_ICONS = { 'Размер': 'ruler', 'Расположение': 'move-horizontal', 'Длина': 'ruler', 'Высота': 'ruler', 'Глубина': 'ruler', 'Глубина со столешницей': 'ruler', 'Серия': 'layout-grid', 'Стиль': 'shapes', 'Цвет фасада': 'door', 'Цвет корпуса': 'box', 'Материал фасада': 'door', 'Покрытие фасада': 'door', 'Тип поверхности': 'door', 'Материал корпуса': 'box', 'Столешница': 'layers', 'Ручки': 'sliders', 'Доводчики': 'sliders', 'Стеновая панель': 'layers', 'Торцевые фасады': 'door', 'Цена за погонный метр': 'tag', 'Артикул': 'tag' };
const desktopQuery = matchMedia('(min-width: 900px)');

startRevealOnScroll();
const [site, { products }, payment, { reviews }] = await Promise.all([fetchJson('data/site.json'), fetchJson('data/products.json'), fetchJson('data/payment.json'), fetchJson('data/reviews.json')]);
const availableShapes = Object.keys(SHAPE_LABELS).filter((shape) => products.some((product) => product.shape === shape));
let activeShape = '';
let visibleCount = readPageSize();
const paymentDrawer = createDrawer();
const drawer = createDrawer(() => history.replaceState(null, '', location.pathname + location.search));

function readPageSize() {
  return desktopQuery.matches ? PAGE_SIZE_DESKTOP : PAGE_SIZE_PHONE;
}

function readSpecValue(product, label) {
  return product.specs?.find((spec) => spec.label === label)?.value ?? null;
}

function buildOrderMessage(product) {
  const link = `${location.origin}${location.pathname}${KITCHEN_HASH_PREFIX}${product.id}`;
  return ['Здравствуйте! Хочу заказать кухню:', product.title, `Размер: ${product.size}`, `Цена: ${formatPrice(product.price)}`, link].join('\n');
}

function fillSiteDetails() {
  document.querySelectorAll('[data-site-name]').forEach((element) => (element.textContent = site.name));
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    link.href = buildWhatsAppLink(site.whatsappPhone, link.dataset.whatsapp);
    link.target = '_blank';
    link.rel = 'noopener';
    link.prepend(createIcon('whatsapp', 'icon icon-button'));
  });
  document.querySelectorAll('[data-arrow]').forEach((link) => link.append(createIcon('arrow-down', 'icon icon-arrow')));
  document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} ${site.name}`;
  const phoneDigits = (site.phone ?? '').replace(/[^\d+]/g, '');
  const contacts = [['phone', site.phone, `tel:${phoneDigits}`], ['mail', site.email, `mailto:${site.email}`], ['map-pin', site.address, null]].filter(([, value]) => value);
  document.getElementById('contact-list').append(...contacts.map(([iconName, value, href]) => {
    const row = createElement(href ? 'a' : 'span', 'contact-row');
    if (href) row.href = href;
    row.append(createIcon(iconName), value);
    return row;
  }));
}

function renderKitchenCard(product) {
  const card = createElement('button', 'tile');
  card.type = 'button';
  const frame = createElement('span', 'tile-image');
  const image = createElement('img');
  const cover = product.images[0];
  image.src = cover.thumb ?? cover.src;
  image.alt = product.title;
  image.loading = 'lazy';
  image.decoding = 'async';
  frame.append(image);
  const text = createElement('span', 'tile-text');
  text.append(createElement('span', 'tile-title', product.title), createElement('span', 'tile-meta', product.size), createElement('span', 'tile-price', formatPrice(product.price)));
  card.append(frame, text);
  card.addEventListener('click', () => openKitchen(product));
  return card;
}

function renderChips() {
  const chips = document.getElementById('shape-chips');
  chips.replaceChildren(...[['', 'Все'], ...availableShapes.map((shape) => [shape, SHAPE_LABELS[shape]])].map(([shape, label]) => {
    const chip = createElement('button', shape === activeShape ? 'chip is-active' : 'chip', label);
    chip.type = 'button';
    chip.setAttribute('role', 'tab');
    chip.setAttribute('aria-selected', String(shape === activeShape));
    chip.addEventListener('click', () => selectShape(shape));
    return chip;
  }));
}

function renderGrid() {
  const filtered = products.filter((product) => !activeShape || product.shape === activeShape);
  document.getElementById('kitchen-grid').replaceChildren(...filtered.slice(0, visibleCount).map(renderKitchenCard));
  document.getElementById('kitchen-count').textContent = `${filtered.length} моделей`;
  document.getElementById('show-more').hidden = visibleCount >= filtered.length;
}

function selectShape(shape) {
  activeShape = shape;
  visibleCount = readPageSize();
  renderChips();
  renderGrid();
}

function showMore() {
  visibleCount += readPageSize();
  renderGrid();
}

function renderSlides(product) {
  const wrapper = createElement('div', 'slides-wrapper');
  const track = createElement('div', 'slides');
  product.images.forEach((image) => {
    const slide = createElement('img', 'slide');
    slide.src = image.src;
    slide.alt = product.title;
    slide.decoding = 'async';
    track.append(slide);
  });
  const counter = createElement('span', 'slides-counter', `1 / ${product.images.length}`);
  track.addEventListener('scroll', () => {
    const index = Math.round(track.scrollLeft / track.clientWidth) + 1;
    counter.textContent = `${index} / ${product.images.length}`;
  }, { passive: true });
  wrapper.append(track);
  if (product.images.length > 1) wrapper.append(counter);
  return wrapper;
}

function renderFactRow(label, value) {
  const row = createElement('div', 'fact-row');
  const caption = createElement('span', 'fact-label');
  caption.append(createIcon(SPEC_ICONS[label] ?? 'info'), label);
  const isIncluded = /комплекте/i.test(value);
  row.append(caption, createElement('span', isIncluded ? 'fact-value is-included' : 'fact-value', value));
  return row;
}

function renderFacts(rows) {
  const list = createElement('div', 'facts');
  list.append(...rows.filter(([, value]) => value).map(([label, value]) => renderFactRow(label, value)));
  return list;
}

function renderToggle(label, buildContent) {
  const block = createElement('div', 'toggle');
  const button = createElement('button', 'toggle-button');
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.append(createElement('span', '', label), createIcon('chevron-down'));
  const body = createElement('div', 'toggle-body');
  button.addEventListener('click', () => {
    const isOpen = block.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
    if (isOpen && !body.childElementCount) body.append(buildContent());
  });
  block.append(button, body);
  return block;
}

function renderKitchenSheet(product) {
  const sheet = createElement('div', 'sheet');
  const keyFacts = [['Размер', product.size], ['Расположение', LAYOUT_LABELS[product.shape]], ...KEY_SPEC_LABELS.map((label) => [label, readSpecValue(product, label)])];
  const allFacts = [...(product.specs ?? []).map((spec) => [spec.label, spec.value]), ['Артикул', product.sku]];
  const order = createElement('div', 'sheet-order');
  order.append(createWhatsAppLink(site.whatsappPhone, buildOrderMessage(product), 'button button-green', 'Заказать'));
  sheet.append(renderSlides(product), createElement('h3', 'sheet-title', product.title), createElement('div', 'sheet-price', formatPrice(product.price)), renderFacts(keyFacts), renderToggle('Все характеристики', () => renderFacts(allFacts)));
  if (product.description) sheet.append(renderToggle('Описание', () => createElement('p', 'sheet-description', product.description)));
  sheet.append(order);
  return sheet;
}

function openKitchen(product) {
  drawer.open('Кухня', renderKitchenSheet(product));
  history.replaceState(null, '', `${KITCHEN_HASH_PREFIX}${product.id}`);
}

function openKitchenFromHash() {
  if (!location.hash.startsWith(KITCHEN_HASH_PREFIX)) return;
  const product = products.find((item) => item.id === location.hash.slice(KITCHEN_HASH_PREFIX.length));
  if (product) openKitchen(product);
}

function formatReviewDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function renderReviewCard(review) {
  const card = createElement('div', 'review');
  const avatar = createElement('span', 'review-avatar');
  avatar.append(createIcon('user'));
  const meta = createElement('span', 'review-meta');
  meta.append(createIcon('whatsapp', 'icon icon-button icon-mini'), formatReviewDate(review.date));
  const body = createElement('div', 'review-body');
  body.append(createElement('span', 'review-author', review.author), meta, createElement('p', 'review-text', review.text));
  card.append(avatar, body);
  return card;
}

function renderReviewsEmpty() {
  const block = createElement('div', 'review-empty');
  const text = createElement('div', 'review-empty-text');
  text.append(createElement('span', 'review-empty-title', 'Отзывов пока нет'), createElement('p', 'review-empty-note', 'Купили кухню? Расскажите, как её собрали и как она служит. Отзыв появится здесь после публикации.'));
  block.append(createIcon('message-circle', 'icon review-empty-icon'), text, createWhatsAppLink(site.whatsappPhone, 'Здравствуйте! Хочу оставить отзыв.', 'button button-green', 'Оставить отзыв'));
  return block;
}

function renderReviews() {
  const area = document.getElementById('review-area');
  if (!reviews.length) return area.append(renderReviewsEmpty());
  const track = createElement('div', 'review-track');
  track.append(...reviews.map(renderReviewCard));
  area.append(track);
  document.getElementById('review-count').textContent = `${reviews.length}`;
  if (reviews.length > 1) startAutoSlide(track);
}

function renderPaymentSteps() {
  const steps = createElement('div', 'pay-steps');
  ['Откройте приложение банка', 'Выберите оплату по QR-коду', 'Наведите камеру на код'].forEach((text) => {
    const row = createElement('span', 'pay-step');
    row.append(createIcon('check'), text);
    steps.append(row);
  });
  return steps;
}

function renderPaymentQr() {
  const block = createElement('div', 'pay-qr');
  const image = createElement('img');
  image.src = `${payment.image}?v=${encodeURIComponent(payment.updatedAt ?? '')}`;
  image.alt = 'QR-код для оплаты';
  block.append(image);
  return block;
}

function renderPaymentSheet() {
  const sheet = createElement('div', 'pay-sheet');
  const isReady = payment.enabled && payment.image;
  sheet.append(createElement('h3', 'sheet-title pay-title', isReady ? 'Оплата по QR' : 'QR для оплаты пока не добавлен'));
  if (isReady) {
    sheet.append(renderPaymentQr());
    if (payment.note) sheet.append(createElement('p', 'pay-note', payment.note));
    sheet.append(renderPaymentSteps());
  } else {
    sheet.append(createElement('p', 'pay-note', 'Напишите нам в WhatsApp, пришлём реквизиты для оплаты.'));
  }
  sheet.append(createWhatsAppLink(site.whatsappPhone, 'Здравствуйте! Вопрос по оплате.', 'button button-green pay-chat', 'Написать в WhatsApp'));
  return sheet;
}

function setupPaymentButton() {
  const button = document.getElementById('pay-button');
  button.append(createIcon('qr-code'), 'Оплата');
  button.addEventListener('click', () => paymentDrawer.open('Оплата', renderPaymentSheet()));
}

fillSiteDetails();
setupPaymentButton();
renderReviews();
renderOrderSteps(document.getElementById('steps'));
renderChips();
renderGrid();
document.getElementById('show-more').addEventListener('click', showMore);
openKitchenFromHash();
await markPageReady();
