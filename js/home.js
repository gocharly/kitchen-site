import { markPageReady } from './animations.js';
import { fetchJson, mountLayout, renderOrderSteps, renderProductTile } from './common.js';
import { renderShapeTabs } from './tabs.js';

const HOME_TILE_LIMIT = 4;

const productsRequest = fetchJson('data/products.json');
await mountLayout('index.html');
renderOrderSteps(document.getElementById('steps'));
const { products } = await productsRequest;
const availableShapes = [...new Set(products.map((product) => product.shape))];
const grid = document.getElementById('home-grid');

function showShape(shape) {
  const visible = products.filter((product) => !shape || product.shape === shape).slice(0, HOME_TILE_LIMIT);
  grid.replaceChildren(...visible.map(renderProductTile));
  renderShapeTabs(document.getElementById('home-tabs'), shape, showShape, availableShapes);
}
showShape('');
await markPageReady();
