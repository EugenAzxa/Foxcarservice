// Данные с карточки Яндекс Карт (org 57060239324). Название бренда меняется здесь.
// Телефон, мессенджеры и реквизиты оператора ПД: менять только в этом файле.
export const site = {
  brand: "FOX",
  brandSub: "Car Service",
  title: "FOX Car Service - автосервис в Лисьем Носу",
  phone: "+7 (953) 370-20-10",
  phoneHref: "tel:+79533702010",
  phoneShort: "980-20-10", // короткий номер с плакатов
  address: "Большой просп., 10, посёлок Лисий Нос",
  hours: "Ежедневно, 10:00-21:00",
  open: 10,
  close: 21,
  rating: "5,0",
  votes: 150,
  reviews: 90,
  award: "Хорошее место 2026",
  station: "Станция Лисий Нос - 770 м",
  lat: 60.015161,
  lon: 30.01513,
  org: "https://yandex.ru/maps/org/fox/57060239324/",
  orgReviews: "https://yandex.ru/maps/org/fox/57060239324/reviews/",
  route: "https://yandex.ru/maps/?rtext=~60.015161,30.015130&rtt=auto",
  mapWidget: "https://yandex.ru/map-widget/v1/?ll=30.015130%2C60.015161&oid=57060239324&ol=biz&z=15",
};

// Мессенджеры. Все на номер +7 953 370-20-10.
// max: ссылку вида https://max.ru/u/... берут в приложении MAX (Профиль → Поделиться).
// Пока ссылки нет, кнопка MAX копирует номер и подсказывает найти нас по нему.
export const messengers = {
  telegram: "https://t.me/foxcarservice98",
  whatsapp: "https://wa.me/79533702010",
  max: "",
};

// Иллюстрация первого экрана. Чтобы поменять машину или фото, достаточно
// положить новые файлы и поправить пути здесь (desktop 16:9, mobile 3:4 вертикальный).
export const heroImage = {
  desktop: "/photo/hero-wide.jpg",
  mobile: "/photo/hero-tall.jpg",
  alt: "Бокс FOX Car Service: два поста с подъёмниками",
};

// Оператор персональных данных (152-ФЗ). ЗАПОЛНИТЬ реальными реквизитами клиента.
export const operator = {
  name: "ИП [ФИО владельца]",
  inn: "[ИНН]",
  ogrn: "[ОГРНИП]",
  address: "197755, Санкт-Петербург, пос. Лисий Нос, Большой просп., 10",
  email: "[email для запросов по персональным данным]",
  updated: "24.11.2026",
};
