'use strict';

document.addEventListener('DOMContentLoaded', async () => {

    //Контейнеры
    const categoryContainers = {
        soup:    document.getElementById('soups-container'),
        main:    document.getElementById('mains-container'),
        salad:   document.getElementById('salads-container'),
        drink:   document.getElementById('drinks-container'),
        dessert: document.getElementById('desserts-container')
    };

    //загрузка данных с API 
    let dishes;

    try {
        dishes = await loadDishes();
    } catch (error) {
        showNotification(
            'Не удалось загрузить меню. Проверьте подключение к интернету и обновите страницу.'
        );
        return;
    }

    dishes.sort((a, b) => a.name.localeCompare(b.name));

    dishes.forEach(dish => {
        const container = categoryContainers[dish.category];
        if (!container) return;

        const dishElement = document.createElement('div');
        dishElement.classList.add('dish');
        dishElement.setAttribute('data-dish', dish.keyword);
        dishElement.setAttribute('data-kind', dish.kind);

        dishElement.innerHTML = `
            <img src="${dish.image}" alt="Изображение ${dish.name}">
            <p class="price">${dish.price}₽</p>
            <p class="title">${dish.name}</p>
            <p class="volume">${dish.count}</p>
            <button>Добавить</button>
        `;

        container.appendChild(dishElement);
    });

    //Состояние заказа 
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
        const hasOrder = order.soup || order.main || order.salad || order.drink || order.dessert;

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

    //выбор блюда 
    document.querySelectorAll('.dish button').forEach(button => {
        button.addEventListener('click', e => {
            const dishElement = e.target.closest('.dish');
            const keyword = dishElement.getAttribute('data-dish');
            const selectedDish = dishes.find(d => d.keyword === keyword);

            if (!selectedDish) return;

            const category = selectedDish.category;
            const container = categoryContainers[category];

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

    //ффильтры 
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

    //Уведомления 
    function showNotification(message) {
        const prev = document.querySelector('.notification');
        if (prev) prev.remove();

        const notification = document.createElement('div');
        notification.classList.add('notification');

        const messageP = document.createElement('p');
        messageP.textContent = message;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('notification-btn');
        btn.textContent = 'Окей 👌';

        btn.addEventListener('click', () => {
            notification.remove();
        });

        notification.appendChild(messageP);
        notification.appendChild(btn);
        document.body.appendChild(notification);
    }

    const getOrderError = function() {
        const hasSoup    = Boolean(order.soup);
        const hasMain    = Boolean(order.main);
        const hasSalad   = Boolean(order.salad);
        const hasDrink   = Boolean(order.drink);
        const hasDessert = Boolean(order.dessert);

        if (!hasSoup && !hasMain && !hasSalad && !hasDrink && !hasDessert) {
            return 'Ничего не выбрано. Выберите блюда для заказа';
        }

        const isCombo1 = hasSoup && hasMain && hasSalad && hasDrink;
        const isCombo2 = hasSoup && hasMain && hasDrink && !hasSalad;
        const isCombo3 = hasSoup && hasSalad && hasDrink && !hasMain;
        const isCombo4 = hasMain && hasSalad && hasDrink && !hasSoup;
        const isCombo5 = hasMain && hasDrink && !hasSoup && !hasSalad;

        if (isCombo1 || isCombo2 || isCombo3 || isCombo4 || isCombo5) {
            return null;
        }

        if (hasSoup && !hasMain && !hasSalad) {
            return 'Выберите главное блюдо/салат/стартер';
        }
        if (hasSalad && !hasSoup && !hasMain) {
            return 'Выберите суп или главное блюдо';
        }
        if (!hasSoup && !hasMain && !hasSalad && (hasDrink || hasDessert)) {
            return 'Выберите главное блюдо';
        }
        if (!hasDrink) {
            return 'Выберите напиток';
        }

        return 'Выберите главное блюдо';
    };

    const form = document.querySelector('.order-section form') || document.querySelector('#order form');

    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn) {
            submitBtn.addEventListener('click', e => {
                const error = getOrderError();
                if (error) {
                    e.preventDefault();
                    showNotification(error);
                }
            });
        }

        form.addEventListener('submit', e => {
            e.preventDefault();

            const error = getOrderError();
            if (error) {
                showNotification(error);
                return;
            }

            const formData = new FormData(form);
            if (order.soup)    formData.append('soup',    order.soup.keyword);
            if (order.main)    formData.append('main',    order.main.keyword);
            if (order.salad)   formData.append('salad',   order.salad.keyword);
            if (order.drink)   formData.append('drink',   order.drink.keyword);
            if (order.dessert) formData.append('dessert', order.dessert.keyword);

            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка сервера: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Успех:', data);
                showNotification('Заказ успешно отправлен!');
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showNotification('Не удалось отправить заказ. Попробуйте позже.');
            });
        });
    }

    updateOrderUI();
});
