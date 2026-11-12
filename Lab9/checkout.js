'use strict';

const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';
const JSONBIN_MASTER_KEY = '$2a$10$jy6msl.9.C.u1jePECdfk.SF7hBAmb.ddIbn3PpQpmGiJa1DSAYVq';
const ORDERS_BIN_ID = '6af45f69ac6210605a7f8c11'; // Тот же ID, что и в history.js

document.addEventListener('DOMContentLoaded', async () => {
    const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];

    // 1. Загрузка блюд
    let dishes;
    try {
        dishes = await loadDishes();
    } catch (e) {
        alert('Не удалось загрузить меню.');
        return;
    }

    // 2. Чтение заказа (из URL или localStorage)
    let order = {};
    const urlParams = new URLSearchParams(window.location.search);
    const orderFromUrl = urlParams.get('order');

    if (orderFromUrl) {
        try {
            order = JSON.parse(decodeURIComponent(orderFromUrl));
            saveOrder(order); 
        } catch (e) {
            console.error("Ошибка чтения URL:", e);
        }
    } else {
        order = getStoredOrder();
    }

    // 3. Поиск блюд по ключам
    const findDish = (keyword) => {
        if (!keyword) return null;
        return dishes.find(d => d.keyword === keyword) || null;
    };

    const orderObjects = () => ({
        soup: findDish(order.soup),
        main: findDish(order.main),
        salad: findDish(order.salad),
        drink: findDish(order.drink),
        dessert: findDish(order.dessert)
    });

    // 4. Рендер карточек
    const listEl = document.getElementById('composition-list');
    const emptyEl = document.getElementById('composition-empty');

    function renderComposition() {
        if (!listEl || !emptyEl) return;
        listEl.innerHTML = '';
        const objs = orderObjects();
        const hasAny = categories.some(c => objs[c]);

        emptyEl.hidden = hasAny;
        listEl.hidden = !hasAny;
        if (!hasAny) return;

        categories.forEach(cat => {
            const dish = objs[cat];
            if (!dish) return;

            const el = document.createElement('div');
            el.classList.add('dish');
            el.innerHTML = `
                <img src="${dish.image}" alt="${dish.name}">
                <p class="price">${dish.price}₽</p>
                <p class="title">${dish.name}</p>
                <p class="volume">${dish.count}</p>
                <button type="button" class="btn-remove">Удалить</button>
            `;
            el.querySelector('.btn-remove').addEventListener('click', () => {
                order[cat] = null;
                saveOrder(order);
                renderComposition();
                renderSummary();
            });
            listEl.appendChild(el);
        });
    }

    // 5. Рендер левой колонки (итоги)
    function renderSummary() {
        const objs = orderObjects();
        let total = 0;

        categories.forEach(cat => {
            const dish = objs[cat];
            const span = document.getElementById(`sum-${cat}`);
            if (!span) return;

            if (dish) {
                span.textContent = `${dish.name} — ${dish.price}₽`;
                total += dish.price;
            } else {
                span.textContent = cat === 'main' ? 'Не выбрано' : 'Не выбран';
            }
        });

        const totalEl = document.getElementById('sum-total');
        if (totalEl) totalEl.textContent = `${total}₽`;
    }

    // 6. Отправка формы в JSONBin
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const objs = orderObjects();
            
            const error = typeof getOrderError === 'function' ? getOrderError(objs) : null;
            if (error) {
                alert(error);
                return;
            }

            const formData = new FormData(form);
            
            // Собираем объект заказа
            const orderData = {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                created_at: new Date().toISOString(),
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                delivery_address: formData.get('address'),
                delivery_type: formData.get('delivery_type'),
                delivery_time: formData.get('delivery_type') === 'exact_time' ? formData.get('delivery_time') : null,
                comment: formData.get('comment') || '',
                soup: objs.soup ? objs.soup.keyword : null,
                main: objs.main ? objs.main.keyword : null,
                salad: objs.salad ? objs.salad.keyword : null,
                drink: objs.drink ? objs.drink.keyword : null,
                dessert: objs.dessert ? objs.dessert.keyword : null
            };

            try {
                // 1. Читаем текущий список заказов
                const getRes = await fetch(`${JSONBIN_BASE}/${ORDERS_BIN_ID}/latest`, {
                    method: 'GET',
                    headers: {
                        'X-Master-Key': JSONBIN_MASTER_KEY,
                        'Accept': 'application/json'
                    }
                });
                if (!getRes.ok) throw new Error('Не удалось прочитать список заказов');
                
                const json = await getRes.json();
                // Достаем массив из свойства orders
                const allOrders = (json.record && Array.isArray(json.record.orders)) ? json.record.orders : [];

                // 2. Добавляем новый заказ
                allOrders.push(orderData);

                // 3. Сохраняем обратно
                const putRes = await fetch(`${JSONBIN_BASE}/${ORDERS_BIN_ID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': JSONBIN_MASTER_KEY
                    },
                    body: JSON.stringify({ orders: allOrders })
                });
                
                if (!putRes.ok) throw new Error('Не удалось сохранить заказ');

                clearOrder();
                alert('Заказ успешно оформлен!');
                window.location.href = 'history.html';
            } catch (err) {
                console.error(err);
                alert(err.message || 'Не удалось отправить заказ');
            }
        });
    }

    // 7. Запуск
    renderComposition();
    renderSummary();
});
