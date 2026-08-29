/* ============================================================
   core/carousel.js — карусель с кликабельными слайдами
   ============================================================ */

function getHeroSlides() {
  const cfg = (window.Content && Content.getSettings && Content.getSettings()) || {};
  return (cfg.heroSlides && cfg.heroSlides.length)
    ? cfg.heroSlides
    : ((window.SITE_CONFIG && window.SITE_CONFIG.heroSlides) || []);
}

function initCarousel() {
  const carousel = $('#heroCarousel');
  if (!carousel) return;
  const track = $('#carouselTrack');
  const nav = $('#carouselNav');
  const slides = getHeroSlides();

  if (!slides.length) { carousel.style.display = 'none'; return; }

  track.innerHTML = slides.map((s, idx) => {
    const clickable = s.action && s.action !== 'none';
    return `<div class="carousel__slide ${clickable ? 'carousel__slide--clickable' : ''}" data-slide-idx="${idx}">
      <img class="carousel__image" src="${s.image}" alt="${s.title || ''}" loading="lazy" />
      <div class="carousel__caption">
        <div class="carousel__caption-label">${s.label || ''}</div>
        <div class="carousel__caption-value">${s.title || ''}</div>
      </div>
    </div>`;
  }).join('');

  // Клики по слайдам
  track.querySelectorAll('.carousel__slide').forEach(slide => {
    slide.addEventListener('click', () => {
      const idx = +slide.dataset.slideIdx;
      handleSlideClick(idx);
    });
  });

  const slidesEls = track.querySelectorAll('.carousel__slide');
  const total = slidesEls.length;
  let current = 0, timer;

  slidesEls.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); reset(); });
    nav.appendChild(dot);
  });
  const dots = nav.querySelectorAll('.carousel__dot');

  function goTo(i) {
    current = i;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('is-active', k === current));
  }
  const next = () => goTo((current + 1) % total);
  const prev = () => goTo((current - 1 + total) % total);
  function start() { timer = setInterval(next, 5000); }
  function reset() { clearInterval(timer); start(); }

  $('#carouselNext').addEventListener('click', () => { next(); reset(); });
  $('#carouselPrev').addEventListener('click', () => { prev(); reset(); });
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', start);

  let startX = 0;
  carousel.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); reset(); }
  }, { passive: true });

  start();
}

function handleSlideClick(idx) {
  const slides = getHeroSlides();
  const slide = slides[idx];
  if (!slide || !slide.action || slide.action === 'none') return;

  if (slide.action === 'wok') {
    openWok();
  } else if (slide.action === 'category') {
    state.category = slide.target;
    renderCategoryTabs();
    renderMenu();
    const menuEl = $('#menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
  } else if (slide.action === 'page') {
    window.location.href = slide.target;
  }
}

window.initCarousel = initCarousel;
window.handleSlideClick = handleSlideClick;