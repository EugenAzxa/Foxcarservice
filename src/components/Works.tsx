"use client";
// Работы из бокса: настоящие фото из галереи сервиса на Яндекс Картах и из отзывов.
// Админ добавляет новые в /admin (демо: хранится в этом браузере).
import { useWorks } from "@/lib/demo";
import { site } from "@/data/site";
import Book from "./Book";

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const short = (d: string) => { const [, m, day] = d.split("-").map(Number); return `${day} ${MONTHS[m - 1]}`; };

export default function Works() {
  const works = useWorks();
  return (
    <section className="sec" id="raboty">
      <div className="wrap">
        <p className="eyebrow">Фото мастеров и клиентов</p>
        <h2>Работы <em>из нашего бокса</em></h2>
        <div className="works">
          {works.map((w) => (
            <article key={w.id} className="work">
              <div className="work-ph"><img src={w.photo} alt={w.title} loading="lazy" /></div>
              <div className="work-b">
                <h3>{w.title}</h3>
                <span className="work-meta">{w.tag ?? [w.car, w.date && short(w.date)].filter(Boolean).join(" · ")}</span>
                {w.text && <p>{w.text}</p>}
              </div>
            </article>
          ))}
        </div>
        <a className="link works-more" href={site.org.replace(/\/$/, "") + "/gallery/"} target="_blank" rel="noreferrer">Все фото сервиса на Яндекс Картах →</a>
        <div className="sec-cta">
          <Book />
          <span className="muted">Покажем, что нашли, прямо на подъёмнике</span>
        </div>
      </div>
    </section>
  );
}
