'use strict';

function getOrderError(order) {
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

    if (hasSoup && !hasMain && !hasSalad) return 'Выберите главное блюдо/салат/стартер';
    if (hasSalad && !hasSoup && !hasMain) return 'Выберите суп или главное блюдо';
    if (!hasSoup && !hasMain && !hasSalad && (hasDrink || hasDessert)) return 'Выберите главное блюдо';
    if (!hasDrink) return 'Выберите напиток';

    return 'Выберите главное блюдо';
}
