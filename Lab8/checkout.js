'use strict';

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
            // Синхронизируем с localStorage
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

    // 6. Отправка формы
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
            categories.forEach(cat => { if (objs[cat]) formData.append(cat, objs[cat].keyword); });

            try {
                const res = await fetch(form.action, { method: 'POST', body: formData });
                if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
                
                clearOrder();
                alert('Заказ успешно оформлен!');
                window.location.href = 'Food.html';
            } catch (err) {
                alert(err.message || 'Не удалось отправить заказ');
            }
        });
    }

    // 7. Запуск
    renderComposition();
    renderSummary();
});
