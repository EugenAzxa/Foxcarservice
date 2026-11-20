"use client";
// Бегущая лента отзывов в два ряда навстречу друг другу.
// Двигается только transform (дёшево для телефона), ряды вне экрана на паузе,
// при «уменьшить движение» ряды просто листаются пальцем.
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { aspects, reviewPhotos, reviews, type Review } from "@/data/reviews";

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const ruDate = (d: string) => { const [y, m, day] = d.split("-").map(Number); return `${day} ${MONTHS[m - 1]} ${y}`; };
const letter = (n: string) => (n.match(/\p{L}/u)?.[0] ?? "F").toUpperCase();
function Star() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" /></svg>;
}

function Card({ r, i, onOpen, copy }: { r: Review; i: number; onOpen: (r: Review) => void; copy?: boolean }) {
  const ph = reviewPhotos[r.n];
  const long = r.t.length > (ph ? 120 : 230);
  return (
    <article className="rv has-ph">
      {ph ? (
        <figure className="rv-img">
          <img src={`/reviews/${ph}.jpg`} alt="" loading="lazy" />
          <figcaption>Фото клиента</figcaption>
        </figure>
      ) : (
        <div className="rv-img rv-np" aria-hidden="true">
          <span className="rv-hex">{site.rating}</span>
          <small>оценка на Яндекс Картах</small>
        </div>
      )}
      <div className="rv-h">
        <span className={`rv-av c${i % 4}`} aria-hidden="true">{letter(r.n)}</span>
        <div className="rv-who"><b>{r.n}</b><time dateTime={r.d}>{ruDate(r.d)}</time></div>
        <span className="rv-s" aria-label="Оценка 5 из 5">5,0<Star /></span>
      </div>
      <p className="rv-t">{r.t}</p>
      <div className="rv-f">
        {long && <button type="button" className="rv-more" tabIndex={copy ? -1 : undefined} onClick={() => onOpen(r)}>Читать полностью</button>}
        <span className="rv-src">Яндекс Карты</span>
      </div>
    </article>
  );
}

function Row({ items, reverse, onOpen, offset }: { items: Review[]; reverse?: boolean; onOpen: (r: Review) => void; offset: number }) {
  const row = useRef<HTMLDivElement>(null);
  const [off, setOff] = useState(false);
  const [dur, setDur] = useState(220);

  useEffect(() => {
    const el = row.current!;
    const io = new IntersectionObserver(([e]) => setOff(!e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    const fit = () => {
      const half = (el.firstElementChild as HTMLElement).scrollWidth / 2;
      setDur(Math.round(half / (innerWidth < 640 ? 26 : 34)));
    };
    fit();
    addEventListener("resize", fit, { passive: true });
    return () => { io.disconnect(); removeEventListener("resize", fit); };
  }, []);

  const build = (copy: boolean) =>
    items.map((r, k) => <Card key={`r${k}`} r={r} i={k + offset} onOpen={onOpen} copy={copy} />);

  return (
    <div className={`mq-row${reverse ? " rev" : ""}${off ? " off" : ""}`} ref={row}>
      <div className="mq-track" style={{ "--dur": `${dur}s` } as React.CSSProperties}>
        {build(false)}
        {/* копия ряда для бесшовной петли: не читается и не берёт фокус, но кликается */}
        <div className="mq-copy" aria-hidden="true">{build(true)}</div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const [open, setOpen] = useState<Review | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dlg.current?.showModal();
    else dlg.current?.close();
  }, [open]);

  const a = reviews.filter((_, i) => i % 2 === 0);
  const b = reviews.filter((_, i) => i % 2 === 1);

  return (
    <section className="sec revs" id="reviews">
      <div className="wrap revs-head">
        <div>
          <p className="eyebrow">Отзывы с Яндекс Карт</p>
          <h2>Что говорят <em>те, кто уже заезжал</em></h2>
          <ul className="aspects">
            {aspects.map((x) => <li key={x.name}><b>{x.name}</b> 100% положительных · {x.count}</li>)}
          </ul>
        </div>
        <div className="revs-side">
          <a className="rt" href={site.orgReviews} target="_blank" rel="noreferrer">
            <span className="rt-n">{site.rating}</span>
            <span className="rt-t">
              <span className="rt-st" aria-hidden="true"><Star /><Star /><Star /><Star /><Star /></span>
              <b>{site.votes} оценок · {site.reviews} отзывов</b>
              Награда «{site.award}»
            </span>
          </a>
          <a className="link" href={site.orgReviews} target="_blank" rel="noreferrer">Все отзывы на Яндекс Картах →</a>
        </div>
      </div>

      <div className="mq">
        <Row items={a} onOpen={setOpen} offset={0} />
        <Row items={b} reverse onOpen={setOpen} offset={1} />
      </div>

      <dialog
        ref={dlg}
        className="rv-dialog"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) setOpen(null);
        }}
      >
        {open && (
          <>
            <button type="button" className="rv-x" aria-label="Закрыть" onClick={() => setOpen(null)}>×</button>
            <div className="rv-h">
              <span className="rv-av c0" aria-hidden="true">{letter(open.n)}</span>
              <div className="rv-who"><b>{open.n}</b><time dateTime={open.d}>{ruDate(open.d)}</time></div>
            </div>
            {reviewPhotos[open.n] && <img className="rv-full-ph" src={`/reviews/${reviewPhotos[open.n]}.jpg`} alt="Фото клиента" />}
            <p className="rv-full">{open.t}</p>
            <a className="link" href={site.orgReviews} target="_blank" rel="noreferrer">Открыть на Яндекс Картах →</a>
          </>
        )}
      </dialog>
    </section>
  );
}
