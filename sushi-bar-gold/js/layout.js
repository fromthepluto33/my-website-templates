/* ============================================================
   js/layout.js — шапка, подвал, общие слоты
   Полная версия с обёртками версий (hasFeature)
   Бренд: Суши Бар
   ============================================================ */

const CFG = () => window.SITE_CONFIG || {};

/* ---------- ОБЩИЕ ДАННЫЕ ---------- */
function buildCommonData() {
  const cfg = CFG();
  return {
    cafe: cfg.cafe || {},
    contacts: cfg.contacts || { phones: [] },
    socials: (cfg.socials || []).slice(0, 3),
    schedule: (cfg.schedule && cfg.schedule.delivery) || [],
  };
}

/* ---------- HTML-ГЕНЕРАТОРЫ ---------- */
function socialsList(socials, variant) {
  if (variant === 'footer') {
    return socials.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener" class="social-button social-button--large">
        ${socialIconSvg(s.icon)}<span>${s.name}</span>
      </a>`).join('');
  }
  return socials.map(s => `
    <a href="${s.url}" target="_blank" rel="noopener" class="social-button" aria-label="${s.name}" title="${s.name}">
      ${socialIconSvg(s.icon)}
    </a>`).join('');
}

function phonesList(phones, variant) {
  if (variant === 'footer') {
    return phones.map(p => `
      <a href="${p.href}" class="footer__item">${iconSvg('phone', false, 'icon icon--small icon--accent')} ${p.number}</a>`).join('');
  }
  return phones.map(p => `
    <a href="${p.href}" class="contacts-dropdown__phone">
      <span class="contacts-dropdown__number">${p.number}</span>
      <span class="contacts-dropdown__label">${p.label}</span>
    </a>`).join('');
}

function scheduleList(schedule, variant) {
  if (variant === 'footer') {
    return schedule.map(s => `<div>${s.days}: ${s.time}</div>`).join('');
  }
  return schedule.map(s => `
    <div class="schedule__row"><span>${s.days}</span><span>${s.time}</span></div>`).join('');
}

/* ---------- ШАПКА ---------- */
function renderHeader() {
  const slot = document.getElementById('header-slot');
  if (!slot) return;
  const { contacts, socials, schedule } = buildCommonData();

  slot.innerHTML = `
    <header class="header">
      <div class="container header__inner">
      <a class="logo" href="index.html" aria-label="Суши Бар — на главную">
        <img class="logo__img" src="images/logo/logo-horizontal.webp" alt="Суши Бар" />
      </a>
        <div class="header__controls">
          <div class="contacts-dropdown" id="contactsDropdown">
            <button class="contacts-dropdown__toggle" id="contactsToggle">
              ${iconSvg('phone', false, 'icon icon--small icon--accent')}
              <span class="contacts-dropdown__preview">${contacts.phones[0] ? contacts.phones[0].number : ''}</span>
              ${iconSvg('chev', false, 'icon icon--tiny')}
            </button>
            <div class="contacts-dropdown__menu" id="contactsMenu">
              <div class="contacts-dropdown__heading">Телефоны</div>
              ${phonesList(contacts.phones, 'header')}
              <div class="contacts-dropdown__heading">Режим работы</div>
              <div class="schedule schedule--compact">${scheduleList(schedule, 'header')}</div>
            </div>
          </div>
          ${socialsList(socials, 'header')}
          <button class="favorites-button" id="favoritesHeaderButton" title="Избранные блюда">
            ${iconSvg('heart', state.category === 'fav', 'icon icon--small icon--accent')}
            <span class="favorites-button__value" id="favoritesCount">${state.favorites.length}</span>
          </button>
          <button class="cart-toggle" id="cartButton">
            ${iconSvg('bag', false, 'icon')}
            <span class="cart-toggle__label">Корзина</span>
            <span class="cart-toggle__badge is-hidden" id="cartBadge">0</span>
          </button>
        </div>
      </div>
    </header>`;

  const dd = document.getElementById('contactsDropdown');
  const toggle = document.getElementById('contactsToggle');
  if (toggle) toggle.addEventListener('click', (e) => { e.stopPropagation(); dd.classList.toggle('is-open'); });
  document.addEventListener('click', (e) => { if (dd && !dd.contains(e.target)) dd.classList.remove('is-open'); });
}

/* ---------- ПОДВАЛ ---------- */
function renderFooter() {
  const slot = document.getElementById('footer-slot');
  if (!slot) return;
  const { cafe, contacts, socials, schedule } = buildCommonData();

  slot.innerHTML = `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
        <div class="footer__brand-row">
        <a class="logo" href="index.html" aria-label="Суши Бар — на главную">
          <img class="logo__img logo__img--footer" src="images/logo/logo-square.webp" alt="Суши Бар" />
        </a>
        </div>
          <p class="footer__about">Кафе-доставка японской кухни премиального качества. Свежие продукты каждый день.</p>
          <div class="footer__socials">${socialsList(socials, 'footer')}</div>
        </div>
        <div class="footer__column">
          <div class="footer__heading">Контакты</div>
          <div class="footer__list">
            ${phonesList(contacts.phones, 'footer')}
            <a href="mailto:${contacts.email}" class="footer__item">${iconSvg('mail', false, 'icon icon--small icon--accent')} ${contacts.email}</a>
            <div class="footer__item">${iconSvg('clock', false, 'icon icon--small icon--accent')}<div>${scheduleList(schedule, 'footer')}</div></div>
          </div>
        </div>
        <div class="footer__column">
          <div class="footer__heading">Информация</div>
          <div class="footer__list">
            <a href="delivery.html" class="footer__item footer__item--link">Доставка и оплата</a>
            <a href="promos.html" class="footer__item footer__item--link">Акции и сеты</a>
            <a href="contacts.html" class="footer__item footer__item--link">Контакты</a>
            <a href="privacy.html" class="footer__item footer__item--link">Политика конфиденциальности</a>
          </div>
        </div>
      </div>
      <div class="footer__copyright">© 2026 ${cafe.name || 'Суши Бар'} · ${cafe.kanji || '寿司'}の寿司 · ${contacts.legal || ''}</div>
    </footer>`;
}

/* ---------- ОБЩИЕ СЛОТЫ (корзина, модалки) ---------- */
function renderLayoutSlot() {
  const slot = document.getElementById('layout-slot');
  if (!slot) return;

  slot.innerHTML = `
    <div class="cart-overlay" id="cartOverlay"></div>
    <aside class="cart" id="cartSidebar">
      <div class="cart__header">
        <div class="cart__heading"><span class="cart__title">Корзина</span><span class="cart__count" id="cartCountLabel"></span></div>
        <button class="modal__close" id="cartCloseButton">${iconSvg('close', false, 'icon')}</button>
      </div>
      <div class="cart__empty" id="cartEmpty">
        <span class="empty-state__kanji">空</span>
        <div class="empty-state__title">Корзина пуста</div>
        <p class="empty-state__text">Добавьте блюда из меню — они появятся здесь</p>
        <button class="button button--primary" id="cartEmptyCloseButton">К меню</button>
      </div>
      <div class="cart__items" id="cartItems"></div>
      <div style="padding: 0 20px 12px;">
        <button class="button button--ghost button--block" id="myOrdersBtn">📋 Мои заказы</button>
      </div>
      <div class="cart__totals" id="cartTotals">
        <div class="totals-row"><span class="totals-row__label">Товары</span><span class="totals-row__value" id="totalsProducts">0 ₽</span></div>
        <div class="totals-row"><span class="totals-row__label">Доставка</span><span class="totals-row__value" id="totalsDelivery">Бесплатно</span></div>
        <div class="cart__delivery-note" id="deliveryNote" hidden>До бесплатной доставки не хватает <b id="deliveryNoteSum">0 ₽</b></div>
        <div class="totals-row totals-row--final"><span class="totals-row__label">Итого</span><span class="totals-row__value" id="totalsFinal">0 ₽</span></div>
        <button class="button button--primary button--block" id="checkoutButton">Оформить заказ</button>
      </div>
    </aside>

    <div class="modal" id="wokModal">
      <div class="modal__window modal__window--wide">
        <div class="modal__header">
          <div><div class="modal__eyebrow">Конструктор WOK</div><h2 class="modal__title" id="wokStepTitle">Шаг 1: Основа</h2></div>
          <button class="modal__close" data-close-modal="wokModal">${iconSvg('close', false, 'icon')}</button>
        </div>
        <div class="step-progress" id="wokProgress"></div>
        <div class="modal__body" id="wokBody"></div>
        <div class="modal__footer">
          <div class="wok-summary"><div class="wok-summary__list" id="wokSummaryList"></div><span class="wok-summary__total" id="wokSummaryTotal">0 ₽</span></div>
          <div class="modal__footer-actions">
            <button class="button button--ghost button--back" id="wokBackButton">Назад</button>
            <button class="button button--primary" id="wokNextButton">Далее</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" id="sauceModal">
      <div class="modal__window">
        <div class="modal__header">
          <div><div class="modal__eyebrow">Дополнение</div><h2 class="modal__title">Выберите соус</h2><div class="modal__subtitle" id="sauceItemName"></div></div>
          <button class="modal__close" data-close-modal="sauceModal">${iconSvg('close', false, 'icon')}</button>
        </div>
        <div class="modal__body"><div class="sauce-list" id="sauceList"></div></div>
        <div class="modal__footer"><button class="button button--primary button--block" id="sauceConfirmButton">Добавить</button></div>
      </div>
    </div>

    <div class="modal" id="checkoutModal">
      <div class="modal__window">
        <div class="modal__header" id="checkoutHeader">
          <div><div class="modal__eyebrow">Доставка</div><h2 class="modal__title">Оформление заказа</h2></div>
          <button class="modal__close" data-close-modal="checkoutModal">${iconSvg('close', false, 'icon')}</button>
        </div>
        <form class="checkout-form" id="checkoutForm">
          <div class="form-field">
            <label class="form-field__label">Способ получения</label>
            <div class="delivery-options">
              <label class="delivery-option is-active" id="deliveryOptionCourier">
                <input type="radio" name="deliveryMethod" value="courier" checked onchange="toggleDeliveryMethod()" />
                <span class="delivery-option__icon">🚗</span>
                <span class="delivery-option__text"><b>Курьер</b><small>Доставка по городу</small></span>
              </label>
              <label class="delivery-option" id="deliveryOptionPickup">
                <input type="radio" name="deliveryMethod" value="pickup" onchange="toggleDeliveryMethod()" />
                <span class="delivery-option__icon">🏪</span>
                <span class="delivery-option__text"><b>Самовывоз</b><small>Заберу сам</small></span>
              </label>
            </div>
          </div>
          <div class="form-field" id="deliveryAddressBlock">
            <label class="form-field__label" for="fieldAddress">Адрес доставки</label>
            <input class="form-field__input" id="fieldAddress" type="text" placeholder="Улица, дом, квартира" />
          </div>
          <div id="pickupAddressBlock" hidden>
            <div class="pickup-info">
              <div class="pickup-info__icon">📍</div>
              <div class="pickup-info__text"><b>Адрес самовывоза:</b><br /><span id="pickupAddressText">уточняйте по телефону</span></div>
            </div>
          </div>
          <div class="form-field">
            <label class="form-field__label" for="fieldName">Имя</label>
            <input class="form-field__input" id="fieldName" type="text" placeholder="Ваше имя" required />
          </div>
          <div class="form-field">
            <label class="form-field__label" for="fieldPhone">Телефон</label>
            <input class="form-field__input" id="fieldPhone" type="tel" placeholder="+7 (___) ___-__-__" required maxlength="18" oninput="onPhoneInput()" />
          </div>
          <div class="form-field">
            <label class="form-field__label">Способ оплаты</label>
            <div class="payment-options">
              <label class="payment-option is-active" id="paymentOptionCash">
                <input type="radio" name="paymentMethod" value="cash" checked onchange="updatePaymentMethod()" />
                <span class="payment-option__icon">💵</span>
                <span class="payment-option__text"><b>Наличными</b><small>При получении</small></span>
              </label>
              <label class="payment-option" id="paymentOptionCard">
                <input type="radio" name="paymentMethod" value="card" onchange="updatePaymentMethod()" />
                <span class="payment-option__icon">💳</span>
                <span class="payment-option__text"><b>Картой</b><small>Через терминал</small></span>
              </label>
            </div>
          </div>
          <div class="bonus-block" id="bonusBlock" hidden>
            <div class="bonus-block__balance">🎁 На вашем номере <b id="bonusBalanceValue">0</b> бонусов</div>
            <label class="bonus-block__spend">
              <input type="checkbox" id="useBonusesCheckbox" onchange="updateBonusSpend()" />
              <span>Списать бонусы (макс. <b id="bonusMaxSpend">0</b> ₽)</span>
            </label>
            <div class="bonus-block__result" id="bonusSpendResult" hidden>Скидка бонусами: <b id="bonusSpendValue">0</b> ₽</div>
          </div>
          <div class="checkout-total"><span class="checkout-total__label">К оплате</span><span class="checkout-total__value" id="checkoutTotal">0 ₽</span></div>
          <div class="form-field">
            <label class="bonus-block__spend">
              <input type="checkbox" id="privacyConsentCheckbox" required />
              <span>Согласен на обработку персональных данных в соответствии с <a href="privacy.html" target="_blank" style="color: var(--color-accent); text-decoration: underline;">политикой конфиденциальности</a></span>
            </label>
          </div>
          <button type="submit" class="button button--primary button--block" id="checkoutSubmitButton">Подтвердить заказ</button>
          <p class="checkout-disclaimer">Оплата при получении: наличными или картой через терминал.</p>
        </form>
        <div class="checkout-success" id="checkoutSuccess" hidden>
          <svg class="checkout-success__icon" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#d4af37" stroke-width="2" class="draw-circle" />
            <path d="M30 52 L44 66 L70 38" fill="none" stroke="#d4af37" stroke-width="3" stroke-linecap="square" class="draw-check" />
          </svg>
          <div class="checkout-success__title">Заказ принят</div>
          <div class="checkout-success__number" id="orderNumber">№ 0000</div>
          <div class="checkout-success__bonus" id="bonusEarnedMsg" hidden></div>
          <p class="checkout-success__text">Курьер свяжется с вами в течение 5 минут.<br />Ориентировочное время доставки — 60 минут.</p>
          <div class="checkout-success__kanji">ありがとうございました</div>
          <button class="button button--primary" data-close-modal="checkoutModal">Вернуться в меню</button>
        </div>
      </div>
    </div>

    <div class="modal" id="myOrdersModal">
      <div class="modal__window">
        <div class="modal__header">
          <div><div class="modal__eyebrow">История</div><h2 class="modal__title">Мои заказы</h2></div>
          <button class="modal__close" data-close-modal="myOrdersModal">${iconSvg('close', false, 'icon')}</button>
        </div>
        <div class="modal__body" id="myOrdersList"></div>
      </div>
    </div>

    <div class="modal" id="reviewsModal">
      <div class="modal__window">
        <div class="modal__header">
          <div><div class="modal__eyebrow">Отзывы</div><h2 class="modal__title" id="reviewsTitle">Отзывы</h2></div>
          <button class="modal__close" data-close-modal="reviewsModal">${iconSvg('close', false, 'icon')}</button>
        </div>
        <div class="modal__body">
          <div id="reviewsList"></div>
          <div class="review-form">
            <h3>Оставить отзыв</h3>
            <p class="review-form__hint">Отзыв могут оставить только клиенты, сделавшие заказ — так мы защищаемся от фейковых оценок.</p>
            <div class="review-form__row">
              <div class="form-field"><label class="form-field__label">Номер заказа</label><input class="form-field__input" id="reviewOrderNumber" placeholder="Например, 4821" /></div>
              <div class="form-field"><label class="form-field__label">Телефон из заказа</label><input class="form-field__input" id="reviewPhone" placeholder="+7 (___) ___-__-__" /></div>
            </div>
            <div class="form-field"><label class="form-field__label">Оценка</label><div class="rating-input" id="reviewStars"></div></div>
            <div class="form-field"><label class="form-field__label">Отзыв</label><textarea class="form-field__input" id="reviewText" rows="3" placeholder="Расскажите о блюде…"></textarea></div>
            <button class="review-submit-btn" onclick="submitReview()">Отправить отзыв</button>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-stack" id="toastStack"></div>

    <div class="mobile-cart" id="mobileCartBar" hidden>
      <button class="mobile-cart__button" id="mobileCartButton">
        <span class="mobile-cart__info">${iconSvg('bag', false, 'icon')}<span id="mobileCartCount">0 поз.</span></span>
        <span class="mobile-cart__total" id="mobileCartTotal">0 ₽</span>
      </button>
    </div>`;

  // Применяем версии: убираем функционал старших версий
  if (!hasFeature(2)) {
    const moBtn = document.getElementById('myOrdersBtn'); if (moBtn) moBtn.closest('div').remove();
    const moModal = document.getElementById('myOrdersModal'); if (moModal) moModal.remove();
  }
  if (!hasFeature(3)) {
    const bb = document.getElementById('bonusBlock'); if (bb) bb.remove();
    const rm = document.getElementById('reviewsModal'); if (rm) rm.remove();
  }
}

/* ---------- Способы получения из настроек админки ---------- */
function getDeliverySettings() {
  const s = (window.Content && typeof Content.getSettings === 'function') ? Content.getSettings() : {};
  const d = s.delivery || {};
  return { courier: d.courier !== false, pickup: d.pickup !== false, fee: +d.fee || 200, freeFrom: +d.freeFrom || 1000 };
}
window.getDeliverySettings = getDeliverySettings;

function applyDeliveryConfig() {
  const d = getDeliverySettings();
  const courier = $('#deliveryOptionCourier');
  const pickup = $('#deliveryOptionPickup');
  if (courier) courier.hidden = !d.courier;
  if (pickup) pickup.hidden = !d.pickup;

  /* включён ровно один способ — выбираем его и прячем блок выбора */
  if (d.courier !== d.pickup) {
    const val = d.courier ? 'courier' : 'pickup';
    const input = document.querySelector('input[name="deliveryMethod"][value="' + val + '"]');
    if (input) input.checked = true;
    const wrap = (courier || pickup) ? (courier || pickup).closest('.form-field') : null;
    if (wrap) wrap.hidden = true;
  }
  if (typeof toggleDeliveryMethod === 'function') toggleDeliveryMethod();
}

renderHeader();
renderFooter();
renderLayoutSlot();
applyDeliveryConfig();

window.SOCIAL_ICON = function(icon) { return socialIconSvg(icon, 'icon'); };