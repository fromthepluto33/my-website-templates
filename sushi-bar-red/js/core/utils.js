/* ============================================================
   core/utils.js — базовые утилиты (все версии)
   ============================================================ */

const $ = (s) => document.querySelector(s);
const fmt = (n) => (n || 0).toLocaleString('ru-RU');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function loadLS(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
}

function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function showToast(msg) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  stack.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

function maskPhone(phone) {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length < 4) return '';
  return '+7 *** *** ' + d.slice(-2);
}

window.$ = $;
window.fmt = fmt;
window.escapeHtml = escapeHtml;
window.loadLS = loadLS;
window.saveLS = saveLS;
window.showToast = showToast;
window.maskPhone = maskPhone;