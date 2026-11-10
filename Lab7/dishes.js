'use strict';

async function loadDishes() {
    // 1. Вставьте сюда ваш Bin ID и Master Key
    const BIN_ID = '6af32cb5ffd5d16053b6eb03';
    const API_KEY = '$2a$10$jy6msl.9.C.u1jePECdfk.SF7hBAmb.ddIbn3PpQpmGiJa1DSAYVq';
    
    const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        const dishes = result.record;

        if (!Array.isArray(dishes)) {
            throw new Error('Данные из JSONBin не являются массивом');
        }

        return dishes;

    } catch (error) {
        console.error('Не удалось загрузить блюда:', error);
        throw error;
    }
}
