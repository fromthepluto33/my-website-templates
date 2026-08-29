/* ============================================================
   features-v3/reviews.js — отзывы и рейтинги UI (V3)
   Бизнес-логика (Content.addReview и т.д.) — в core/content.js
   ============================================================ */

let currentReviewProductId = null;
let selectedRating = 0;

function openReviews(productId) {
  currentReviewProductId = productId;
  selectedRating = 0;
  const item = Content.getAllProducts().find(p => String(p.id) === String(productId));
  if (!item) return;
  $('#reviewsTitle').textContent = 'Отзывы: ' + item.name;
  renderReviewsList(productId);
  renderRatingInput();
  openModal('reviewsModal');
}

function renderReviewsList(productId) {
  const reviews = Content.getProductReviews(productId).filter(r => r.approved);
  const list = $('#reviewsList'); if (!list) return;
  if (!reviews.length) {
    list.innerHTML = '<div class="reviews-empty">Отзывов пока нет. Будьте первым! 🍣</div>';
    return;
  }
  list.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-item__header">
        <div>
          <div class="review-item__author">
            <span class="review-item__verified">✓</span> Проверенный покупатель
            <span class="review-item__phone">${maskPhone(r.phone)}</span>
          </div>
          <div class="review-item__date">${new Date(r.createdAt).toLocaleDateString('ru-RU')}</div>
        </div>
        <div class="review-item__stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      </div>
      <div class="review-item__text">${escapeHtml(r.text)}</div>
    </div>`).join('');
}

function renderRatingInput() {
  const container = $('#reviewStars'); if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'rating-input__star' + (i <= selectedRating ? ' is-active' : '');
    star.textContent = i <= selectedRating ? '★' : '☆';
    star.addEventListener('click', () => { selectedRating = i; renderRatingInput(); });
    container.appendChild(star);
  }
}

function submitReview() {
  const orderNumber = $('#reviewOrderNumber').value.trim();
  const phone = $('#reviewPhone').value.trim();
  const text = $('#reviewText').value.trim();
  if (!orderNumber) { showToast('Укажите номер заказа'); return; }
  if (phone.replace(/\D/g, '').length !== 11) { showToast('Укажите телефон из заказа'); return; }
  if (!selectedRating) { showToast('Поставьте оценку'); return; }
  if (!text) { showToast('Напишите отзыв'); return; }

  const orders = loadLS('sushibar_orders', []);
  const order = orders.find(o => String(o.number) === String(orderNumber));
  if (!order) { showToast('Заказ с таким номером не найден'); return; }
  if ((order.customer.phone || '').replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
    showToast('Телефон не совпадает с заказом'); return;
  }

  Content.addReview({ productId: currentReviewProductId, phone, rating: selectedRating, text });
  $('#reviewOrderNumber').value = '';
  $('#reviewPhone').value = '';
  $('#reviewText').value = '';
  selectedRating = 0;
  renderRatingInput();
  showToast('Спасибо! Отзыв появится после модерации.');
  renderReviewsList(currentReviewProductId);
  renderMenu();
}

window.openReviews = openReviews;
window.renderReviewsList = renderReviewsList;
window.submitReview = submitReview;