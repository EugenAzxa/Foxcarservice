import Image from "next/image";
import Link from "next/link";
import { heroImage, site } from "@/data/site";
import { priceFor, quick, rub } from "@/data/services";
import OpenNow from "./OpenNow";
import Reviews from "./Reviews";
import Prices from "./Prices";
import Works from "./Works";
import Intro from "./Intro";
import Logo from "./Logo";
import Book from "./Book";
import LeadDialog from "./LeadDialog";
import Messengers from "./Messengers";

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
  ["Оставляете заявку", "Оставляете заявку на сайте или пишете нам в мессенджер. Перезваниваем и договариваемся о времени."],
  ["Смотрим на подъёмнике", "Компьютерная диагностика и осмотр. Показываем, что нашли, прямо на машине."],
  ["Согласуем смету", "Делим на «срочно» и «может подождать». Итоговую сумму согласуем до начала работ."],
  ["Ремонтируем и отдаём", "Рассказываем, что сделали, и что стоит посмотреть в следующий визит."],
];

const faq = [
  ["Нужно ли записываться заранее?", "Лучше да: постов всего два. Оставьте заявку на сайте или напишите в Telegram, WhatsApp или MAX, и мы подберём удобное время. Если что-то срочное, позвоните: постараемся принять в тот же день."],
  ["Можно приехать со своими запчастями?", "Обсудите это с мастером при записи. Можем и сами подобрать детали под вашу машину и заказать их в сервис."],
  ["Какая диагностика есть?", "Компьютерная диагностика, осмотр на подъёмнике, эндоскопия двигателя. Стоимость назовём по телефону."],
  ["Как оплатить?", "Картой, наличными или банковским переводом."],
  ["Где подождать, пока делают машину?", "В зоне ожидания: кондиционер, напитки, приставка и экран с камерами постов, чтобы видеть свою машину."],
];

const phoneIc = "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z";

function Cta({ note = "Перезвоним и подберём удобное время" }: { note?: string }) {
  return (
    <div className="sec-cta">
      <Book />
      <span className="muted">{note}</span>
    </div>
  );
}

export default function Sections() {
  return (
    <>
      <Intro />

      <header className="top">
        <a className="top-logo" href="#top" aria-label="FOX Car Service, наверх"><Logo /></a>
        <nav aria-label="Разделы">
          <a href="#uslugi">Услуги</a>
          <a href="#reviews">Отзывы</a>
          <a href="#raboty">Работы</a>
          <a href="#kak">Как работаем</a>
          <a href="#route">Контакты</a>
        </nav>
        <a className="tel" href={site.phoneHref}>{site.phone}</a>
        <a className="tel-ic" href={site.phoneHref} aria-label={`Позвонить ${site.phone}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={phoneIc} /></svg></a>
        <Book className="btn sm top-book" />
      </header>

      <section className="hero" id="top">
        <picture className="hero-img">
          <source media="(max-width: 760px)" srcSet={`${heroImage.mobile.replace(".jpg", "-720.jpg")} 720w, ${heroImage.mobile} 1080w`} sizes="100vw" />
          <source srcSet={`${heroImage.desktop.replace(".jpg", "-1600.jpg")} 1600w, ${heroImage.desktop} 2560w`} sizes="100vw" />
          <img src={heroImage.desktop} alt={heroImage.alt} fetchPriority="high" decoding="async" />
        </picture>
        <div className="wrap hero-in">
          <p className="eyebrow">Автосервис в Лисьем Носу · 2 подъёмника</p>
          <h1>Ремонт и ТО <em>без сюрпризов в&nbsp;счёте</em></h1>
          <p className="lead hero-lead">Показываем поломку прямо на подъёмнике и согласуем смету до начала работ. Двигатель, ходовая, тормоза, ТО, шиномонтаж и аквабласт.</p>
          <ul className="hero-quick" aria-label="Популярные услуги и цены">
            {quick.map((q) => {
              const p = priceFor(q.zone, q.name);
              return (
                <li key={q.label}>
                  <Book topic={q.label} className="hq"><span>{q.label}</span><b>{p ? rub(p) : "по запросу"}</b></Book>
                </li>
              );
            })}
          </ul>
          <div className="row">
            <Book />
            <a className="btn ghost" href={site.phoneHref}>{site.phone}</a>
          </div>
          <ul className="hero-facts">
            <li className="hf-rate">
              <a href={site.orgReviews} target="_blank" rel="noreferrer">
                <b>{site.rating} <span className="stars" aria-label="5 звёзд">★★★★★</span></b>
                <span>{site.votes} оценок на Яндекс Картах</span>
              </a>
            </li>
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
          <Cta />
        </div>
      </section>

      <Works />

      <section className="sec alt" id="kak">
        <div className="wrap">
          <p className="eyebrow">Как работаем</p>
          <h2>Четыре шага <em>от заявки до выдачи</em></h2>
          <ol className="steps">
            {steps.map(([t, d], i) => <li key={t}><span>{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p></li>)}
          </ol>
          <Cta note="Или напишите в Telegram, WhatsApp, MAX" />
        </div>
      </section>

      <section className="sec" id="faq">
        <div className="wrap narrow">
          <p className="eyebrow">Вопросы</p>
          <h2>Частые вопросы</h2>
          <div className="faq">
            {faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
          <Cta note="Остались вопросы? Ответим по телефону или в мессенджере" />
        </div>
      </section>

      <section className="sec alt" id="route">
        <div className="wrap route">
          <div>
            <p className="eyebrow">Контакты</p>
            <h2>Лисий Нос, Большой проспект, 10</h2>
            <dl>
              <dt>Адрес</dt><dd>{site.address}</dd>
              <dt>Часы</dt><dd>{site.hours} <OpenNow /></dd>
              <dt>Электричка</dt><dd>{site.station}</dd>
              <dt>Телефон</dt><dd><a href={site.phoneHref}>{site.phone}</a></dd>
            </dl>
            <div className="row">
              <Book />
              <a className="btn ghost" href={site.route} target="_blank" rel="noreferrer">Построить маршрут</a>
            </div>
            <p className="route-msg muted">Пишите в мессенджер:</p>
            <Messengers call={false} />
          </div>
          <iframe className="map" src={site.mapWidget} title="FOX на карте" loading="lazy" />
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-in">
          <Logo className="foot-logo" />
          <div className="foot-col">
            <span className="muted">{site.address}</span>
            <a href={site.phoneHref}>{site.phone}</a>
          </div>
          <div className="foot-col">
            <Link className="link" href="/privacy">Политика конфиденциальности</Link>
            <Link className="link" href="/soglasie">Согласие на обработку данных</Link>
            <Link className="link" href="/admin">Для сотрудников</Link>
          </div>
        </div>
      </footer>

      <div className="fab">
        <Book className="btn fab-book" />
        <a className="btn fab-call" href={site.phoneHref} aria-label={`Позвонить ${site.phone}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={phoneIc} /></svg></a>
      </div>

      <LeadDialog />
    </>
  );
}
