/* ============================================================
   js/app.js — Суши Бар (инициализация)
   + стрелки прокрутки вкладок
   + сердечко: режим избранного на главной, переход на главной с других страниц
   ============================================================ */

function initApp() {
  /* ---------- Переход из других страниц с ?view=favorites ---------- */
  const urlParams = new URLSearchParams(window.location.search);
  const openFavoritesOnInit = urlParams.get('view') === 'favorites';
  if (openFavoritesOnInit) {
    state.category = 'fav';
    // Убираем параметр из URL, чтобы не мешал при обновлении
    window.history.replaceState({}, '', window.location.pathname);
  }

  renderCategoryTabs();
  renderMenu();
  renderCart();
  updateCounters();
  initCarousel();

  const mc = $('#menuCount');
  if (mc) mc.textContent = Content.getMenuItems().length;

  /* ---------- Стрелки прокрутки вкладок + автопрокрутка ---------- */
  const tabs = $('#categoryTabs');
  const tabsWrapper = $('#categoryTabsWrapper');
  const prevBtn = $('#tabsPrev');
  const nextBtn = $('#tabsNext');

  function updateTabsScroll() {
    if (!tabs || !tabsWrapper) return;
    const sl = tabs.scrollLeft;
    const maxSl = tabs.scrollWidth - tabs.clientWidth;
    tabsWrapper.classList.toggle('show-left', sl > 5);
    tabsWrapper.classList.toggle('show-right', sl < maxSl - 5);
    if (prevBtn) prevBtn.disabled = sl <= 0;
    if (nextBtn) nextBtn.disabled = sl >= maxSl - 1;
  }

  function scrollActiveTabIntoView() {
    if (!tabs) return;
    const active = tabs.querySelector('.is-active');
    if (!active) return;
    const rect = active.getBoundingClientRect();
    const tabsRect = tabs.getBoundingClientRect();
    if (rect.left < tabsRect.left) {
      tabs.scrollBy({ left: rect.left - tabsRect.left - 20, behavior: 'smooth' });
    } else if (rect.right > tabsRect.right) {
      tabs.scrollBy({ left: rect.right - tabsRect.right + 20, behavior: 'smooth' });
    }
  }

  if (tabs && prevBtn && nextBtn) {
    tabs.addEventListener('scroll', updateTabsScroll);
    prevBtn.addEventListener('click', () => tabs.scrollBy({ left: -200, behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => tabs.scrollBy({ left: 200, behavior: 'smooth' }));
    window.addEventListener('resize', updateTabsScroll);
    setTimeout(updateTabsScroll, 50);
  }

  /* ---------- Переключение категорий ---------- */
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-category]'); if (!btn) return;
      state.category = btn.dataset.category;
      renderCategoryTabs(); renderMenu();
      scrollActiveTabIntoView();
      updateTabsScroll();
      updateFavoritesButton();
    });
  }

  /* ---------- Сердечко в шапке ---------- */
  function updateFavoritesButton() {
    const favBtn = $('#favoritesHeaderButton');
    if (!favBtn) return;
    const isFavMode = state.category === 'fav';
    favBtn.classList.toggle('is-active', isFavMode);
    const icon = favBtn.querySelector('.icon');
    if (icon) icon.outerHTML = iconSvg('heart', isFavMode, 'icon icon--small icon--accent');
    const cnt = $('#favoritesCount');
    if (cnt) cnt.textContent = state.favorites.length;
  }

  const favoritesBtn = $('#favoritesHeaderButton');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
      const menuEl = $('#menu');
      if (menuEl) {
        // На главной — переключаем режим избранного
        state.category = state.category === 'fav' ? 'sets' : 'fav';
        renderCategoryTabs(); renderMenu();
        scrollActiveTabIntoView();
        updateTabsScroll();
        updateFavoritesButton();
        menuEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        // На других страницах — переходим на главную с избранным
        window.location.href = 'index.html?view=favorites';
      }
    });
  }
  updateFavoritesButton();

  /* ---------- Если пришли с ?view=favorites — прокручиваем к каталогу ---------- */
  if (openFavoritesOnInit) {
    scrollActiveTabIntoView();
    updateTabsScroll();
    setTimeout(() => {
      const menuEl = $('#menu');
      if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }

  /* ---------- Кнопки hero ---------- */
  const toMenu = $('#toMenuButton');
  if (toMenu) toMenu.addEventListener('click', () => $('#menu').scrollIntoView({ behavior: 'smooth' }));
  const toWok = $('#toWokButton');
  if (toWok) toWok.addEventListener('click', () => {
    state.category = 'wok';
    renderCategoryTabs(); renderMenu();
    $('#menu').scrollIntoView({ behavior: 'smooth' });
    openWok();
  });

  /* ---------- Поиск (V2+) ---------- */
  if (typeof initSearch === 'function' && hasFeature(2)) {
    initSearch();
  } else {
    const searchInput = $('#menuSearchInput');
    if (searchInput) {
      const wrap = searchInput.closest('.menu-search');
      if (wrap) wrap.hidden = true;
    }
  }

  /* ---------- Корзина ---------- */
  const cartBtn = $('#cartButton');
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  const mobileCartBtn = $('#mobileCartButton');
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', openCart);
  const cartClose = $('#cartCloseButton');
  if (cartClose) cartClose.addEventListener('click', closeCart);
  const cartEmptyClose = $('#cartEmptyCloseButton');
  if (cartEmptyClose) cartEmptyClose.addEventListener('click', closeCart);
  const overlay = $('#cartOverlay');
  if (overlay) overlay.addEventListener('click', closeCart);
  const checkoutBtn = $('#checkoutButton');
  if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
  const checkoutForm = $('#checkoutForm');
  if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  /* ---------- Мои заказы (V2+) ---------- */
  const myOrdersBtn = $('#myOrdersBtn');
  if (myOrdersBtn && typeof openMyOrders === 'function' && hasFeature(2)) {
    myOrdersBtn.addEventListener('click', openMyOrders);
  }

  /* ---------- Соусы и WOK ---------- */
  const sauceConfirm = $('#sauceConfirmButton');
  if (sauceConfirm) sauceConfirm.addEventListener('click', confirmSauce);
  const wokNext = $('#wokNextButton');
  if (wokNext) wokNext.addEventListener('click', () => handleWokNext('wok'));
  const wokBack = $('#wokBackButton');
  if (wokBack) wokBack.addEventListener('click', () => { if (state.wok.step > 0) { state.wok.step--; renderWok('wok'); } });

  /* ---------- Модалки и Escape ---------- */
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-close-modal]');
    if (c) closeModal(c.dataset.closeModal);
    if (e.target.classList && e.target.classList.contains('modal')) {
      e.target.classList.remove('is-open'); syncBodyLock();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal.is-open').forEach(m => m.classList.remove('is-open'));
    closeCart(); syncBodyLock();
  });
}

document.addEventListener('DOMContentLoaded', initApp);