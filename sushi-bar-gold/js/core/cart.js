/* ============================================================
   core/cart.js — корзина, избранное, управление модалками
   ============================================================ */

function cartStats() {
  const subtotal = state.cart.reduce((s, e) => s + e.price * e.qty, 0);
  const totalItems = state.cart.reduce((s, e) => s + e.qty, 0);

  const d = (typeof window.getDeliverySettings === 'function')
    ? window.getDeliverySettings()
    : { fee: 200, freeFrom: 1000 };

  const dm = document.querySelector('input[name="deliveryMethod"]:checked');
  const isPickup = dm && dm.value === 'pickup';

  let deliveryFee = 0;
  if (!isPickup && subtotal > 0) deliveryFee = subtotal >= d.freeFrom ? 0 : d.fee;

  return { subtotal, totalItems, deliveryFee, total: subtotal + deliveryFee };
}

function pushCartEntry(entry, qty = 1) {
  const key = entry.id + '|' + (entry.mods || []).join(',');
  const existing = state.cart.find(e => e.key === key);
  if (existing) existing.qty += qty;
  else state.cart.push({ key, ...entry, qty });
  saveLS('sushibar_cart', state.cart);
  updateCounters();
}

function addToCartFromCard(item) {
  if (item.sauceGroup) { openSauceModal(item); return; }
  const isPizza = item.category === 'pizza' && item.price33 != null;
  const size = state.sizes[item.id] || '23';
  const mods = isPizza && size === '33' ? ['Диаметр: 33 см'] : [];
  const price = isPizza && size === '33' ? item.price33 : item.price;
  pushCartEntry({ id: item.id, name: item.name, image: item.image, price, weight: item.weight, mods });
  showToast(item.name + ' — добавлено');
  renderMenu(); renderCart();
}

function decFromCard(item) {
  const isPizza = item.category === 'pizza' && item.price33 != null;
  const size = state.sizes[item.id] || '23';
  const targetMods = isPizza && size === '33' ? ['Диаметр: 33 см'] : [];
  const key = item.id + '|' + targetMods.join(',');
  const entry = state.cart.find(e => e.key === key) || state.cart.find(e => e.id === item.id);
  if (!entry) return;
  entry.qty--;
  if (entry.qty <= 0) state.cart = state.cart.filter(e => e.key !== entry.key);
  saveLS('sushibar_cart', state.cart);
  updateCounters(); renderMenu(); renderCart();
}

function toggleFavorite(id) {
  if (state.favorites.includes(id)) state.favorites = state.favorites.filter(i => i !== id);
  else state.favorites.push(id);
  saveLS('sushibar_favorites', state.favorites);
  updateCounters(); renderCategoryTabs(); renderMenu();
}

function renderCart() {
  const itemsEl = $('#cartItems'); if (!itemsEl) return;
  const stats = cartStats();
  const isEmpty = state.cart.length === 0;
  $('#cartEmpty').hidden = !isEmpty;
  itemsEl.hidden = isEmpty;
  $('#cartTotals').hidden = isEmpty;

  itemsEl.innerHTML = state.cart.map(e => `
    <div class="cart-item">
      <div class="cart-item__image"><img src="${e.image}" alt="${e.name}" loading="lazy" /></div>
      <div class="cart-item__info">
        <div class="cart-item__top">
          <span class="cart-item__name">${e.name}</span>
          <button class="cart-item__remove" data-remove-key="${e.key}">${iconSvg('trash')}</button>
        </div>
        ${(e.mods || []).map(m => `<div class="cart-item__mod">· ${m}</div>`).join('')}
        <div class="cart-item__bottom">
          <div class="quantity-stepper quantity-stepper--compact">
            <button class="quantity-stepper__button" data-dec-key="${e.key}">${iconSvg('minus')}</button>
            <span class="quantity-stepper__value">${e.qty}</span>
            <button class="quantity-stepper__button quantity-stepper__button--plus" data-inc-key="${e.key}">${iconSvg('plus')}</button>
          </div>
          <span class="cart-item__price">${fmt(e.price * e.qty)} ₽</span>
        </div>
      </div>
    </div>`).join('');

  itemsEl.querySelectorAll('[data-remove-key]').forEach(b => b.addEventListener('click', () => {
    state.cart = state.cart.filter(e => e.key !== b.dataset.removeKey);
    saveLS('sushibar_cart', state.cart); updateCounters(); renderCart(); renderMenu();
  }));
  itemsEl.querySelectorAll('[data-dec-key]').forEach(b => b.addEventListener('click', () => {
    const e = state.cart.find(x => x.key === b.dataset.decKey);
    if (e) { e.qty--; if (e.qty <= 0) state.cart = state.cart.filter(x => x.key !== e.key); }
    saveLS('sushibar_cart', state.cart); updateCounters(); renderCart(); renderMenu();
  }));
  itemsEl.querySelectorAll('[data-inc-key]').forEach(b => b.addEventListener('click', () => {
    const e = state.cart.find(x => x.key === b.dataset.incKey);
    if (e) e.qty++;
    saveLS('sushibar_cart', state.cart); updateCounters(); renderCart(); renderMenu();
  }));

  $('#cartCountLabel').textContent = stats.totalItems ? stats.totalItems + ' поз.' : '';
  $('#totalsProducts').textContent = fmt(stats.subtotal) + ' ₽';
  $('#totalsDelivery').textContent = stats.deliveryFee === 0 ? 'Бесплатно' : fmt(stats.deliveryFee) + ' ₽';
  $('#totalsDelivery').classList.toggle('totals-row__value--free', stats.deliveryFee === 0);
  $('#deliveryNote').hidden = stats.deliveryFee === 0;
  const freeFrom = (window.SITE_CONFIG && window.SITE_CONFIG.delivery && window.SITE_CONFIG.delivery.freeFrom) || 1000;
  $('#deliveryNoteSum').textContent = fmt(freeFrom - stats.subtotal) + ' ₽';
  $('#totalsFinal').textContent = fmt(stats.total) + ' ₽';

  const mobileBar = $('#mobileCartBar');
  if (mobileBar) {
    mobileBar.hidden = stats.totalItems === 0 || $('#cartSidebar').classList.contains('is-open');
    $('#mobileCartCount').textContent = stats.totalItems + ' поз.';
    $('#mobileCartTotal').textContent = fmt(stats.subtotal) + ' ₽';
  }
}

function openCart() { $('#cartSidebar').classList.add('is-open'); $('#cartOverlay').classList.add('is-open'); renderCart(); syncBodyLock(); }
function closeCart() { $('#cartSidebar').classList.remove('is-open'); $('#cartOverlay').classList.remove('is-open'); renderCart(); syncBodyLock(); }

function syncBodyLock() {
  const anyOpen = document.querySelector('.modal.is-open') || $('#cartSidebar')?.classList.contains('is-open');
  document.body.classList.toggle('is-locked', !!anyOpen);
}

function openModal(id) { const m = $('#' + id); if (m) { m.classList.add('is-open'); syncBodyLock(); } }
function closeModal(id) { const m = $('#' + id); if (m) { m.classList.remove('is-open'); syncBodyLock(); } }

window.cartStats = cartStats;
window.pushCartEntry = pushCartEntry;
window.addToCartFromCard = addToCartFromCard;
window.decFromCard = decFromCard;
window.toggleFavorite = toggleFavorite;
window.renderCart = renderCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.syncBodyLock = syncBodyLock;
window.openModal = openModal;
window.closeModal = closeModal;