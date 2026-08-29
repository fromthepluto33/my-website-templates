/* ============================================================
   features-v2/order-history.js — мои заказы и повтор (V2+)
   ============================================================ */

function openMyOrders() {
  renderMyOrders();
  openModal('myOrdersModal');
}

function renderMyOrders() {
  const orders = loadLS('sushibar_orders', []);
  const list = $('#myOrdersList');
  if (!list) return;
  if (!orders.length) {
    list.innerHTML = '<p class="reviews-empty">У вас пока нет заказов. Самое время сделать первый! 🍣</p>';
    return;
  }
  list.innerHTML = orders.slice(0, 15).map(o => `
    <div class="review-item">
      <div class="review-item__header">
        <div>
          <div class="review-item__author">Заказ №${o.number}</div>
          <div class="review-item__date">${new Date(o.createdAt).toLocaleString('ru-RU')} · ${o.items.length} поз. · ${fmt(o.calc.total)} ₽</div>
        </div>
        <button class="btn btn--accent" onclick="repeatOrder('${o.id}')">↻ Повторить</button>
      </div>
      <div class="review-item__text">${o.items.slice(0, 4).map(i => '• ' + i.name + ' ×' + i.qty).join('<br/>')}${o.items.length > 4 ? '<br/>…и ещё ' + (o.items.length - 4) : ''}</div>
    </div>`).join('');
}

function repeatOrder(orderId) {
  const orders = loadLS('sushibar_orders', []);
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const menuItemsList = Content.getMenuItems();
  let addedCount = 0;
  order.items.forEach(it => {
    const product = menuItemsList.find(p => String(p.id) === String(it.id));
    if (product) {
      pushCartEntry({ id: product.id, name: product.name, image: product.image, price: it.price, weight: product.weight, mods: it.mods || [] }, it.qty);
      addedCount += it.qty;
    }
  });
  closeModal('myOrdersModal');
  if (addedCount > 0) { openCart(); showToast('Добавлено товаров: ' + addedCount); renderMenu(); }
  else showToast('Товары из этого заказа больше недоступны');
}

window.openMyOrders = openMyOrders;
window.repeatOrder = repeatOrder;