"use client";
// Работы из бокса. Админ добавляет их в /admin (демо: хранится в этом браузере).
import { useWorks } from "@/lib/demo";

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const short = (d: string) => { const [, m, day] = d.split("-").map(Number); return `${day} ${MONTHS[m - 1]}`; };

export default function Works() {
  const works = useWorks();
  return (
    <section className="sec" id="raboty">
      <div className="wrap">
        <p className="eyebrow">Работы</p>
        <h2>Свежее <em>из нашего бокса</em></h2>
        <div className="works">
          {works.map((w) => (
            <article key={w.id} className="work">
              <img src={w.photo} alt={w.title} loading="lazy" />
              <div>
                <span className="work-meta">{w.car} · {short(w.date)}</span>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
