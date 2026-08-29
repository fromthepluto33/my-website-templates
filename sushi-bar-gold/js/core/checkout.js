/* ============================================================
   core/checkout.js — оформление заказа (все версии)
   С защитой вызовов функций лояльности (V3)
   + строгая маска телефона +7 (___) ___-__-__
   + выбор доставки и оплаты
   ============================================================ */

function openCheckout() {
  const stats = cartStats();
  closeCart();
  $('#checkoutTotal').textContent = fmt(stats.total) + ' ₽';
  $('#checkoutHeader').hidden = false;
  $('#checkoutForm').hidden = false;
  $('#checkoutSuccess').hidden = true;
  openModal('checkoutModal');
  
  // Устанавливаем адрес для самовывоза из конфига
  const pickupAddress = (window.SITE_CONFIG && window.SITE_CONFIG.contacts && window.SITE_CONFIG.contacts.address) || 'Адрес уточняйте по телефону';
  const pickupText = document.getElementById('pickupAddressText');
  if (pickupText) pickupText.textContent = pickupAddress;
  
  // Маска телефона
  if (typeof applyPhoneMask === 'function') applyPhoneMask();
  // Обновляем бонус-блок (V3)
  if (typeof window.updateBonusBlock === 'function') window.updateBonusBlock();
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const name = $('#fieldName').value.trim();
  const phone = $('#fieldPhone').value.trim();
  const address = $('#fieldAddress').value.trim();
  const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (name.length < 2) { showToast('Укажите имя'); return; }
  if (phone.replace(/\D/g, '').length !== 11) {
    showToast('Введите телефон полностью: +7 (___) ___-__-__');
    $('#fieldPhone').focus();
    return;
  }
  if (deliveryMethod === 'courier' && !address) { showToast('Укажите адрес доставки'); return; }

  const stats = cartStats();
  const bonusSpent = (hasFeature(3) && typeof calcBonusSpend === 'function') ? calcBonusSpend() : 0;

  if (bonusSpent > 0) Content.spendBonuses(phone, bonusSpent);
  const finalTotal = Math.max(0, stats.total - bonusSpent);

  const deliveryLabel = deliveryMethod === 'courier' ? 'Курьер' : 'Самовывоз';
  const paymentLabels = {
    cash: 'Наличными при получении',
    card: 'Картой через терминал'
  };
  const paymentLabel = paymentLabels[paymentMethod] || 'Наличными';

  const order = {
    id: 'order-' + Date.now(),
    number: Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
    status: 'new',
    customer: { 
      name, 
      phone, 
      address: deliveryMethod === 'courier' ? address : 'Самовывоз'
    },
    deliveryMethod,
    items: state.cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, mods: i.mods })),
    calc: { total: finalTotal, subtotal: stats.subtotal, deliveryFee: stats.deliveryFee, bonusSpent },
    paymentMethod,
    paymentLabel: deliveryLabel + ' · ' + paymentLabel,
  };
  const orders = loadLS('sushibar_orders', []);
  orders.unshift(order);
  saveLS('sushibar_orders', orders);

  const earned = (hasFeature(3) && typeof Content.earnBonuses === 'function')
    ? Content.earnBonuses(phone, stats.subtotal)
    : 0;

  state.cart = [];
  saveLS('sushibar_cart', state.cart);
  updateCounters(); renderMenu(); renderCart();

  $('#checkoutForm').hidden = true;
  $('#checkoutHeader').hidden = true;
  $('#checkoutSuccess').hidden = false;
  $('#orderNumber').textContent = '№ ' + order.number;

  const bonusMsg = $('#bonusEarnedMsg');
  if (bonusMsg) {
    if (earned > 0) {
      bonusMsg.textContent = '🎁 Начислено ' + earned + ' бонусов на номер ' + maskPhone(phone);
      bonusMsg.hidden = false;
    } else bonusMsg.hidden = true;
  }

  const bonusBlock = $('#bonusBlock');
  if (bonusBlock) bonusBlock.hidden = true;
  if ($('#useBonusesCheckbox')) $('#useBonusesCheckbox').checked = false;
}

/* ---------- Маска телефона +7 (___) ___-__-__ ---------- */
let _phonePrev = '';

function applyPhoneMask() {
  const input = document.getElementById('fieldPhone');
  if (!input) return;

  const raw = input.value;
  let digits = raw.replace(/\D/g, '');
  const prevLen = _phonePrev.replace(/\D/g, '').length;

  if (raw.length < _phonePrev.length && digits.length === prevLen && digits.length > 0) {
    digits = digits.slice(0, -1);
  }

  if (!digits) { input.value = ''; _phonePrev = ''; return; }

  if (digits[0] === '8') digits = '7' + digits.slice(1);
  else if (digits[0] !== '7') digits = '7' + digits;
  digits = digits.slice(0, 11);

  let out = '+7';
  if (digits.length > 1) out += ' (' + digits.slice(1, 4);
  if (digits.length >= 4) out += ')';
  if (digits.length > 4) out += ' ' + digits.slice(4, 7);
  if (digits.length > 7) out += '-' + digits.slice(7, 9);
  if (digits.length > 9) out += '-' + digits.slice(9, 11);

  input.value = out;
  _phonePrev = out;
}

document.addEventListener('input', function (e) {
  if (e.target && e.target.id === 'fieldPhone') applyPhoneMask();
});

window.addEventListener('load', function () {
  window.onPhoneInput = applyPhoneMask;
});

/* ---------- Переключение доставки и оплаты ---------- */
function toggleDeliveryMethod() {
  const val = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const isCourier = val === 'courier';
  
  // Подсветка выбранной опции
  const c = $('#deliveryOptionCourier'), p = $('#deliveryOptionPickup');
  if (c) c.classList.toggle('is-active', isCourier);
  if (p) p.classList.toggle('is-active', !isCourier);
  
  // Скрытие/показ блоков
  const addrBlock = $('#deliveryAddressBlock'), pickupBlock = $('#pickupAddressBlock');
  if (addrBlock) addrBlock.hidden = !isCourier;
  if (pickupBlock) pickupBlock.hidden = isCourier;
  const addr = $('#fieldAddress');
  if (addr) addr.required = isCourier;
  
  // Обновляем корзину и итоговую сумму
  if (typeof renderCart === 'function') renderCart();
  if (typeof updateCheckoutTotal === 'function') updateCheckoutTotal();
}

function updatePaymentMethod() {
  const val = document.querySelector('input[name="paymentMethod"]:checked').value;
  state.paymentMethod = val;
  
  // Подсветка выбранной опции
  const cash = $('#paymentOptionCash'), card = $('#paymentOptionCard');
  if (cash) cash.classList.toggle('is-active', val === 'cash');
  if (card) card.classList.toggle('is-active', val === 'card');
}

window.toggleDeliveryMethod = toggleDeliveryMethod;
window.updatePaymentMethod = updatePaymentMethod;
window.openCheckout = openCheckout;
window.handleCheckoutSubmit = handleCheckoutSubmit;
window.onPhoneInput = applyPhoneMask;
window.applyPhoneMask = applyPhoneMask;