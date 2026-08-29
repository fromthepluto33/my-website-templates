/* ============================================================
   js/backend-api.js
   Реальный клиент для сервера. Заменяет эмуляцию backend.js.
   Интерфейс тот же — остальной код фронтенда менять не нужно.
   ============================================================ */

const API_URL = window.location.origin + '/api'; // сервер раздаёт и сайт, и API

const Backend = (() => {
  async function request(path, options = {}) {
    const res = await fetch(API_URL + path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
    return data;
  }

  return {
    // Меню и зоны
    getMenu: () => request('/menu'),
    getZones: () => request('/delivery-zones'),

    // Промокоды
    validatePromocode: (code, isPickup) =>
      request('/promocodes/validate', { method: 'POST', body: JSON.stringify({ code, isPickup }) }),

    // Создание заказа (сервер сам пересчитает цену)
    createOrder: (payload) =>
      request('/orders', { method: 'POST', body: JSON.stringify(payload) }),

    // Статус заказа
    getOrderStatus: (number) => request(`/orders/status/${number}`),

    // Админка
    adminLogin: (email, password) =>
      request('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    getAdminStats: (token) => request('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
    getAdminOrders: (token) => request('/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
  };
})();