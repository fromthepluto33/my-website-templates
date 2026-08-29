/* ============================================================
   js/site-config.js — ЕДИНАЯ ТОЧКА НАСТРОЙКИ САЙТА
   Меняете данные ЗДЕСЬ — обновляются шапка, подвал,
   слайдеры, страница контактов, доставки и логика работы.
   ============================================================ */

const SITE_CONFIG = {

  /* ---------- КАФЕ ---------- */
  cafe: {
    name: 'Суши Бар',
    tagline: '日本料理 · Элиста',
    kanji: '寿司',
  },

  /* ---------- КОНТАКТЫ (меняются в одном месте) ---------- */
  contacts: {
    phones: [
      { number: '8 (999) 999-99-99',  href: 'tel:+79999999999',  label: 'мобильный' },
      { number: '8 (49999) 99-999',   href: 'tel:+74999999999',  label: 'городской' },
    ],
    email: 'zakazsushibar@mail.ru',
    address: 'г. Элиста, ул. Солнечная, д. 18',
    mapQuery: 'Элиста,улица+Солнечная,+18',       // для Яндекс Карты
    photo: 'images/foto-zala.webp',
    legal: 'ИП Углов А. П., ОГРНИП 326202991923435',
    site: 'https://sushi-bar.ru',
  },

  /* ---------- СОЦСЕТИ (добавляйте сюда новые кнопки) ---------- */
  /* Доступные icon: vk, telegram, whatsapp, instagram, youtube   */
  socials: [
    { id: 'vk', name: 'ВКонтакте', url: 'https://vk.ru/', icon: 'vk' },
    // Примеры добавления (раскомментируйте и впишите свои ссылки):
    // { id: 'telegram',  name: 'Telegram',  url: 'https://t.me/',  icon: 'telegram' },
    // { id: 'whatsapp',  name: 'WhatsApp',  url: 'https://wa.me/', icon: 'whatsapp' },
  ],

  /* ---------- РЕЖИМ РАБОТЫ (единственный источник правды) ---------- */
  schedule: {
    // Для отображения клиентам
    delivery: [
      { days: 'пн — чт',      time: '10:00 — 21:45' },
      { days: 'пт — сб',      time: '10:00 — 22:30' },
      { days: 'воскресенье',  time: '10:00 — 21:45' },
    ],
    cafe: [
      { days: 'пн — чт',      time: '10:00 — 22:00' },
      { days: 'пт — сб',      time: '10:00 — 23:00' },
      { days: 'воскресенье',  time: '10:00 — 22:00' },
    ],
    holidaysNote: 'праздничные дни по расписанию пт-сб',
    // Для логики «открыто ли сейчас» (минуты от начала дня)
    logic: {
      weekdays: { open: 600,  close: 1305 },  // 10:00 — 21:45
      weekend:  { open: 600,  close: 1350 },  // 10:00 — 22:30
    },
  },

  /* ---------- СЛАЙДЕРЫ ГЛАВНОЙ (меняйте картинки и подписи) ---------- */
  heroSlides: [
    {
      image: 'images/kalejdoskop-set.webp',
      label: 'Фирменный', title: 'Калейдоскоп СЕТ · 80 шт',
      action: 'category', target: 'sets',
    },
    {
      image: 'images/filadelfiya-original.webp',
      label: 'Популярное', title: 'Филадельфия Оригинал',
      action: 'category', target: 'rolls',
    },
    {
      image: 'images/pepperoni.webp',
      label: 'Пицца', title: 'Пепперони · хит',
      action: 'category', target: 'pizza',
    },
    {
      image: 'images/soberi-svoj-wok.webp',
      label: 'Конструктор', title: 'Собери свой WOK',
      action: 'wok', target: '',
    },
  ],
};

window.SITE_CONFIG = SITE_CONFIG;