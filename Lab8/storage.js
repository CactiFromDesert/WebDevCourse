'use strict';

const ORDER_STORAGE_KEY = 'food-construct-order';

function getStoredOrder() {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return { soup: null, main: null, salad: null, drink: null, dessert: null };
    try {
        return JSON.parse(raw);
    } catch {
        return { soup: null, main: null, salad: null, drink: null, dessert: null };
    }
}

function saveOrder(order) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
}

function clearOrder() {
    localStorage.removeItem(ORDER_STORAGE_KEY);
}
