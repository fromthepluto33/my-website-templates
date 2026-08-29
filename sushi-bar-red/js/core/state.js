/* ============================================================
   core/state.js — глобальное состояние (все версии)
   ============================================================ */

const state = {
  category: 'sets',
  cart: loadLS('sushibar_cart', []),
  favorites: loadLS('sushibar_favorites', []),
  sizes: {},
  wok: { step: 0, base: null, topping: null, sauce: null, qty: 1 },
  sauceItem: null,
  sauceSelected: null,
  paymentMethod: 'cash_courier',
};

let menuSearchQuery = '';

function updateCounters() {
  const fc = $('#favoritesCount');
  if (fc) fc.textContent = state.favorites.length;
  const totalItems = state.cart.reduce((s, e) => s + e.qty, 0);
  const badge = $('#cartBadge');
  if (badge) { badge.textContent = totalItems; badge.classList.toggle('is-hidden', totalItems === 0); }
}

window.state = state;
window.menuSearchQuery = menuSearchQuery;
window.updateCounters = updateCounters;