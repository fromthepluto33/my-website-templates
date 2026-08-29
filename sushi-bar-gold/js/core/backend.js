/* ============================================================
   js/backend.js — ЭМУЛЯЦИЯ БЭКЕНДА на localStorage
   Позволяет сайту работать БЕЗ сервера (для демо/продажи).
   В продакшне заменяется на реальные fetch к Node.js API.
   Интерфейс совпадает с серверным — менять app.js не нужно.
   ============================================================ */

const Backend = (() => {
  const delay = (ms = 350) => new Promise(res => setTimeout(res, ms));

  const db = {
    read(key, fallback) {
      try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
      catch { return fallback; }
    },
    write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };

  /* ---------- Рабочее время ---------- */
  const toMin = (h, m) => h * 60 + m;
  const SCHEDULE = {
    weekdays: { open: toMin(10, 0), close: toMin(21, 45) },
    weekend:  { open: toMin(10, 0), close: toMin(22, 30) },
  };
  function isOpenNow(date = new Date()) {
    const cfg = (Content.getSettings && Content.getSettings()) || {};
    const logic = (cfg.schedule && cfg.schedule.logic) || {
      weekdays: { open: 600, close: 1305 },
      weekend:  { open: 600, close: 1350 },
    };
    const day = date.getDay();
    const minutes = date.getHours() * 60 + date.getMinutes();
    const isFriSat = day === 5 || day === 6;
    const s = isFriSat ? logic.weekend : logic.weekdays;
    return minutes >= s.open && minutes <= s.close;
  }

  /* ---------- Пересчёт стоимости ---------- */
  function recalculate({ items, zoneId, promocodeCode }) {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

    const zone = (window.DELIVERY_ZONES || []).find(z => z.id === zoneId) || (window.DELIVERY_ZONES || [])[0];
    let deliveryFee = zone ? zone.fee : 0;
    if (zone && zone.isPickup) deliveryFee = 0;
    else if (zone && zone.freeFrom !== null && subtotal >= zone.freeFrom) deliveryFee = 0;

    let discount = 0, promocode = null;
    if (promocodeCode) {
      const promo = (Content.getPromos() || []).find(p => p.code === promocodeCode.toUpperCase() && p.active);
      if (promo) {
        const blocked = promo.pickupOnly && !(zone && zone.isPickup);
        if (!blocked) {
          if (promo.type === 'percent') discount = Math.round(subtotal * promo.value / 100);
          if (promo.type === 'fixed') discount = promo.value;
          promocode = promo;
        }
      }
    }

    const total = Math.max(0, subtotal - discount) + deliveryFee;
    return { subtotal, deliveryFee, discount, total, zone, promocode, isOpen: isOpenNow() };
  }

  /* ---------- Создание заказа ---------- */
  async function createOrder(payload) {
    await delay(600);

    const errors = [];
    if (!payload.name || payload.name.trim().length < 2) errors.push('Укажите имя');
    if ((payload.phone || '').replace(/\D/g, '').length !== 11) errors.push('Некорректный телефон');
    if (payload.zoneId !== 'pickup' && (!payload.address || !payload.address.trim())) errors.push('Укажите адрес доставки');
    if (!payload.items || !payload.items.length) errors.push('Корзина пуста');
    if (errors.length) return { success: false, error: errors[0] };

    const calc = recalculate({ items: payload.items, zoneId: payload.zoneId, promocodeCode: payload.promocode });
    if (!calc.isOpen) {
      return { success: false, error: 'Кафе сейчас закрыто. Мы работаем: пн-чт 10:00–21:45, пт-сб 10:00–22:30, вс 10:00–21:45' };
    }

    const orders = db.read('sushibar_orders', []);
    const order = {
      id: 'RS-' + String(orders.length + 1).padStart(4, '0'),
      number: Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      status: 'new',
      customer: { name: payload.name.trim(), phone: payload.phone.trim(), address: payload.address?.trim() || '' },
      zone: calc.zone,
      items: payload.items,
      calc,
      paymentMethod: payload.paymentMethod || 'cash_courier',
      paymentLabel: paymentLabel(payload.paymentMethod),
      comment: payload.comment || '',
    };
    orders.unshift(order);
    db.write('sushibar_orders', orders);
    notifyOperator(order);

    return { success: true, order };
  }

  function paymentLabel(method) {
    return {
      cash_courier: 'Наличными курьеру',
      card_courier: 'Картой курьеру (терминал)',
      cash_pickup: 'Наличными при самовывозе',
      card_pickup: 'Картой при самовывозе (терминал)',
    }[method] || method;
  }

  function notifyOperator(order) {
    const lines = [
      `[НОВЫЙ ЗАКАЗ №${order.number}]`,
      `${order.customer.name} · ${order.customer.phone}`,
      order.customer.address || 'Самовывоз',
      ...order.items.map(i => `- ${i.name} x${i.qty}`),
      `Оплата: ${order.paymentLabel}`,
      `Итого: ${order.calc.total} руб.`,
    ].join('\n');
    console.log('%cУВЕДОМЛЕНИЕ ОПЕРАТОРУ (ВК)%c\n' + lines,
      'background:#e63946;color:#fff;padding:2px 6px;border-radius:3px', 'color:inherit');
  }

  /* ---------- Прочие методы для админки ---------- */
  function getOrdersSync() { return db.read('sushibar_orders', []); }
  function getStats() {
    const orders = db.read('sushibar_orders', []);
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.calc.total, 0);
    return { totalOrders: orders.length, totalRevenue: revenue, newOrders: orders.filter(o => o.status === 'new').length };
  }
  function updateOrderStatus(id, status) {
    const orders = db.read('sushibar_orders', []);
    const o = orders.find(x => x.id === id);
    if (o) { o.status = status; db.write('sushibar_orders', orders); }
    return o;
  }
  const ORDER_STATUSES = {
    new:       { label: 'Новый',       color: '#e63946' },
    cooking:   { label: 'Готовится',   color: '#f59e0b' },
    delivering:{ label: 'Доставляется',color: '#3b82f6' },
    done:      { label: 'Выполнен',    color: '#22c55e' },
    cancelled: { label: 'Отменён',     color: '#71717a' },
  };
  const ADMIN_PIN = '2468';
  function adminLogin(pin) { return pin === ADMIN_PIN; }

  function validatePromocode(code, isPickup) {
    const promo = (Content.getPromos() || []).find(p => p.code === code.toUpperCase() && p.active);
    if (!promo) return { valid: false, message: 'Промокод не найден' };
    if (promo.pickupOnly && !isPickup) return { valid: false, message: 'Действует только на самовывоз' };
    return { valid: true, promo };
  }

  return {
    createOrder, recalculate, validatePromocode,
    getOrdersSync, getStats, updateOrderStatus, ORDER_STATUSES,
    adminLogin, ADMIN_PIN, isOpenNow, paymentLabel, delay,
  };
})();