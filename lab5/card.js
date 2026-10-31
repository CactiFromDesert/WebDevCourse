'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const categoryContainers = {
        soup:    document.getElementById('soups-container'),
        main:    document.getElementById('mains-container'),
        salad:   document.getElementById('salads-container'),
        drink:   document.getElementById('drinks-container'),
        dessert: document.getElementById('desserts-container')
    };

    dishes.sort((a, b) => a.name.localeCompare(b.name));

    dishes.forEach(dish => {
        const container = categoryContainers[dish.category];
        if (!container) return;

        const dishElement = document.createElement('div');
        dishElement.classList.add('dish');
        dishElement.setAttribute('data-dish', dish.keyword);
        dishElement.setAttribute('data-kind', dish.kind);   // ← для фильтра

        dishElement.innerHTML = `
            <img src="${dish.image}" alt="Изображение ${dish.name}">
            <p class="price">${dish.price}₽</p>
            <p class="title">${dish.name}</p>
            <p class="volume">${dish.count}</p>
            <button>Добавить</button>
        `;

        container.appendChild(dishElement);
    });

    const order = {
        soup:    null,
        main:    null,
        salad:   null,
        drink:   null,
        dessert: null
    };

    const updateOrderItem = (category, dish, defaultText) => {
        const span = document.getElementById(`order-item-${category}`);
        const hidden = document.getElementById(`hidden-${category}`);
        if (dish) {
            span.textContent = `${dish.name} ${dish.price}₽`;
            if (hidden) hidden.value = dish.keyword;
        } else {
            span.textContent = defaultText;
            if (hidden) hidden.value = '';
        }
    };

    const updateOrderUI = () => {
        const hasOrder = order.soup || order.main || order.salad
                      || order.drink || order.dessert;

        const emptyDiv   = document.getElementById('order-empty');
        const detailsDiv = document.getElementById('order-details');

        if (hasOrder) {
            emptyDiv.style.display = 'none';
            detailsDiv.style.display = 'block';
        } else {
            emptyDiv.style.display = 'block';
            detailsDiv.style.display = 'none';
        }

        updateOrderItem('soup',    order.soup,    'Блюдо не выбрано');
        updateOrderItem('main',    order.main,    'Блюдо не выбрано');
        updateOrderItem('salad',   order.salad,   'Блюдо не выбрано');
        updateOrderItem('drink',   order.drink,   'Напиток не выбран');
        updateOrderItem('dessert', order.dessert, 'Десерт не выбран');

        let total = 0;
        if (order.soup)    total += order.soup.price;
        if (order.main)    total += order.main.price;
        if (order.salad)   total += order.salad.price;
        if (order.drink)   total += order.drink.price;
        if (order.dessert) total += order.dessert.price;

        const totalSpan = document.getElementById('order-item-total');
        if (totalSpan) totalSpan.textContent = `${total}₽`;
    };

    document.querySelectorAll('.dish button').forEach(button => {
        button.addEventListener('click', e => {
            const dishElement = e.target.closest('.dish');
            const keyword = dishElement.getAttribute('data-dish');
            const selectedDish = dishes.find(d => d.keyword === keyword);

            if (!selectedDish) return;

            const category = selectedDish.category;
            const container = categoryContainers[category];

            // повторный клик — снять выбор
            if (order[category] && order[category].keyword === keyword) {
                order[category] = null;
                dishElement.classList.remove('selected');
                updateOrderUI();
                return;
            }

            // снять выделение с предыдущего блюда этой категории
            const prev = container.querySelector('.dish.selected');
            if (prev) prev.classList.remove('selected');

            dishElement.classList.add('selected');
            order[category] = selectedDish;
            updateOrderUI();
        });
    });

    document.querySelectorAll('.filters').forEach(filterBlock => {
        const section = filterBlock.closest('section');
        const container = section.querySelector('.dishes');
        if (!container) return;

        filterBlock.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                const isAlreadyActive = button.classList.contains('active');

                filterBlock.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                const dishesInContainer = container.querySelectorAll('.dish');

                if (isAlreadyActive) {
                    dishesInContainer.forEach(dishEl => {
                        dishEl.style.display = '';
                    });
                } else {
                    button.classList.add('active');
                    const targetKind = button.getAttribute('data-kind');

                    dishesInContainer.forEach(dishEl => {
                        const kind = dishEl.getAttribute('data-kind');
                        dishEl.style.display = (kind === targetKind) ? '' : 'none';
                    });
                }
            });
        });
    });

    updateOrderUI();
});
