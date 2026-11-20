import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import OpenNow from "./OpenNow";
import Reviews from "./Reviews";
import Prices from "./Prices";
import Works from "./Works";
import Install from "./Install";

// Только то, что подтверждено карточкой Яндекса и отзывами клиентов.
const perks = [
  ["Видно свою машину", "Камеры с постов выведены в зону ожидания."],
  ["Свой аквабласт", "Очищаем суппорты и детали на месте, без подрядчиков."],
  ["Запчасти под заказ", "Подбираем под вашу машину и привозим в сервис, ехать в город не нужно."],
  ["Любые марки", "Европа, Япония, Корея, Китай, отечественные и гибриды."],
  ["Удобства", "Wi-Fi, кондиционер, напитки, приставка, парковка. Можно с собакой."],
  ["Оплата", "Карта, наличные или банковский перевод."],
];

const steps = [
  ["Записываетесь", "В приложении видно свободные окна на двух подъёмниках. Или просто позвоните."],
  ["Смотрим на подъёмнике", "Компьютерная диагностика и осмотр. Показываем, что нашли, прямо на машине."],
  ["Согласуем смету", "Делим на «срочно» и «может подождать». Итоговую сумму согласуем до начала работ."],
  ["Ремонтируем и отдаём", "Рассказываем, что сделали, и что стоит посмотреть в следующий визит."],
];

const faq = [
  ["Нужно ли записываться заранее?", "Лучше да: постов всего два, удобное время стоит занять заранее. В приложении видно свободное время. Если что-то срочное, позвоните, постараемся принять в тот же день."],
  ["Можно приехать со своими запчастями?", "Обсудите это с мастером при записи. Можем и сами подобрать детали под вашу машину и заказать их в сервис."],
  ["Какая диагностика есть?", "Компьютерная диагностика, осмотр на подъёмнике, эндоскопия двигателя. Стоимость назовём по телефону."],
  ["Как оплатить?", "Картой, наличными или банковским переводом."],
  ["Где подождать, пока делают машину?", "В зоне ожидания: кондиционер, напитки, приставка и экран с камерами постов, чтобы видеть свою машину."],
];

export default function Sections() {
  return (
    <>
      <header className="top">
        <a className="logo" href="#top" aria-label="FOX Car Service, наверх">
          <svg className="logo-hex" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 20.2 7.2v9.6L12 21.5 3.8 16.8V7.2z" /></svg>
          {site.brand}<small>{site.brandSub}</small>
        </a>
        <nav aria-label="Разделы">
          <a href="#uslugi">Услуги</a>
          <a href="#reviews">Отзывы</a>
          <a href="#raboty">Работы</a>
          <a href="#app">Приложение</a>
          <a href="#route">Контакты</a>
        </nav>
        <a className="tel" href={site.phoneHref}>{site.phone}</a>
        <Link className="btn sm" href="/app">Записаться</Link>
      </header>

      <section className="hero" id="top">
        <Image className="hero-img" src="/photo/hero.jpg" alt="BMW M3 в боксе FOX Car Service" fill priority sizes="100vw" />
        <div className="wrap hero-in">
          <p className="eyebrow">Автосервис в Лисьем Носу · 2 подъёмника</p>
          <h1>Ремонт и ТО <em>без сюрпризов в&nbsp;счёте</em></h1>
          <p className="lead">Показываем поломку прямо на подъёмнике и согласуем смету до начала работ. Двигатель, ходовая, тормоза, ТО, шиномонтаж и аквабласт.</p>
          <div className="row">
            <Link className="btn" href="/app">Выбрать время</Link>
            <a className="btn ghost" href={site.phoneHref}>{site.phone}</a>
          </div>
          <ul className="hero-facts">
            <li><b>{site.rating} ★</b><span>{site.reviews} отзывов на Яндекс Картах</span></li>
            <li><b>10–21</b><span>ежедневно <OpenNow /></span></li>
            <li><b>770 м</b><span>от станции Лисий Нос</span></li>
          </ul>
        </div>
      </section>

      <Reviews />
      <Prices />

      <section className="sec" id="boks">
        <div className="wrap">
          <p className="eyebrow">Бокс</p>
          <h2>Чисто, светло <em>и всё на виду</em></h2>
          <div className="gallery">
            <figure className="wide"><Image src="/photo/bay.jpg" alt="Два поста с подъёмниками" width={1200} height={900} sizes="(max-width: 760px) 100vw, 60vw" /><figcaption>Два поста с подъёмниками</figcaption></figure>
            <figure><Image src="/photo/tools.jpg" alt="Инструмент" width={1200} height={900} sizes="(max-width: 760px) 100vw, 40vw" /><figcaption>Инструмент на своих местах</figcaption></figure>
            <figure><Image src="/photo/equip.jpg" alt="Аквабласт и шиномонтаж" width={1200} height={900} sizes="(max-width: 760px) 100vw, 40vw" /><figcaption>Аквабласт, балансировка, шиномонтаж</figcaption></figure>
            <figure className="wide"><Image src="/photo/lounge.jpg" alt="Зона ожидания" width={1200} height={900} sizes="(max-width: 760px) 100vw, 60vw" /><figcaption>Зона ожидания с камерами на посты</figcaption></figure>
          </div>
          <div className="perks">
            {perks.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </div>
      </section>

      <Works />

      <section className="sec alt" id="kak">
        <div className="wrap">
          <p className="eyebrow">Как работаем</p>
          <h2>Четыре шага <em>от записи до выдачи</em></h2>
          <ol className="steps">
            {steps.map(([t, d], i) => <li key={t}><span>{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="sec app-promo" id="app">
        <div className="wrap app-in">
          <div>
            <p className="eyebrow">Приложение FOX</p>
            <h2>Запись <em>в два касания</em></h2>
            <p className="lead">Свободные окна на обоих подъёмниках, запись на нужное время и список ваших визитов. Ставится на телефон и на компьютер прямо с сайта, без магазинов приложений.</p>
            <div className="row">
              <Install />
              <Link className="btn ghost" href="/app">Открыть в браузере</Link>
            </div>
          </div>
          <div className="phone" aria-hidden="true">
            <div className="phone-scr">
              <b>Свободно завтра</b>
              <div className="phone-grid">
                {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t, i) => (
                  <span key={t} className={[1, 4, 5].includes(i) ? "busy" : ""}>{t}</span>
                ))}
              </div>
              <span className="phone-btn">Записаться на 12:00</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="faq">
        <div className="wrap narrow">
          <p className="eyebrow">Вопросы</p>
          <h2>Частые вопросы</h2>
          <div className="faq">
            {faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
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

      <Link className="fab" href="/app">Записаться</Link>
    </>
  );
}
