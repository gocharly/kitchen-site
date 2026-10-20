const AUTO_SLIDE_INTERVAL_MS = 4000;
const EDGE_TOLERANCE_PX = 4;

function slideToNextCard(track) {
  const firstCard = track.firstElementChild;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const reachedEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - EDGE_TOLERANCE_PX;
  track.scrollTo({ left: reachedEnd ? 0 : track.scrollLeft + firstCard.offsetWidth + gap, behavior: 'smooth' });
}

export function startAutoSlide(track) {
  let isPaused = false;
  const pause = () => (isPaused = true);
  const resume = () => (isPaused = false);
  ['pointerenter', 'pointerdown', 'touchstart'].forEach((name) => track.addEventListener(name, pause, { passive: true }));
  ['pointerleave', 'pointerup', 'touchend'].forEach((name) => track.addEventListener(name, resume, { passive: true }));
  const timer = setInterval(() => {
    if (!track.isConnected) return clearInterval(timer);
    if (isPaused || track.scrollWidth <= track.clientWidth) return;
    slideToNextCard(track);
  }, AUTO_SLIDE_INTERVAL_MS);
}
