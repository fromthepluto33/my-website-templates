/* ============================================================
   core/catalog.js — каталог: категории, карточки, рендер меню
   В категории WOK встроенный конструктор.
   Заголовок «Избранное» для режима fav (через сердечко).
   ============================================================ */

function renderCategoryTabs() {
  const tabs = $('#categoryTabs'); if (!tabs) return;
  tabs.innerHTML = window.CATEGORIES.map(c => {
    const count = Content.getMenuItems().filter(i => i.category === c.id).length;
    const active = state.category === c.id ? 'is-active' : '';
    return `<button class="category-tabs__button ${active}" data-category="${c.id}">
      <span class="category-tabs__kanji">${c.kanji}</span>
      <span class="category-tabs__name">${c.name}</span>
      <span class="category-tabs__count">${count}</span>
    </button>`;
  }).join('');
}

function renderMenu() {
  const grid = $('#productGrid'); if (!grid) return;
  const title = $('#categoryTitle'), kanji = $('#categoryKanji'), count = $('#categoryCount');
  const cat = window.CATEGORIES.find(c => c.id === state.category) || window.CATEGORIES[0];

  const allItems = Content.getMenuItems();
  let items = state.category === 'fav'
    ? allItems.filter(i => state.favorites.includes(i.id))
    : allItems.filter(i => i.category === state.category);

  // Поиск — только V2+
  if (hasFeature(2) && menuSearchQuery) {
    const q = menuSearchQuery.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
  }

  // Заголовок: обычный или «Избранное»
  if (state.category === 'fav') {
    if (title) title.textContent = 'Избранное';
    if (kanji) kanji.textContent = '好';
    if (count) count.textContent = state.favorites.length + ' поз.';
  } else {
    if (title) title.textContent = cat.name;
    if (kanji) kanji.textContent = cat.kanji;
    if (count) count.textContent = items.length + ' поз.';
  }

  // WOK: в категории WOK встроенный конструктор, иначе пусто
  const wokSlot = $('#wokBannerSlot');
  if (wokSlot) {
    if (state.category === 'wok') {
      wokSlot.innerHTML = renderInlineWok();
      initInlineWok();
    } else {
      wokSlot.innerHTML = '';
    }
  }

  const emptyFav = $('#emptyFavorites');
  if (emptyFav) emptyFav.hidden = !(state.category === 'fav' && items.length === 0);

  if (hasFeature(2) && menuSearchQuery && items.length === 0) {
    grid.innerHTML = '<div class="search-empty">😔 По запросу «' + menuSearchQuery + '» ничего не найдено.<br/>Попробуйте другое название.</div>';
    return;
  }

  grid.innerHTML = items.map(productCardTemplate).join('');

  grid.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const item = Content.getMenuItems().find(i => i.id === +card.dataset.id || String(i.id) === card.dataset.id);
      if (!item) return;
      const action = btn.dataset.action;
      if (action === 'size') { state.sizes[item.id] = btn.dataset.size; renderMenu(); }
      if (action === 'add') addToCartFromCard(item);
      if (action === 'dec') decFromCard(item);
      if (action === 'fav') toggleFavorite(item.id);
      if (action === 'reviews' && hasFeature(3)) openReviews(item.id);
    });
  });
}

function productCardTemplate(item) {
  const inCartQty = state.cart.filter(e => e.id === item.id).reduce((s, e) => s + e.qty, 0);
  const isFav = state.favorites.includes(item.id);
  const isPizza = item.category === 'pizza' && item.price33 != null;
  const size = state.sizes[item.id] || '23';
  const price = isPizza && size === '33' ? item.price33 : item.price;

  const sizeToggle = isPizza ? `
    <div class="product-card__size-toggle">
      <button class="product-card__size-button ${size === '23' ? 'is-active' : ''}" data-action="size" data-size="23">23 см</button>
      <button class="product-card__size-button ${size === '33' ? 'is-active' : ''}" data-action="size" data-size="33">33 см</button>
    </div>` : '';

  // Бейджи — только V2+
  let badges = '';
  if (hasFeature(2)) {
    if (item.popular) badges += '<span class="product-card__badge">Хит</span>';
    if (item.promo) badges += '<span class="product-card__badge product-card__badge--promo">Акция</span>';
  }
  const badgesHtml = badges ? `<div class="product-card__badges">${badges}</div>` : '';

  // Рейтинг — только V3
  let ratingHtml = '';
  if (hasFeature(3)) {
    const rating = Content.getProductRating(item.id);
    const reviewsCount = Content.getProductReviews(item.id).filter(r => r.approved).length;
    const starsHtml = rating
      ? `<span class="product-card__stars">${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}</span>
         <span class="product-card__rating-value">${rating}</span>`
      : `<span class="product-card__stars product-card__stars--empty">☆☆☆☆☆</span>`;
    ratingHtml = `
      <div class="product-card__rating" data-action="reviews" title="Читать и оставить отзывы">
        ${starsHtml}
        <span class="product-card__reviews-count">(${reviewsCount})</span>
      </div>`;
  }

  const controls = inCartQty > 0 ? `
    <div class="quantity-stepper">
      <button class="quantity-stepper__button" data-action="dec" aria-label="Уменьшить">${iconSvg('minus')}</button>
      <span class="quantity-stepper__value">${inCartQty}</span>
      <button class="quantity-stepper__button quantity-stepper__button--plus" data-action="add" aria-label="Увеличить">${iconSvg('plus')}</button>
    </div>` : `
    <button class="product-card__add-button" data-action="add">${iconSvg('plus')} В корзину</button>`;

  return `<article class="product-card" data-id="${item.id}">
    <div class="product-card__media">
      <img class="product-card__image" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.classList.add('is-broken')" />
      ${badgesHtml}
      <button class="product-card__favorite ${isFav ? 'is-active' : ''}" data-action="fav" aria-label="В избранное">${iconSvg('heart', isFav)}</button>
      ${sizeToggle}
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name">${item.name}</h3>
      <p class="product-card__description">${item.description}</p>
      <span class="product-card__weight">${item.weight}</span>
      ${ratingHtml}
      <div class="product-card__footer">
        <span class="product-card__price">${fmt(price)} <span class="product-card__price-currency">₽</span></span>
        ${controls}
      </div>
    </div>
  </article>`;
}

window.renderCategoryTabs = renderCategoryTabs;
window.renderMenu = renderMenu;