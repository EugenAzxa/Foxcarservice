import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { rub, zones } from "@/data/services";
import OpenNow from "./OpenNow";

const gallery = [
  { src: "/photo/bay.jpg", cap: "Два поста с подъёмниками", wide: true },
  { src: "/photo/tools.jpg", cap: "Инструмент на своих местах" },
  { src: "/photo/equip.jpg", cap: "Аквабласт, балансировка, шиномонтаж" },
  { src: "/photo/lounge.jpg", cap: "Клиентская зона с камерами на посты", wide: true },
];

const perks = [
  ["Видно свою машину", "Камеры с постов выведены в зону ожидания."],
  ["Свой аквабласт", "Очищаем детали на месте, без подрядчиков."],
  ["Запчасти под заказ", "Магазин автотоваров и подбор под вашу машину."],
  ["Удобства", "Wi-Fi, парковка, туалет, можно с собакой."],
  ["Оплата", "Карта, наличные или банковский перевод."],
  ["Любые марки", "Европа, Япония, Корея, Китай, отечественные и гибриды."],
];

const scores = [["Персонал", 55], ["Ремонт", 45], ["Время ожидания", 33], ["Диагностика", 10]] as const;

export default function Sections() {
  return (
    <>
      <section className="sec" id="about">
        <div className="wrap">
          <p className="eyebrow">Сервис</p>
          <h2>Бокс, в который приятно заехать</h2>
          <div className="gallery">
            {gallery.map((g) => (
              <figure key={g.src} className={g.wide ? "wide" : ""}>
                <Image src={g.src} alt={g.cap} width={1200} height={900} sizes="(max-width: 760px) 100vw, 60vw" />
                <figcaption>{g.cap}</figcaption>
              </figure>
            ))}
          </div>
          <div className="perks">
            {perks.map(([t, d]) => (
              <div key={t}><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt" id="prices">
        <div className="wrap">
          <p className="eyebrow">Цены</p>
          <h2>Прайс на работы</h2>
          <div className="price-grid">
            {zones.map((z) => (
              <div className="price-card" key={z.id}>
                <h3>{z.title}</h3>
                <ul>
                  {z.services.map((s) => (
                    <li key={s.name}><span>{s.name}</span><b>{s.price ? rub(s.price) : "по запросу"}</b></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="note">Цены ориентировочные. Итоговую стоимость мастер согласует с вами до начала ремонта.</p>
        </div>
      </section>

      <section className="sec" id="reviews">
        <div className="wrap reviews">
          <div>
            <p className="eyebrow">Яндекс Карты</p>
            <div className="big-rate">{site.rating}</div>
            <p className="muted">{site.votes} оценок, {site.reviews} отзывов. Награда «{site.award}».</p>
            <a className="btn ghost" href={site.orgReviews} target="_blank" rel="noreferrer">Читать отзывы</a>
          </div>
          <ul className="scores">
            {scores.map(([t, n]) => (
              <li key={t}><span>{t}</span><i /><b>100% положительных</b><small>{n} отзывов</small></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec alt" id="route">
        <div className="wrap route">
          <div>
            <p className="eyebrow">Как доехать</p>
            <h2>Лисий Нос, Большой проспект, 10</h2>
            <dl>
              <dt>Адрес</dt><dd>{site.address}</dd>
              <dt>Часы</dt><dd>{site.hours} <OpenNow /></dd>
              <dt>Электричка</dt><dd>{site.station}</dd>
              <dt>Телефон</dt><dd><a href={site.phoneHref}>{site.phone}</a></dd>
            </dl>
            <div className="row">
              <a className="btn" href={site.route} target="_blank" rel="noreferrer">Построить маршрут</a>
              <a className="btn ghost" href={site.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
          <iframe className="map" src={site.mapWidget} title="FOX на карте" loading="lazy" />
        </div>
      </section>

      <footer className="foot">
        <div className="wrap row between">
          <span className="logo">{site.brand}<small>{site.brandSub}</small></span>
          <span className="muted">{site.address}</span>
          <a href={site.phoneHref}>{site.phone}</a>
          <Link className="link" href="/admin">Для сотрудников</Link>
        </div>
      </footer>
    </>
  );
}
