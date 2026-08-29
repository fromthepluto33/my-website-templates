/* ============================================================
   core/wok.js — WOK-конструктор (модалка + встроенный)
   v2: мультивыбор топпингов, платные соусы, инфо-блок овощей
   ============================================================ */

const _WOK_VEG = (typeof WOK_VEG_IMAGE !== 'undefined' && WOK_VEG_IMAGE) ? WOK_VEG_IMAGE : 'images/wok_vegetables.jpg';

function wokBannerTemplate() {
  return `<button class="wok-banner" data-open-wok>
    <img class="wok-banner__image" src="images/soberi-svoj-wok.webp" alt="WOK" loading="lazy" />
    <div class="wok-banner__content">
      <div>
        <div class="wok-banner__eyebrow">Конструктор · 鍋</div>
        <div class="wok-banner__title">Собери свой WOK</div>
        <div class="wok-banner__note">Основа + топпинги + соус · от 210 ₽</div>
      </div>
    </div>
  </button>`;
}

function openWok() {
  state.wok = { step: 0, base: null, toppings: [], sauce: null, qty: 1 };
  renderWok(); openModal('wokModal');
}

/* Цена = основа + сумма топпингов + соус */
function wokUnitPrice() {
  const w = state.wok;
  const toppings = (w.toppings || []).reduce((s, t) => s + (t.price || 0), 0);
  const sauce = w.sauce ? (w.sauce.price || 0) : 0;
  return WOK_BASE_PRICE + toppings + sauce;
}

function toppingsNames(w) { return (w.toppings || []).map(t => t.name).join(', ') || '—'; }

function renderWok(prefix = 'wok') {
  const w = state.wok, cfg = window.WOK_CONFIG;
  const titles = ['Основа', 'Топпинги', 'Соус', 'Результат'];

  const body = $('#' + prefix + 'Body');
  const progress = $('#' + prefix + 'Progress');
  const title = $('#' + prefix + 'StepTitle');
  const summaryList = $('#' + prefix + 'SummaryList');
  const summaryTotal = $('#' + prefix + 'SummaryTotal');

  if (!body) return;

  if (title) title.textContent = 'Шаг ' + (w.step + 1) + ': ' + titles[w.step];
  if (progress) progress.innerHTML = titles.map((_, i) =>
    `<span class="step-progress__segment ${i <= w.step ? 'is-done' : ''}"></span>`).join('');

  let html = '';
  if (w.step === 0) {
    html = '<div class="option-grid">' + cfg.bases.map((b, i) => `
      <button class="option-card ${w.base && w.base.name === b.name ? 'is-selected' : ''}" data-wok="base" data-idx="${i}">
        <span class="option-card__image"><img src="${b.image}" alt="${b.name}" loading="lazy" /></span>
        <span class="option-card__name">${b.name}</span>
        <span class="option-card__note">${b.note}</span>
        <span class="option-card__price">${WOK_BASE_PRICE} ₽</span>
      </button>`).join('') + '</div>';

  } else if (w.step === 1) {
    html = '<div class="option-grid">' + cfg.toppings.map((t, i) => `
      <button class="option-card ${(w.toppings || []).some(x => x.name === t.name) ? 'is-selected' : ''}" data-wok="topping" data-idx="${i}">
        <span class="option-card__image"><img src="${t.image}" alt="${t.name}" loading="lazy" /></span>
        <span class="option-card__name">${t.name}</span>
        <span class="option-card__price option-card__price--accent">+${t.price || 0} ₽</span>
      </button>`).join('') + '</div>' +
      '<p class="wok-note">Можно выбрать несколько топпингов — каждый добавляется к стоимости.</p>';

  } else if (w.step === 2) {
    html = '<div class="sauce-list">' + cfg.sauces.map((s, i) => `
      <button class="sauce-row ${w.sauce && w.sauce.name === s.name ? 'is-selected' : ''}" data-wok="sauce" data-idx="${i}">
        <span class="sauce-row__left"><span class="sauce-row__radio"><span class="sauce-row__dot"></span></span>
        <span class="sauce-row__name">${s.name}</span></span>
        <span class="sauce-row__price sauce-row__price--accent">+${s.price || 0} ₽</span>
      </button>`).join('') + `<p class="wok-note">${cfg.note}</p></div>`;

  } else {
    html = `<div class="wok-result">
        <div class="wok-result__image"><img src="images/soberi-svoj-wok.webp" alt="WOK" /></div>
        <div class="wok-result__info">
          <div class="wok-result__name">WOK «${toppingsNames(w)}»</div>
          <div class="wok-result__mods">Основа: ${w.base.name}<br/>Топпинги: ${toppingsNames(w)}<br/>Соус: ${w.sauce.name}</div>
          <div class="wok-result__note">овощи и кунжут включены</div>
        </div>
      </div>
      <div class="wok-result__controls">
        <span class="product-card__price">${fmt(wokUnitPrice())} ₽ / шт</span>
        <div class="quantity-stepper quantity-stepper--compact">
          <button class="quantity-stepper__button" data-wok-qty="-1">${iconSvg('minus')}</button>
          <span class="quantity-stepper__value">${w.qty}</span>
          <button class="quantity-stepper__button quantity-stepper__button--plus" data-wok-qty="1">${iconSvg('plus')}</button>
        </div>
      </div>
      <div class="wok-info">
        <img class="wok-info__img" src="${_WOK_VEG}" alt="Стандартный набор овощей" />
        <div class="wok-info__text">В стоимость WOK входит стандартный набор овощей: <b>перец, цукини, лук</b>. Блюдо посыпается жареным кунжутом.</div>
      </div>`;
  }
  body.innerHTML = html;

  body.querySelectorAll('[data-wok]').forEach(b => b.addEventListener('click', () => {
    const idx = +b.dataset.idx, type = b.dataset.wok;
    if (type === 'base') state.wok.base = cfg.bases[idx];
    if (type === 'topping') {
      const t = cfg.toppings[idx];
      const i = state.wok.toppings.findIndex(x => x.name === t.name);
      if (i >= 0) state.wok.toppings.splice(i, 1); else state.wok.toppings.push(t);
    }
    if (type === 'sauce') state.wok.sauce = cfg.sauces[idx];
    renderWok(prefix);
  }));
  body.querySelectorAll('[data-wok-qty]').forEach(b => b.addEventListener('click', () => {
    state.wok.qty = Math.max(1, state.wok.qty + (+b.dataset.wokQty));
    renderWok(prefix);
  }));

  if (summaryList) summaryList.innerHTML =
    `<span>Основа: <b>${w.base ? w.base.name : '—'}</b></span>
     <span>Топпинги: <b>${toppingsNames(w)}</b></span>
     <span>Соус: <b>${w.sauce ? w.sauce.name : '—'}</b></span>`;
  if (summaryTotal) summaryTotal.textContent = fmt(wokUnitPrice() * w.qty) + ' ₽';

  const backBtn = $('#' + prefix + 'BackButton');
  const nextBtn = $('#' + prefix + 'NextButton');
  if (backBtn) backBtn.style.visibility = w.step === 0 ? 'hidden' : 'visible';
  if (nextBtn) nextBtn.textContent = w.step < 3 ? 'Далее' : 'Добавить в корзину';
}

function handleWokNext(prefix = 'wok') {
  const w = state.wok;
  if (w.step === 0 && !w.base) return;
  if (w.step === 1 && (!w.toppings || w.toppings.length === 0)) return;
  if (w.step === 2 && !w.sauce) return;
  if (w.step < 3) { w.step++; renderWok(prefix); return; }
  pushCartEntry({
    id: 'wok-' + Date.now(),
    name: 'WOK «' + toppingsNames(w) + '»',
    image: 'images/soberi-svoj-wok.webp',
    price: wokUnitPrice(),
    weight: '',   // ← убрали вес
    mods: ['Основа: ' + w.base.name, 'Топпинги: ' + toppingsNames(w), 'Соус: ' + w.sauce.name],
  }, w.qty);
  if (prefix === 'wok') closeModal('wokModal');
  showToast('WOK добавлен');
  openCart(); renderMenu();
}

/* Встроенный конструктор для категории WOK */
function renderInlineWok() {
  return `<div class="inline-wok">
    <div class="inline-wok__header">
      <h2 class="inline-wok__title">Собери свой WOK <span class="inline-wok__kanji">鍋</span></h2>
      <div class="inline-wok__step" id="inlineWokStepTitle"></div>
      <div class="step-progress" id="inlineWokProgress"></div>
    </div>
    <div class="inline-wok__body" id="inlineWokBody"></div>
    <div class="inline-wok__footer">
      <div class="wok-summary">
        <div class="wok-summary__list" id="inlineWokSummaryList"></div>
        <span class="wok-summary__total" id="inlineWokSummaryTotal">0 ₽</span>
      </div>
      <div class="inline-wok__actions">
        <button class="button button--ghost" id="inlineWokBackButton">Назад</button>
        <button class="button button--primary" id="inlineWokNextButton">Далее</button>
      </div>
    </div>
  </div>`;
}

function initInlineWok() {
  state.wok = { step: 0, base: null, toppings: [], sauce: null, qty: 1 };
  renderWok('inlineWok');
  const backBtn = $('#inlineWokBackButton');
  const nextBtn = $('#inlineWokNextButton');
  if (backBtn) backBtn.onclick = () => { if (state.wok.step > 0) { state.wok.step--; renderWok('inlineWok'); } };
  if (nextBtn) nextBtn.onclick = () => handleWokNext('inlineWok');
}

window.wokBannerTemplate = wokBannerTemplate;
window.openWok = openWok;
window.renderWok = renderWok;
window.handleWokNext = handleWokNext;
window.renderInlineWok = renderInlineWok;
window.initInlineWok = initInlineWok;