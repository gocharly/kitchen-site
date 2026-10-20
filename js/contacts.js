import { markPageReady } from './animations.js';
import { createElement, mountLayout } from './common.js';
import { createIcon } from './icons.js';

const site = await mountLayout('contacts.html');
const list = document.getElementById('contact-list');
const phoneDigits = (site.phone ?? '').replace(/[^\d+]/g, '');
const contacts = [
  { icon: 'phone', label: 'Телефон', value: site.phone, href: `tel:${phoneDigits}` },
  { icon: 'mail', label: 'Почта', value: site.email, href: `mailto:${site.email}` },
  { icon: 'map-pin', label: 'Адрес', value: site.address, href: null },
];

function renderContactRow({ icon, label, value, href }) {
  const row = createElement('div', 'contact-row');
  const caption = createElement('span', 'contact-label');
  caption.append(createIcon(icon), label);
  const content = createElement(href ? 'a' : 'span', 'contact-value', value);
  if (href) content.href = href;
  row.append(caption, content);
  return row;
}

contacts.filter((contact) => contact.value).forEach((contact) => list.append(renderContactRow(contact)));
await markPageReady();
