/* ============================================================
   core/sauce.js — выбор соусов (все версии)
   ============================================================ */

function openSauceModal(item) {
  state.sauceItem = item;
  const options = window.SAUCE_SETS[item.sauceGroup];
  state.sauceSelected = options[options.length - 1];
  $('#sauceItemName').textContent = item.name;
  renderSauceList(); openModal('sauceModal');
}

function renderSauceList() {
  const options = window.SAUCE_SETS[state.sauceItem.sauceGroup];
  $('#sauceList').innerHTML = options.map((o, i) => `
    <button class="sauce-row ${state.sauceSelected.name === o.name ? 'is-selected' : ''}" data-sauce-idx="${i}">
      <span class="sauce-row__left"><span class="sauce-row__radio"><span class="sauce-row__dot"></span></span>
      <span class="sauce-row__name">${o.name}</span></span>
      <span class="sauce-row__price ${o.price ? 'sauce-row__price--accent' : ''}">${o.price ? '+' + o.price + ' ₽' : '0 ₽'}</span>
    </button>`).join('');
  $('#sauceList').querySelectorAll('[data-sauce-idx]').forEach(b => b.addEventListener('click', () => {
    state.sauceSelected = options[+b.dataset.sauceIdx];
    renderSauceList();
  }));
  $('#sauceConfirmButton').textContent = 'Добавить · ' + fmt(state.sauceItem.price + state.sauceSelected.price) + ' ₽';
}

function confirmSauce() {
  const item = state.sauceItem, sauce = state.sauceSelected;
  pushCartEntry({
    id: item.id, name: item.name, image: item.image,
    price: item.price + sauce.price, weight: item.weight,
    mods: ['Соус: ' + sauce.name],
  });
  closeModal('sauceModal');
  showToast(item.name + ' (' + sauce.name + ') — добавлено');
  renderMenu(); renderCart();
}

window.openSauceModal = openSauceModal;
window.confirmSauce = confirmSauce;