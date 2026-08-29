/* ============================================================
   features-v3/loyalty.js — программа лояльности UI (V3)
   Бизнес-логика (Content.earnBonuses и т.д.) — в core/content.js
   ВАЖНО: функция переименована в updateBonusBlock,
   чтобы НЕ перетирать маску телефона из checkout.js
   ============================================================ */

function updateBonusBlock() {
  const block = $('#bonusBlock');
  if (!block) return;
  const phone = $('#fieldPhone').value.trim();
  const settings = Content.getLoyaltySettings();

  if (!settings.enabled || phone.replace(/\D/g, '').length !== 11) {
    block.hidden = true;
    if ($('#useBonusesCheckbox')) $('#useBonusesCheckbox').checked = false;
    updateCheckoutTotal();
    return;
  }

  const balance = Content.getClientBalance(phone);
  const stats = cartStats();
  const maxSpend = Math.floor(stats.subtotal * settings.maxSpendPercent / 100);
  $('#bonusBalanceValue').textContent = balance;
  $('#bonusMaxSpend').textContent = Math.min(balance, maxSpend);
  block.hidden = false;
  updateCheckoutTotal();
}

function updateBonusSpend() { updateCheckoutTotal(); }

function calcBonusSpend() {
  const phone = $('#fieldPhone').value.trim();
  const settings = Content.getLoyaltySettings();
  const useBonuses = $('#useBonusesCheckbox') && $('#useBonusesCheckbox').checked;
  if (!useBonuses || !settings.enabled || phone.replace(/\D/g, '').length !== 11) return 0;
  const balance = Content.getClientBalance(phone);
  const stats = cartStats();
  const maxSpend = Math.floor(stats.subtotal * settings.maxSpendPercent / 100);
  return Math.min(balance, maxSpend);
}

function updateCheckoutTotal() {
  const bonusSpent = calcBonusSpend();
  const stats = cartStats();
  const result = $('#bonusSpendResult');
  if (result) {
    $('#bonusSpendValue').textContent = bonusSpent;
    result.hidden = bonusSpent === 0;
  }
  $('#checkoutTotal').textContent = fmt(Math.max(0, stats.total - bonusSpent)) + ' ₽';
}

document.addEventListener('input', function (e) {
  if (e.target && e.target.id === 'fieldPhone') updateBonusBlock();
});

window.updateBonusBlock = updateBonusBlock;
window.updateBonusSpend = updateBonusSpend;
window.calcBonusSpend = calcBonusSpend;
window.updateCheckoutTotal = updateCheckoutTotal;