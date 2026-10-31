'use strict';

const dishes = [

    {
        keyword: 'gaspacho',
        name: 'Гаспачо',
        price: 195,
        category: 'soup',
        count: '350 г',
        image: 'img/gaspacho.jpg',
        kind: 'veg'
    },
    {
        keyword: 'mushroom_soup',
        name: 'Грибной суп-пюре',
        price: 185,
        category: 'soup',
        count: '330 г',
        image: 'img/mushroom_soup.jpg',
        kind: 'veg'
    },
    {
        keyword: 'norwegian_soup',
        name: 'Норвежский суп',
        price: 270,
        category: 'soup',
        count: '330 г',
        image: 'img/norwegian_soup.jpg',
        kind: 'fish'
    },
    {
        keyword: 'ramen',
        name: 'Рамен',
        price: 375,
        category: 'soup',
        count: '425 г',
        image: 'img/ramen.jpg',
        kind: 'meat'
    },
    {
        keyword: 'tomyum',
        name: 'Том ям с креветками',
        price: 650,
        category: 'soup',
        count: '500 г',
        image: 'img/tomyum.jpg',
        kind: 'fish'
    },
    {
        keyword: 'chicken_soup',
        name: 'Куриный суп',
        price: 330,
        category: 'soup',
        count: '350 г',
        image: 'img/chicken_soup.jpg',
        kind: 'meat'
    },

    {
        keyword: 'friedpotatoes',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'main',
        count: '250 г',
        image: 'img/friedpotatoes.jpg',
        kind: 'veg'
    },
    {
        keyword: 'lasagna',
        name: 'Лазанья',
        price: 385,
        category: 'main',
        count: '310 г',
        image: 'img/lasagna.jpg',
        kind: 'meat'
    },
    {
        keyword: 'chickencutlets',
        name: 'Котлеты из курицы с картофельным пюре',
        price: 225,
        category: 'main',
        count: '280 г',
        image: 'img/chickencutlets.jpg',
        kind: 'meat'
    },
    {
        keyword: 'fishcutlet',
        name: 'Рыбная котлета с рисом и спаржей',
        price: 320,
        category: 'main',
        count: '270 г',
        image: 'img/fishcutlet.jpg',
        kind: 'fish'
    },
    {
        keyword: 'pizza_margarita',
        name: 'Пицца Маргарита',
        price: 450,
        category: 'main',
        count: '470 г',
        image: 'img/pizza_margarita.jpg',
        kind: 'veg'
    },
    {
        keyword: 'shrimp_pasta',
        name: 'Паста с креветками',
        price: 340,
        category: 'main',
        count: '280 г',
        image: 'img/shrimp_pasta.jpg',
        kind: 'fish'
    },

    {
        keyword: 'korean_salad',
        name: 'Корейский салат с овощами и яйцом',
        price: 330,
        category: 'salad',
        count: '250 г',
        image: 'img/korean_salad.jpg',
        kind: 'veg'
    },
    {
        keyword: 'caesar_chicken',
        name: 'Цезарь с цыпленком',
        price: 370,
        category: 'salad',
        count: '220 г',
        image: 'img/caesar_chicken.jpg',
        kind: 'meat'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе с моцареллой',
        price: 350,
        category: 'salad',
        count: '235 г',
        image: 'img/caprese.jpg',
        kind: 'veg'
    },
    {
        keyword: 'tuna_salad',
        name: 'Салат с тунцом',
        price: 480,
        category: 'salad',
        count: '250 г',
        image: 'img/tuna_salad.jpg',
        kind: 'fish'
    },
    {
        keyword: 'tofu_salad',
        name: 'Салат с тофу',
        price: 290,
        category: 'salad',
        count: '210 г',
        image: 'img/tofu_salad.jpg',
        kind: 'veg'
    },
    {
        keyword: 'vegetable_salad',
        name: 'Овощной салат',
        price: 240,
        category: 'salad',
        count: '200 г',
        image: 'img/vegetable_salad.jpg',
        kind: 'veg'
    },

    {
        keyword: 'orange_juice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drink',
        count: '300 мл',
        image: 'img/orange_juice.jpg',
        kind: 'cold'
    },
    {
        keyword: 'apple_juice',
        name: 'Яблочный сок',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'img/apple_juice.jpg',
        kind: 'cold'
    },
    {
        keyword: 'carrot_juice',
        name: 'Морковный сок',
        price: 110,
        category: 'drink',
        count: '300 мл',
        image: 'img/carrot_juice.jpg',
        kind: 'cold'
    },
    {
        keyword: 'cappuccino',
        name: 'Капучино',
        price: 180,
        category: 'drink',
        count: '300 мл',
        image: 'img/cappuccino.jpg',
        kind: 'hot'
    },
    {
        keyword: 'green_tea',
        name: 'Зеленый чай',
        price: 100,
        category: 'drink',
        count: '300 мл',
        image: 'img/green_tea.jpg',
        kind: 'hot'
    },
    {
        keyword: 'black_tea',
        name: 'Черный чай',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'img/black_tea.jpg',
        kind: 'hot'
    },

    {
        keyword: 'baklava',
        name: 'Пахлава',
        price: 220,
        category: 'dessert',
        count: '110 г',
        image: 'img/baklava.jpg',
        kind: 'small'
    },
    {
        keyword: 'cheesecake',
        name: 'Чизкейк',
        price: 260,
        category: 'dessert',
        count: '150 г',
        image: 'img/cheesecake.jpg',
        kind: 'medium'
    },
    {
        keyword: 'chocolate_cake',
        name: 'Шоколадный торт',
        price: 270,
        category: 'dessert',
        count: '270 г',
        image: 'img/chocolate_cake.jpg',
        kind: 'large'
    },
    {
        keyword: 'chocolate_mousse',
        name: 'Шоколадный мусс',
        price: 190,
        category: 'dessert',
        count: '100 г',
        image: 'img/chocolate_mousse.jpg',
        kind: 'small'
    },
    {
        keyword: 'donuts',
        name: 'Пончики',
        price: 180,
        category: 'dessert',
        count: '120 г',
        image: 'img/donuts.jpg',
        kind: 'small'
    },
    {
        keyword: 'honey_cake',
        name: 'Медовик',
        price: 250,
        category: 'dessert',
        count: '160 г',
        image: 'img/honey_cake.jpg',
        kind: 'medium'
    }
];
