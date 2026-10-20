const REVEAL_SELECTOR = '.page-title, .crumbs, .section-title, .section-text, .tile, .step-row, .spec-card, .review, .gallery, .product-title, .product-price, .cta-image, .cta-card, .footer-wordmark';
const STAGGER_LIMIT = 8;
const revealedElements = new WeakSet();

const intersectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      intersectionObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -4% 0px' },
);

function prepareRevealElements() {
  document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
    if (revealedElements.has(element)) return;
    revealedElements.add(element);
    const siblings = [...element.parentElement.children].filter((sibling) => sibling.matches(REVEAL_SELECTOR));
    element.style.setProperty('--i', Math.min(siblings.indexOf(element), STAGGER_LIMIT));
    element.classList.add('reveal');
    intersectionObserver.observe(element);
  });
}

export function startRevealOnScroll() {
  prepareRevealElements();
  new MutationObserver(prepareRevealElements).observe(document.body, { childList: true, subtree: true });
}

const READY_TIMEOUT_MS = 4000;
const FONT_WAIT_MS = 1500;

function revealPage() {
  prepareRevealElements();
  document.documentElement.classList.add('ready');
}

export async function markPageReady() {
  await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS))]);
  revealPage();
}

setTimeout(revealPage, READY_TIMEOUT_MS);
