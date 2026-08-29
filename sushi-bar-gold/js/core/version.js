const PRODUCT_VERSION = 3;   // ← МЕНЯЙТЕ ЗДЕСЬ: 1, 2 или 3

const PRODUCT_NAMES = {
  1: 'Суши Бар — V1.0 База',
  2: 'Суши Бар — V2.0 Стандарт',
  3: 'Суши Бар — V3.0 Премиум',
};

function hasFeature(minVersion) {
  return PRODUCT_VERSION >= minVersion;
}

window.PRODUCT_VERSION = PRODUCT_VERSION;
window.PRODUCT_NAME = PRODUCT_NAMES[PRODUCT_VERSION];
window.hasFeature = hasFeature;

console.log('%c' + PRODUCT_NAMES[PRODUCT_VERSION], 'color:#d4af37;font-weight:bold;font-size:14px');