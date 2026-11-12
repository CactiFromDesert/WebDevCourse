'use strict';

const ORDERS_BIN_ID = '6af45f69ac6210605a7f8c11'; // Было BIN_ID
const JSONBIN_MASTER_KEY = '$2a$10$jy6msl.9.C.u1jePECdfk.SF7hBAmb.ddIbn3PpQpmGiJa1DSAYVq';
const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';


let ordersData = [];
let editingOrderId = null;
let deletingOrderId = null;
let dishesMap = {};

const tbody = document.getElementById('orders-tbody');
const loadingEl = document.getElementById('orders-loading');
const errorEl = document.getElementById('orders-error');
const tableWrapper = document.getElementById('orders-table-wrapper');
const emptyEl = document.getElementById('orders-empty');
const toastEl = document.getElementById('toast');

function showToast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.classList.toggle('error', isError);
  toastEl.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toastEl.hidden = true; }, 3000);
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function loadDishesMap() {
  try {
    const dishes = await loadDishes();
    dishesMap = {};
    dishes.forEach(d => { dishesMap[d.keyword] = d; });
  } catch (e) {
    console.warn('Не удалось загрузить список блюд:', e);
  }
}

async function fetchOrdersRaw() {
  const url = `${JSONBIN_BASE}/${ORDERS_BIN_ID}/latest`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_MASTER_KEY,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
    const json = await res.json();
    // Читаем массив из свойства orders
    return (json.record && Array.isArray(json.record.orders)) ? json.record.orders : [];
  } catch (error) {
    console.error('Не удалось загрузить заказы:', error);
    throw error;
  }
}

async function saveOrdersRaw(ordersArray) {
  const url = `${JSONBIN_BASE}/${ORDERS_BIN_ID}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_MASTER_KEY
      },
      body: JSON.stringify({ orders: ordersArray }) // Сохраняем в формате { orders: [...] }
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Ошибка сервера: ${res.status}. ${errText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Не удалось сохранить заказы:', error);
    throw error;
  }
}

function getCompositionString(order) {
  const keys = ['soup', 'main', 'salad', 'drink', 'dessert'];
  const names = [];
  keys.forEach(k => {
    const kw = order[k];
    if (kw) names.push(dishesMap[kw] ? dishesMap[kw].name : kw);
  });
  return names.length ? names.join(', ') : '—';
}

function getTotalCost(order) {
  const keys = ['soup', 'main', 'salad', 'drink', 'dessert'];
  let total = 0;
  keys.forEach(k => {
    const kw = order[k];
    if (kw && dishesMap[kw]) total += dishesMap[kw].price;
  });
  return total;
}

function getDeliveryTimeString(order) {
  if (order.delivery_type === 'exact_time' && order.delivery_time) {
    return order.delivery_time;
  }
  return 'Как можно скорее (с 07:00 до 23:00)';
}

function renderOrders() {
  loadingEl.hidden = true;
  errorEl.hidden = true;
  tbody.innerHTML = '';

  if (!ordersData.length) {
    tableWrapper.hidden = true;
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  tableWrapper.hidden = false;

  const sorted = [...ordersData].sort((a, b) => {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  sorted.forEach((order, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${escapeHtml(formatDate(order.created_at))}</td>
      <td>${escapeHtml(getCompositionString(order))}</td>
      <td>${getTotalCost(order)}₽</td>
      <td>${escapeHtml(getDeliveryTimeString(order))}</td>
      <td>
        <div class="order-actions">
          <button type="button" title="Подробнее" data-action="view" data-id="${order.id}"><i class="bi bi-eye"></i></button>
          <button type="button" title="Редактирование" data-action="edit" data-id="${order.id}"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn-delete" title="Удаление" data-action="delete" data-id="${order.id}"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openModal(id) { document.getElementById(id).hidden = false; }
function closeModal(id) { document.getElementById(id).hidden = true; }

function showOrderDetails(order) {
  document.getElementById('view-content').innerHTML = `
    <p><b>Дата оформления:</b> ${escapeHtml(formatDate(order.created_at))}</p>
    <p><b>Состав заказа:</b> ${escapeHtml(getCompositionString(order))}</p>
    <p><b>Стоимость:</b> ${getTotalCost(order)}₽</p>
    <p><b>Имя:</b> ${escapeHtml(order.full_name || '')}</p>
    <p><b>Email:</b> ${escapeHtml(order.email || '')}</p>
    <p><b>Телефон:</b> ${escapeHtml(order.phone || '')}</p>
    <p><b>Адрес доставки:</b> ${escapeHtml(order.delivery_address || '')}</p>
    <p><b>Время доставки:</b> ${escapeHtml(getDeliveryTimeString(order))}</p>
    <p><b>Комментарий:</b> ${escapeHtml(order.comment || '—')}</p>
  `;
  openModal('modal-view');
}

function openEditModal(order) {
  editingOrderId = order.id;
  document.getElementById('edit-full_name').value = order.full_name || '';
  document.getElementById('edit-email').value = order.email || '';
  document.getElementById('edit-phone').value = order.phone || '';
  document.getElementById('edit-delivery_address').value = order.delivery_address || '';
  document.getElementById('edit-delivery_type').value = order.delivery_type || 'asap';
  document.getElementById('edit-delivery_time').value = order.delivery_time || '';
  document.getElementById('edit-comment').value = order.comment || '';
  toggleTimeField();
  openModal('modal-edit');
}

function toggleTimeField() {
  const type = document.getElementById('edit-delivery_type').value;
  document.getElementById('edit-time-group').style.display = type === 'exact_time' ? '' : 'none';
}

function openDeleteModal(order) {
  deletingOrderId = order.id;
  openModal('modal-delete');
}

async function saveEdit() {
  const form = document.getElementById('edit-form');
  const data = {
    full_name: form.full_name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    delivery_address: form.delivery_address.value.trim(),
    delivery_type: form.delivery_type.value,
    delivery_time: form.delivery_type.value === 'exact_time' ? form.delivery_time.value : null,
    comment: form.comment.value.trim()
  };
  if (!data.full_name || !data.email || !data.phone || !data.delivery_address) {
    showToast('Заполните все обязательные поля', true); return;
  }
  if (data.delivery_type === 'exact_time' && !data.delivery_time) {
    showToast('Укажите время доставки', true); return;
  }

  const btn = document.getElementById('btn-save-edit');
  btn.disabled = true; btn.textContent = 'Сохранение...';

  try {
    const all = await fetchOrdersRaw();
    const idx = all.findIndex(o => o.id === editingOrderId);
    if (idx === -1) throw new Error('Заказ не найден');
    Object.assign(all[idx], data);

    await saveOrdersRaw(all);

    const localIdx = ordersData.findIndex(o => o.id === editingOrderId);
    if (localIdx !== -1) Object.assign(ordersData[localIdx], data);

    closeModal('modal-edit');
    renderOrders();
    showToast('Заказ успешно изменён');
  } catch (e) {
    console.error(e);
    showToast(e.message || 'Ошибка сохранения', true);
  } finally {
    btn.disabled = false; btn.textContent = 'Сохранить';
  }
}

async function confirmDelete() {
  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true; btn.textContent = 'Удаление...';

  try {
    const all = await fetchOrdersRaw();
    const filtered = all.filter(o => o.id !== deletingOrderId);

    await saveOrdersRaw(filtered);

    ordersData = ordersData.filter(o => o.id !== deletingOrderId);
    closeModal('modal-delete');
    renderOrders();
    showToast('Заказ успешно удалён');
  } catch (e) {
    console.error(e);
    showToast(e.message || 'Ошибка удаления', true);
  } finally {
    btn.disabled = false; btn.textContent = 'Да';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadDishesMap();

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const order = ordersData.find(o => String(o.id) === String(id));
    if (!order) return;
    const action = btn.getAttribute('data-action');
    if (action === 'view') showOrderDetails(order);
    if (action === 'edit') openEditModal(order);
    if (action === 'delete') openDeleteModal(order);
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close')));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.hidden = true;
    });
  });

  document.getElementById('edit-delivery_type').addEventListener('change', toggleTimeField);
  document.getElementById('btn-save-edit').addEventListener('click', saveEdit);
  document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);

  try {
    ordersData = await fetchOrdersRaw();
    renderOrders();
  } catch (e) {
    loadingEl.hidden = true;
    errorEl.hidden = false;
    errorEl.textContent = 'Не удалось загрузить историю заказов: ' + e.message;
  }
});
