const WHATSAPP_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

const ICON_BODIES = {
  whatsapp: `<path fill="currentColor" stroke="none" d="${WHATSAPP_PATH}"/>`,
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
  'arrow-up-right': '<path d="M7 17L17 7M8 7h9v9"/>',
  'chevron-left': '<path d="M15 6l-6 6 6 6"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  phone: '<path class="f" d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect class="f" x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 5.5 8.5-5.5"/>',
  'map-pin': '<path class="f" d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  'layout-grid': '<rect class="f" x="3" y="3" width="8" height="8" rx="2.5"/><rect class="f" x="13" y="3" width="8" height="8" rx="2.5"/><rect class="f" x="3" y="13" width="8" height="8" rx="2.5"/><rect class="f" x="13" y="13" width="8" height="8" rx="2.5"/>',
  cursor: '<path class="f" d="M5 3l14 7-6 2-2 6z"/>',
  'message-circle': '<path class="f" d="M21 12a8.5 8.5 0 0 1-12.3 7.6L3 21l1.5-5.4A8.5 8.5 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  'message-square': '<path class="f" d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 12.5h5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  user: '<circle class="f" cx="12" cy="8" r="4"/><path class="f" d="M4 21a8 8 0 0 1 16 0z"/>',
  shapes: '<path class="f" d="M8 3l-4.5 7.5h9z"/><rect class="f" x="3" y="14" width="7" height="7" rx="2"/><circle class="f" cx="17.5" cy="17.5" r="3.5"/>',
  'move-horizontal': '<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>',
  ruler: '<path class="f" d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  maximize: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  door: '<rect class="f" x="5" y="3" width="14" height="18" rx="2"/><path d="M15 12h.01"/>',
  box: '<path class="f" d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  layers: '<path class="f" d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle class="f" cx="16" cy="7" r="2.2"/><circle class="f" cx="8" cy="17" r="2.2"/>',
  clock: '<circle class="f" cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'shield-check': '<path class="f" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  tag: '<path class="f" d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
  check: '<circle class="f" cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  'qr-code': '<rect class="f" x="3" y="3" width="7" height="7" rx="1.5"/><rect class="f" x="14" y="3" width="7" height="7" rx="1.5"/><rect class="f" x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4"/>',
  info: '<circle class="f" cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};

export function createIcon(name, className = 'icon') {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('class', className);
  icon.innerHTML = ICON_BODIES[name] ?? ICON_BODIES.info;
  return icon;
}
