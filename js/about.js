import { markPageReady } from './animations.js';
import { mountLayout, renderOrderSteps } from './common.js';

await mountLayout('about.html');
renderOrderSteps(document.getElementById('steps'));
await markPageReady();
