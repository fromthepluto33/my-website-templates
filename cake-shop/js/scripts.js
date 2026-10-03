// Шапка при скролле + кнопка наверх
addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', scrollY > 10);
    document.getElementById('toTop').classList.toggle('show', scrollY > 600);
});

// Мягкое появление блоков
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target)
    }
}), { threshold: .12 });

document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * .12 + 's';
    io.observe(el)
});

// Мобильное меню: открытие + блокировка скролла
const nav = document.getElementById('nav'),
    burger = document.querySelector('.burger');

function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.classList.toggle('active', open);
    document.body.classList.toggle('no-scroll', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Кнопка «Наверх»
document.getElementById('toTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============ ПРЕВЬЮ ТОРТА В МОДАЛКЕ ============
const previewMap = {
    '3D торты': 'img/retro-camera-cake.webp', // (или img/3d-robot.webp, если поменяли на главной)
    'Сладкий стол и капкейки': 'img/slad-cake-pops.webp',
    'Муссовые торты': 'img/mousse-cake.webp',
    'Торты к праздникам': 'img/prazd-8marta.webp',
    'Корпоративные торты': 'img/corp-kvantsoft.webp',
    'Детские торты': 'img/det-lion.webp',
    'Свадебные и юбилейные': 'img/svad-burgundy.webp',
    'Пряники': 'img/pryan-winter.webp',
    'Без мастичного покрытия': 'img/bez-bant.webp'
};
const fPreview = document.getElementById('fPreview');

function updatePreview(arg) {
    const src = arg.startsWith('img/') ? arg : (previewMap[arg] || 'img/mousse-cake.webp');
    if (!fPreview) return;
    fPreview.style.opacity = 0;
    const tmp = new Image();
    tmp.onload = () => {
        fPreview.src = src;
        fPreview.style.opacity = 1;
    };
    tmp.src = src;
}

// смена превью при ручном выборе категории
document.getElementById('fType').addEventListener('change', e => {
    const cat = e.target.value;
    updatePreview(cat);
    document.getElementById('fComment').value = 'Хочу: ' + cat;
});

function openModal(type, preview, name) {
    document.getElementById('modal').classList.add('open');
    const fComment = document.getElementById('fComment');
    const fTypeSelect = document.getElementById('fType');
    
    // Если тип не передан (клик по общей кнопке), берем текущее значение из селекта
    const currentType = type || fTypeSelect.value;

    // Если есть конкретное название торта — пишем его, иначе категорию
    fComment.value = name ? ('Хочу: ' + name) : ('Хочу: ' + currentType);
    
    if (type) {
        [...fTypeSelect.options].forEach((o, i) => { if (o.text === type) fTypeSelect.selectedIndex = i; });
    }
    
    // Обновляем превью: если передан путь — используем его, иначе берем по категории
    if (preview && preview.startsWith('img/')) {
        updatePreview(preview);
    } else {
        updatePreview(currentType);
    }
}

function closeModal() { document.getElementById('modal').classList.remove('open') }
document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal() });

// ============ МАСКА ТЕЛЕФОНА В МОДАЛКЕ ============
const fPhone = document.getElementById('fPhone');
if (fPhone) {
    fPhone.addEventListener('input', () => {
        let d = fPhone.value.replace(/\D/g, '');
        if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1); // съели чужую 7/8
        d = d.slice(0, 10);
        if (!d) { fPhone.value = ''; return; }
        let v = '+7';
        if (d.length > 0) v += ' (' + d.slice(0, 3);
        if (d.length >= 4) v += ') ' + d.slice(3, 6);
        if (d.length >= 7) v += '-' + d.slice(6, 8);
        if (d.length >= 9) v += '-' + d.slice(8, 10);
        fPhone.value = v;
    });
}

// Заявка -> ВКонтакте Василисы Прекрасной
document.getElementById('orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const fName = document.getElementById('fName');
    const fPhone = document.getElementById('fPhone');
    const fType = document.getElementById('fType');
    const fDate = document.getElementById('fDate');
    const fComment = document.getElementById('fComment');
    if (fPhone.value.replace(/\D/g, '').length !== 11) {
        toast('Заполните телефон полностью: +7 (___) ___-__-__');
        fPhone.focus();
        return;
    }
    const msg = `Здравствуйте, Василиса! Меня зовут ${fName.value}.\nТелефон: ${fPhone.value}\nКатегория: ${fType.value}\nДата: ${fDate.value||'не указана'}\nПожелания: ${fComment.value||'—'}`;
    sendToVK(msg);
    closeModal();
});

// ============ БЛЁСТКИ НА ПЕРВОМ ЭКРАНЕ ============
const hero = document.querySelector('.hero');
if (hero) {
    for (let i = 0; i < 60; i++) {
        const s = document.createElement('span');
        s.className = 'sprinkle';
        s.setAttribute('aria-hidden', 'true');
        const size = 3 + Math.random() * 6;
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.top = (15 + Math.random() * 83) + '%';
        s.style.left = Math.random() * 100 + '%';
        s.style.setProperty('--d', (Math.random() * 6).toFixed(2) + 's');
        s.style.setProperty('--t', (4 + Math.random() * 4).toFixed(2) + 's');
        if (Math.random() < .18) s.style.background = 'var(--caramel)';
        hero.appendChild(s);
    }
}

// ============ НАКРУТКА ЦИФР В ПЛАШКАХ ============
const nio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target,
        m = el.textContent.match(/(\d+)(\D*)$/);
    if (m) {
        const target = +m[1],
            suf = m[2],
            t0 = performance.now();
        const tick = t => {
            const p = Math.min((t - t0) / 1800, 1),
                ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * ease) + suf;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    nio.unobserve(el);
}), { threshold: .6 });
document.querySelectorAll('.stat b').forEach(el => nio.observe(el));

// ============ КАНАЛ ЗАКАЗА: ВКОНТАКТЕ ============
const VK_URL = 'https://vk.com/vasilisa_cakes'; // ← вставьте свою страницу ВК
function sendToVK(text) {
    navigator.clipboard.writeText(text).then(() => {
        toast('Заказ скопирован — вставьте его в сообщение ВКонтакте');
        window.open(VK_URL, '_blank');
    }).catch(() => {
        prompt('Скопируйте текст заказа:', text);
        window.open(VK_URL, '_blank');
    });
}

function toast(msg, icon) {
    const t = document.getElementById('toast');
    t.innerHTML = msg + (icon ? `<img src="${icon}" alt="" class="toast-icon">` : '');
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 3000);
}

// ============ КОРЗИНА ============
let cart = JSON.parse(localStorage.getItem('vp_cart') || '[]');
document.body.insertAdjacentHTML('beforeend', `
<div class="cart-overlay" id="cartOverlay"></div>
<div class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-label="Корзина">
  <div class="cart-head"><h3>Корзина</h3><button class="modal-close" style="position:static" onclick="cartToggle(false)" aria-label="Закрыть корзину">×</button></div>
  <div class="cart-list" id="cartList"></div>
  <div class="cart-foot">
    <div class="cart-total"><span>Итого:</span><b id="cartTotal">0 ₽</b></div>
    <input type="text" id="cName" placeholder="Ваше имя" autocomplete="name">
    <input type="tel" id="cPhone" placeholder="+7 (___) ___-__-__" autocomplete="tel">
    <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="cartCheckout()">Оформить в ВКонтакте</button>
  </div>
</div>
<div class="toast" id="toast"></div>`);
document.getElementById('cartOverlay').addEventListener('click', () => cartToggle(false));
document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (b) {
        const id = b.dataset.add,
            it = cart.find(i => i.id === id);
        if (it) it.qty++;
        else cart.push({ id, name: b.dataset.name, price: +b.dataset.price, img: b.dataset.img, qty: 1 });
        cartSave();
        toast('Добавлено в корзину', 'img/icon-cart.webp');
    }
});

function cartSave() {
    localStorage.setItem('vp_cart', JSON.stringify(cart));
    cartRender();
}

function cartToggle(open) {
    document.getElementById('cartDrawer').classList.toggle('open', open);
    document.getElementById('cartOverlay').classList.toggle('show', open);
    document.body.classList.toggle('no-scroll', open);
}

function cartQty(id, d) {
    const it = cart.find(i => i.id === id);
    if (!it) return;
    it.qty += d;
    if (it.qty < 1) cart = cart.filter(i => i.id !== id);
    cartSave();
}

function cartRemove(id) {
    cart = cart.filter(i => i.id !== id);
    cartSave();
}

function cartRender() {
    const n = cart.reduce((s, i) => s + i.qty, 0),
        badge = document.getElementById('cartBadge');
    badge.textContent = n;
    badge.classList.toggle('show', n > 0);
    document.getElementById('cartList').innerHTML = cart.length ? cart.map(i => `
    <div class="cart-item"><img src="${i.img}" alt="">
      <div class="ci-name">${i.name}<div class="ci-price">${i.price.toLocaleString('ru-RU')} ₽</div></div>
      <div class="ci-qty"><button onclick="cartQty('${i.id}',-1)">−</button><span>${i.qty}</span><button onclick="cartQty('${i.id}',1)">+</button></div>
      <button class="ci-remove" onclick="cartRemove('${i.id}')">✕</button></div>`).join('') :
        '<p class="cart-empty">Пока пусто — загляните в <a href="index.html#cats" onclick="cartToggle(false)">Каталог</a> 🧁</p>';
    document.getElementById('cartTotal').textContent = cart.reduce((s, i) => s + i.qty * i.price, 0).toLocaleString('ru-RU') + ' ₽';
}

function cartCheckout() {
    if (!cart.length) { toast('Корзина пуста'); return; }
    const cName = document.getElementById('cName'),
        cPhone = document.getElementById('cPhone');
    if (!cName.value.trim() || cPhone.value.replace(/\D/g, '').length !== 11) { toast('Заполните имя и телефон полностью'); return; }
    let msg = `Здравствуйте, Василиса! Хочу оформить заказ:\n`;
    cart.forEach((i, n) => { msg += `${n+1}) ${i.name} — ${i.qty} шт × ${i.price} ₽ = ${i.qty*i.price} ₽\n`; });
    msg += `Итого: ${cart.reduce((s,i)=>s+i.qty*i.price,0)} ₽\nИмя: ${cName.value}\nТелефон: ${cPhone.value}`;
    sendToVK(msg);
    cart = [];
    cartSave();
    cartToggle(false);
}

// Маска для телефона в корзине
const cPhone = document.getElementById('cPhone');
if (cPhone) {
    cPhone.addEventListener('input', () => {
        let d = cPhone.value.replace(/\D/g, '');
        if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
        d = d.slice(0, 10);
        if (!d) { cPhone.value = ''; return; }
        let v = '+7';
        if (d.length > 0) v += ' (' + d.slice(0, 3);
        if (d.length >= 4) v += ') ' + d.slice(3, 6);
        if (d.length >= 7) v += '-' + d.slice(6, 8);
        if (d.length >= 9) v += '-' + d.slice(8, 10);
        cPhone.value = v;
    });
}
cartRender();