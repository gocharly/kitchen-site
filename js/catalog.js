import { markPageReady } from './animations.js';
import { fetchJson, mountLayout, renderProductTile } from './common.js';
import { renderPagination } from './pagination.js';
import { renderShapeTabs } from './tabs.js';

const PAGE_SIZE_PHONE = 6;
const PAGE_SIZE_DESKTOP = 8;
const desktopQuery = matchMedia('(min-width: 900px)');

const productsRequest = fetchJson('data/products.json');
await mountLayout('catalog.html');
const { products } = await productsRequest;
const params = new URLSearchParams(location.search);
const availableShapes = [...new Set(products.map((product) => product.shape))];
let activeShape = params.get('shape') ?? '';
let activePage = Number(params.get('page')) || 1;

function readPageSize() {
  return desktopQuery.matches ? PAGE_SIZE_DESKTOP : PAGE_SIZE_PHONE;
}

function writeAddress() {
  const query = new URLSearchParams();
  if (activeShape) query.set('shape', activeShape);
  if (activePage > 1) query.set('page', activePage);
  const text = query.toString();
  history.replaceState(null, '', text ? `?${text}` : location.pathname);
}

function showCatalog() {
  const visible = products.filter((product) => !activeShape || product.shape === activeShape);
  const pageSize = readPageSize();
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  activePage = Math.min(Math.max(activePage, 1), pageCount);
  const start = (activePage - 1) * pageSize;
  document.getElementById('catalog-grid').replaceChildren(...visible.slice(start, start + pageSize).map(renderProductTile));
  document.getElementById('catalog-count').textContent = `${visible.length} шт.`;
  renderShapeTabs(document.getElementById('catalog-tabs'), activeShape, selectShape, availableShapes);
  renderPagination(document.getElementById('catalog-pagination'), pageCount, activePage, selectPage);
  writeAddress();
}

function selectShape(shape) {
  activeShape = shape;
  activePage = 1;
  showCatalog();
}

function selectPage(page) {
  activePage = page;
  showCatalog();
  document.querySelector('.catalog-bar').scrollIntoView({ behavior: 'smooth' });
}

desktopQuery.addEventListener('change', showCatalog);
showCatalog();
await markPageReady();
