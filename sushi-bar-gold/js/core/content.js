/* ============================================================
   js/content.js — CMS-СЛОЙ (v7 — с отзывами)
   ============================================================ */

const Content = (() => {
  const KEY = 'sushibar_cms_v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const write = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  let state = read();

  function ensureProducts() {
    state.products = state.products || {};
    state.products.added = state.products.added || [];
    state.products.hidden = state.products.hidden || [];
    state.products.edits = state.products.edits || {};
    state.products.deleted = state.products.deleted || [];
    state.products.order = state.products.order || [];
    return state.products;
  }

  function getSettings() { return state.settings || (window.SITE_CONFIG || {}); }
  function saveSettings(s) { state.settings = s; write(state); }

  function applyOrder(items) {
    const order = (state.products && state.products.order) || [];
    if (!order.length) return items;
    return items.slice().sort((a, b) => {
      const ia = order.indexOf(String(a.id));
      const ib = order.indexOf(String(b.id));
      const va = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
      const vb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
      return va - vb;
    });
  }

  function getMenuItems() {
    const base = window.menuItems;
    if (!base || !Array.isArray(base)) return [];
    const p = ensureProducts();
    const hidden = p.hidden.map(String);
    const deleted = p.deleted.map(String);
    const filtered = base
      .filter(x => !hidden.includes(String(x.id)) && !deleted.includes(String(x.id)))
      .map(x => Object.assign({}, x, p.edits[String(x.id)] || {}));
    const added = p.added.filter(x => !deleted.includes(String(x.id)));
    return applyOrder(filtered.concat(added));
  }

  function getAllProducts() {
    const base = window.menuItems;
    if (!base || !Array.isArray(base)) return [];
    const p = ensureProducts();
    const deleted = p.deleted.map(String);
    const all = base
      .filter(x => !deleted.includes(String(x.id)))
      .map(x => Object.assign({}, x, p.edits[String(x.id)] || {}));
    const added = p.added.filter(x => !deleted.includes(String(x.id)));
    return applyOrder(all.concat(added));
  }

  function getDeletedProducts() {
    const base = window.menuItems || [];
    const p = ensureProducts();
    const deleted = p.deleted.map(String);
    const std = base.filter(x => deleted.includes(String(x.id)))
      .map(x => Object.assign({}, x, p.edits[String(x.id)] || {}));
    const custom = p.added.filter(x => deleted.includes(String(x.id)));
    return std.concat(custom);
  }

  function addProduct(prod) {
    const p = ensureProducts();
    prod.id = 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    prod.custom = true;
    p.added.push(prod);
    write(state);
  }

  function updateProduct(id, patch) {
    const sid = String(id);
    const p = ensureProducts();
    const added = p.added.find(x => String(x.id) === sid);
    if (added) Object.assign(added, patch);
    else p.edits[sid] = Object.assign(p.edits[sid] || {}, patch);
    write(state);
  }

  function toggleProduct(id) {
    const sid = String(id);
    const p = ensureProducts();
    const h = p.hidden.map(String);
    const i = h.indexOf(sid);
    if (i >= 0) h.splice(i, 1); else h.push(sid);
    p.hidden = h;
    write(state);
  }

  function deleteProduct(id) {
    const sid = String(id);
    const p = ensureProducts();
    if (!p.deleted.includes(sid)) p.deleted.push(sid);
    write(state);
  }

  function purgeProduct(id) {
    const sid = String(id);
    const p = ensureProducts();
    p.deleted = p.deleted.filter(x => x !== sid);
    p.added = p.added.filter(x => String(x.id) !== sid);
    if (p.edits) delete p.edits[sid];
    p.order = p.order.filter(x => x !== sid);
    p.hidden = p.hidden.filter(x => String(x) !== sid);
    write(state);
  }

  function restoreProduct(id) {
    const sid = String(id);
    const p = ensureProducts();
    p.deleted = p.deleted.filter(x => x !== sid);
    write(state);
  }

  function isHidden(id) { return ensureProducts().hidden.map(String).includes(String(id)); }
  function isDeleted(id) { return ensureProducts().deleted.map(String).includes(String(id)); }

  function moveProduct(id, direction) {
    const sid = String(id);
    const p = ensureProducts();
    const all = getAllProducts();
    const target = all.find(x => String(x.id) === sid);
    if (!target) return;
    let order = p.order.slice();
    if (!order.length) order = all.map(x => String(x.id));
    all.forEach(it => { const iid = String(it.id); if (!order.includes(iid)) order.push(iid); });
    const sameCat = all.filter(x => x.category === target.category);
    const catOrder = order.filter(oid => sameCat.some(x => String(x.id) === oid));
    const idx = catOrder.indexOf(sid);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= catOrder.length) return;
    const globalIdxA = order.indexOf(catOrder[idx]);
    const globalIdxB = order.indexOf(catOrder[newIdx]);
    [order[globalIdxA], order[globalIdxB]] = [order[globalIdxB], order[globalIdxA]];
    p.order = order;
    write(state);
  }

  function reorderInCategory(dragId, dropId) {
    const p = ensureProducts();
    const all = getAllProducts();
    const drag = all.find(x => String(x.id) === String(dragId));
    const drop = all.find(x => String(x.id) === String(dropId));
    if (!drag || !drop || drag.category !== drop.category) return false;
    let order = p.order.slice();
    if (!order.length) order = all.map(x => String(x.id));
    all.forEach(it => { const iid = String(it.id); if (!order.includes(iid)) order.push(iid); });
    const from = order.indexOf(String(dragId));
    const to = order.indexOf(String(dropId));
    if (from === -1 || to === -1) return false;
    order.splice(from, 1);
    order.splice(to, 0, String(dragId));
    p.order = order;
    write(state);
    return true;
  }

  function toggleBadge(id, badge) {
    const item = getAllProducts().find(p => String(p.id) === String(id));
    if (!item) return;
    updateProduct(id, { [badge]: !item[badge] });
  }

  /* ---------- ОТЗЫВЫ И РЕЙТИНГИ ---------- */
  function ensureReviews() { state.reviews = state.reviews || []; return state.reviews; }
  function getReviews() { return state.reviews || []; }
  function getProductReviews(productId) {
    return getReviews().filter(r => String(r.productId) === String(productId));
  }
  function getProductRating(productId) {
    const reviews = getProductReviews(productId).filter(r => r.approved);
    if (!reviews.length) return null;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }
  function addReview(review) {
    const reviews = ensureReviews();
    review.id = 'review-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    review.createdAt = new Date().toISOString();
    review.approved = false;
    reviews.unshift(review);
    write(state);
    return review;
  }
  function approveReview(id) { const r = ensureReviews().find(x => x.id === id); if (r) { r.approved = true; write(state); } }
  function unapproveReview(id) { const r = ensureReviews().find(x => x.id === id); if (r) { r.approved = false; write(state); } }
  function deleteReview(id) { state.reviews = (state.reviews || []).filter(x => x.id !== id); write(state); }

  /* ---------- АКЦИИ ---------- */
  function getPromos() { return state.promos != null ? state.promos : (window.PROMOCODES || []); }
  function savePromos(list) { state.promos = list; write(state); }
  function addPromo(p) { const l = getPromos().slice(); l.push(p); savePromos(l); }
  function updatePromo(code, patch) { savePromos(getPromos().map(p => p.code === code ? Object.assign({}, p, patch) : p)); }
  function deletePromo(code) { savePromos(getPromos().filter(p => p.code !== code)); }

  function reset() { localStorage.removeItem(KEY); state = {}; }

  /* ---------- ПРОГРАММА ЛОЯЛЬНОСТИ ---------- */
  function getLoyaltySettings() {
    return state.loyaltySettings || { enabled: true, earnPercent: 5, maxSpendPercent: 30 };
  }
  function saveLoyaltySettings(s) { state.loyaltySettings = s; write(state); }

  function phoneKey(phone) { return (phone || '').replace(/\D/g, ''); }

  function getClientBalance(phone) {
    const clients = state.loyaltyClients || {};
    const c = clients[phoneKey(phone)];
    return c ? c.balance : 0;
  }

  function earnBonuses(phone, orderSubtotal) {
    const settings = getLoyaltySettings();
    if (!settings.enabled) return 0;
    const earned = Math.floor(orderSubtotal * settings.earnPercent / 100);
    if (earned <= 0) return 0;
    const clients = state.loyaltyClients || {};
    const key = phoneKey(phone);
    if (!clients[key]) clients[key] = { balance: 0, totalEarned: 0, totalSpent: 0, ordersCount: 0 };
    clients[key].balance += earned;
    clients[key].totalEarned += earned;
    clients[key].ordersCount += 1;
    state.loyaltyClients = clients;
    write(state);
    return earned;
  }

  function spendBonuses(phone, amount) {
    const clients = state.loyaltyClients || {};
    const key = phoneKey(phone);
    if (!clients[key] || clients[key].balance <= 0) return 0;
    const spent = Math.min(amount, clients[key].balance);
    clients[key].balance -= spent;
    clients[key].totalSpent += spent;
    state.loyaltyClients = clients;
    write(state);
    return spent;
  }

  function adjustClientBalance(phone, delta) {
    const clients = state.loyaltyClients || {};
    const key = phoneKey(phone);
    if (!clients[key]) clients[key] = { balance: 0, totalEarned: 0, totalSpent: 0, ordersCount: 0 };
    clients[key].balance = Math.max(0, clients[key].balance + delta);
    state.loyaltyClients = clients;
    write(state);
  }

  function getLoyaltyClients() { return state.loyaltyClients || {}; }

  return {
    getSettings, saveSettings,
    getMenuItems, getAllProducts, getDeletedProducts,
    addProduct, updateProduct, toggleProduct, deleteProduct, restoreProduct, purgeProduct,
    isHidden, isDeleted, moveProduct, reorderInCategory, toggleBadge,
    getReviews, getProductReviews, getProductRating,
    addReview, approveReview, unapproveReview, deleteReview,
    getPromos, addPromo, updatePromo, deletePromo, savePromos,
    reset, getLoyaltySettings, saveLoyaltySettings,
    getClientBalance, earnBonuses, spendBonuses, adjustClientBalance, getLoyaltyClients,
  };
})();

window.Content = Content;