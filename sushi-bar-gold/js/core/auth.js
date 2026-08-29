/* ============================================================
   js/auth.js — АВТОРИЗАЦИЯ АДМИН-ПАНЕЛИ
   Логин + пароль с SHA-256, защита от перебора, сессии
   ============================================================ */

const Auth = (() => {
  const CREDS_KEY = 'sushibar_admin_creds_v1';
  const SESSION_KEY = 'sushibar_admin_session';
  const ATTEMPTS_KEY = 'sushibar_admin_attempts';

  const MAX_ATTEMPTS = 5;          // максимум попыток
  const LOCK_MS = 60 * 1000;       // блокировка на 1 минуту

  // Учётные данные по умолчанию (СМЕНИТЕ в админке → вкладка "Безопасность")
  const DEFAULT_LOGIN = 'admin';
  const DEFAULT_PASSWORD = 'sushibar2026';

  /* Хеширование SHA-256 (встроенный крипто-API браузера) */
  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* При первом запуске создаём дефолтные учётные данные */
  async function ensureCreds() {
    if (!localStorage.getItem(CREDS_KEY)) {
      const passwordHash = await sha256(DEFAULT_PASSWORD);
      localStorage.setItem(CREDS_KEY, JSON.stringify({
        login: DEFAULT_LOGIN,
        passwordHash,
      }));
    }
  }

  /* ---------- Защита от перебора ---------- */
  function getAttempts() {
    try { return JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || { count: 0, firstAt: 0 }; }
    catch { return { count: 0, firstAt: 0 }; }
  }

  function isLocked() {
    const a = getAttempts();
    if (a.count >= MAX_ATTEMPTS) {
      if (Date.now() - a.firstAt < LOCK_MS) return true;
      localStorage.removeItem(ATTEMPTS_KEY); // время вышло — сбрасываем
      return false;
    }
    return false;
  }

  function recordAttempt() {
    const a = getAttempts();
    const now = Date.now();
    if (a.count === 0 || now - a.firstAt > LOCK_MS) {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count: 1, firstAt: now }));
    } else {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count: a.count + 1, firstAt: a.firstAt }));
    }
  }

  /* ---------- Вход ---------- */
  async function login(login, password) {
    await ensureCreds();
    if (isLocked()) {
      return { ok: false, error: 'Слишком много попыток. Попробуйте через минуту.' };
    }
    const creds = JSON.parse(localStorage.getItem(CREDS_KEY));
    const passwordHash = await sha256(password);

    if (creds.login === login && creds.passwordHash === passwordHash) {
      localStorage.removeItem(ATTEMPTS_KEY);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, at: Date.now() }));
      return { ok: true };
    }
    recordAttempt();
    return { ok: false, error: 'Неверный логин или пароль' };
  }

  /* ---------- Проверка сессии ---------- */
  function isLoggedIn() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      return !!(s && s.loggedIn);
    } catch { return false; }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  /* ---------- Смена логина/пароля ---------- */
  async function changeCredentials(newLogin, oldPassword, newPassword) {
    await ensureCreds();
    const creds = JSON.parse(localStorage.getItem(CREDS_KEY));
    const oldHash = await sha256(oldPassword);
    if (creds.passwordHash !== oldHash) {
      return { ok: false, error: 'Неверный текущий пароль' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, error: 'Новый пароль должен быть не короче 6 символов' };
    }
    const newHash = await sha256(newPassword);
    localStorage.setItem(CREDS_KEY, JSON.stringify({
      login: (newLogin && newLogin.trim()) ? newLogin.trim() : creds.login,
      passwordHash: newHash,
    }));
    return { ok: true };
  }

  return { ensureCreds, login, logout, isLoggedIn, changeCredentials };
})();

window.Auth = Auth;