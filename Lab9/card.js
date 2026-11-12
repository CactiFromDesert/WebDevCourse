'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];
    const categoryContainers = {
        soup: document.getElementById('soups-container'),
        main: document.getElementById('mains-container'),
        salad: document.getElementById('salads-container'),
        drink: document.getElementById('drinks-container'),
        dessert: document.getElementById('desserts-container')
    };

    // 1. Загрузка с API
    let dishes;
    try {
        dishes = await loadDishes();
    } catch (error) {
        alert('Не удалось загрузить меню. Проверьте интернет.');
        return;
    }
    dishes.sort((a, b) => a.name.localeCompare(b.name));

    // 2. Отрисовка карточек
    dishes.forEach(dish => {
        const container = categoryContainers[dish.category];
        if (!container) return;

        const dishElement = document.createElement('div');
        dishElement.classList.add('dish');
        dishElement.setAttribute('data-dish', dish.keyword);
        dishElement.setAttribute('data-kind', dish.kind);

        dishElement.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <p class="price">${dish.price}₽</p>
            <p class="title">${dish.name}</p>
            <p class="volume">${dish.count}</p>
            <button type="button">Добавить</button>
        `;
        container.appendChild(dishElement);
    });

    // 3. Восстановление заказа из localStorage
    const saved = getStoredOrder();
    const order = {
        soup:    saved.soup    ? dishes.find(d => d.keyword === saved.soup)    || null : null,
        main:    saved.main    ? dishes.find(d => d.keyword === saved.main)    || null : null,
        salad:   saved.salad   ? dishes.find(d => d.keyword === saved.salad)   || null : null,
        drink:   saved.drink   ? dishes.find(d => d.keyword === saved.drink)   || null : null,
        dessert: saved.dessert ? dishes.find(d => d.keyword === saved.dessert) || null : null
    };

    categories.forEach(cat => {
        if (order[cat]) {
            const el = categoryContainers[cat]?.querySelector(`.dish[data-dish="${order[cat].keyword}"]`);
            if (el) el.classList.add('selected');
        }
    });

    // 4. Главная функция обновления
    const updateUI = () => {
        const toSave = {
            soup: order.soup ? order.soup.keyword : null,
            main: order.main ? order.main.keyword : null,
            salad: order.salad ? order.salad.keyword : null,
            drink: order.drink ? order.drink.keyword : null,
            dessert: order.dessert ? order.dessert.keyword : null
        };
        
        saveOrder(toSave); 

        const panel = document.getElementById('checkout-panel');
        const totalEl = document.getElementById('checkout-total');
        const link = document.getElementById('checkout-link');

        if (!panel || !totalEl || !link) return;

        const hasAny = categories.some(cat => order[cat]);
        panel.hidden = !hasAny;

        if (!hasAny) {
            totalEl.textContent = '0₽';
            link.classList.add('disabled');
            link.href = '#';
            return;
        }

        let total = 0;
        categories.forEach(cat => { if (order[cat]) total += order[cat].price; });
        totalEl.textContent = `${total}₽`;

        let error = 'Ошибка';
        if (typeof getOrderError === 'function') error = getOrderError(order);

        if (error === null) {
            link.classList.remove('disabled');
            link.removeAttribute('title');
            // Передаем данные через URL!
            link.href = 'checkout.html?order=' + encodeURIComponent(JSON.stringify(toSave));
        } else {
            link.classList.add('disabled');
            link.href = '#';
            link.title = error;
        }
    };

    // 5. Обработка кликов (Делегирование событий)
    document.addEventListener('click', e => {
        const button = e.target.closest('.dish button');
        if (!button) return;

        const dishElement = button.closest('.dish');
        const keyword = dishElement.getAttribute('data-dish');
        const selectedDish = dishes.find(d => d.keyword === keyword);
        if (!selectedDish) return;

        const category = selectedDish.category;
        const container = categoryContainers[category];

        if (order[category] && order[category].keyword === keyword) {
            order[category] = null;
            dishElement.classList.remove('selected');
        } else {
            const prev = container.querySelector('.dish.selected');
            if (prev) prev.classList.remove('selected');
            dishElement.classList.add('selected');
            order[category] = selectedDish;
        }

        updateUI();
    });

    // 6. Фильтры
    document.querySelectorAll('.filters').forEach(filterBlock => {
        const section = filterBlock.closest('section');
        const container = section?.querySelector('.dishes');
        if (!container) return;

        filterBlock.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                const isAlreadyActive = button.classList.contains('active');
                filterBlock.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                const dishesInContainer = container.querySelectorAll('.dish');

                if (isAlreadyActive) {
                    dishesInContainer.forEach(d => d.style.display = '');
                } else {
                    button.classList.add('active');
                    const targetKind = button.getAttribute('data-kind');
                    dishesInContainer.forEach(d => {
                        d.style.display = (d.getAttribute('data-kind') === targetKind) ? '' : 'none';
                    });
                }
            });
        });
    });

    updateUI();
});

