'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const categoryContainers = {
        soup:  document.querySelector('#soups-container'),
        main:  document.querySelector('#mains-container'),
        drink: document.querySelector('#drinks-container')
    };

    dishes.sort((a, b) => a.name.localeCompare(b.name));

    dishes.forEach(dish => {
        const container = categoryContainers[dish.category];
        if (!container) return;

        const dishElement = document.createElement('div');
        dishElement.classList.add('dish');
        dishElement.setAttribute('data-dish', dish.keyword);

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
        soup:  null,
        main:  null,
        drink: null
    };

    const updateOrderItem = (category, dish, defaultText) => {
        const span   = document.querySelector(`#order-item-${category}`);
        const hidden = document.querySelector(`#hidden-${category}`);
        if (dish) {
            span.textContent = `${dish.name} ${dish.price}₽`;
            hidden.value = dish.keyword;
        } else {
            span.textContent = defaultText;
            hidden.value = '';
        }
    };

    const updateOrderUI = () => {
        const hasOrder = order.soup || order.main || order.drink;

        const emptyDiv   = document.querySelector('#order-empty');
        const detailsDiv = document.querySelector('#order-details');

        if (hasOrder) {
            emptyDiv.style.display = 'none';
            detailsDiv.style.display = 'block';
        } else {
            emptyDiv.style.display = 'block';
            detailsDiv.style.display = 'none';
        }

        updateOrderItem('soup',  order.soup,  'Блюдо не выбрано');
        updateOrderItem('main',  order.main,  'Блюдо не выбрано');
        updateOrderItem('drink', order.drink, 'Напиток не выбран');

        let total = 0;
        if (order.soup)  total += order.soup.price;
        if (order.main)  total += order.main.price;
        if (order.drink) total += order.drink.price;

        document.querySelector('#order-item-total').textContent = `${total}₽`;
    };

    document.querySelectorAll('.dish button').forEach(button => {
    button.addEventListener('click', (e) => {
        const dishElement  = e.target.closest('.dish');
        const keyword      = dishElement.getAttribute('data-dish');
        const selectedDish = dishes.find(d => d.keyword === keyword);

        if (!selectedDish) return;

        const category = selectedDish.category;
        const container = categoryContainers[category];

        // Если это блюдо УЖЕ выбрано — снимаем выбор
        if (order[category] && order[category].keyword === keyword) {
            order[category] = null;
            dishElement.classList.remove('selected');
            updateOrderUI();
            return;
        }

        const prev = container.querySelector('.dish.selected');
        if (prev) prev.classList.remove('selected');

        dishElement.classList.add('selected');
        order[category] = selectedDish;

        updateOrderUI();
    });
});

    updateOrderUI();
});
