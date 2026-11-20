"use client";
// Клиентское приложение: занятость двух постов на неделю вперёд, запись, «Мои записи».
// ДЕМО: записи хранятся в этом браузере, в сервис они не уходят.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { site } from "@/data/site";
import { zones } from "@/data/services";
import { SLOTS, addBooking, cancelBooking, freePost, iso, isBusy, today, useBookings, useMine, type Booking as B } from "@/lib/demo";
import Install from "./Install";

const WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const MON = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const days = () => Array.from({ length: 7 }, (_, i) => { const d = today(); d.setDate(d.getDate() + i); return d; });
const human = (day: string) => { const d = new Date(`${day}T12:00:00`); return `${WD[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`; };

export default function Booking() {
  const all = useBookings();
  const mine = useMine();
  const [tab, setTab] = useState<"book" | "mine">("book");
  const week = useMemo(days, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [day, setDay] = useState(iso(week[0]));
  const [time, setTime] = useState<string | null>(null);
  const [service, setService] = useState(zones[1].services[0].name);
  const [form, setForm] = useState({ name: "", phone: "", car: "" });
  const [done, setDone] = useState<B | null>(null);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const s = new URLSearchParams(location.search).get("service");
    if (s) setService(s);
    setReady(true);
  }, []);

  const free = (d: string) => SLOTS.filter((t) => freePost(all, d, t)).length;
  const my = all.filter((b) => mine.includes(b.id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;
    const post = freePost(all, day, time);
    if (!post) { setTime(null); return; }
    const id = addBooking({ ...form, service, day, time, post });
    setDone({ ...form, service, day, time, post, id, status: "new" });
    setTime(null);
  };

  // расписание зависит от текущего часа, поэтому рисуется только в браузере
  if (!ready) return <div className="appx"><p className="muted">Загружаем расписание…</p></div>;

  return (
    <div className="appx">
      <header className="appx-top">
        <Link className="logo" href="/">{site.brand}<small>{site.brandSub}</small></Link>
        <a className="tel" href={site.phoneHref}>{site.phone}</a>
      </header>

      <p className="demo-flag">Демо-версия: запись сохраняется только в этом браузере и в сервис не уходит.</p>

      <div className="seg" role="tablist">
        <button role="tab" aria-selected={tab === "book"} className={tab === "book" ? "on" : ""} onClick={() => setTab("book")}>Запись</button>
        <button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>Мои записи{my.length ? ` · ${my.length}` : ""}</button>
      </div>

      {tab === "book" && !done && (
        <>
          <h1 className="appx-h">Выберите день и время</h1>
          <div className="days">
            {week.map((d) => {
              const k = iso(d);
              const n = free(k);
              return (
                <button key={k} className={k === day ? "on" : ""} onClick={() => { setDay(k); setTime(null); }}>
                  <small>{WD[d.getDay()]}</small><b>{d.getDate()}</b><span className={n ? "" : "none"}>{n ? `${n} окон` : "занято"}</span>
                </button>
              );
            })}
          </div>

          <div className="board" aria-label={`Занятость постов, ${human(day)}`}>
            <div className="board-row head"><span />{SLOTS.map((t) => <span key={t}>{t.slice(0, 2)}</span>)}</div>
            {([1, 2] as const).map((p) => (
              <div className="board-row" key={p}>
                <span className="board-name">Пост {p}</span>
                {SLOTS.map((t) => <i key={t} className={isBusy(all, day, t, p) ? "busy" : ""} title={`${t} ${isBusy(all, day, t, p) ? "занято" : "свободно"}`} />)}
              </div>
            ))}
            <p className="board-legend"><i /> свободно <i className="busy" /> занято</p>
          </div>

          <div className="slots">
            {SLOTS.map((t) => {
              const ok = !!freePost(all, day, t);
              return <button key={t} disabled={!ok} className={t === time ? "on" : ""} onClick={() => setTime(t)}>{t}</button>;
            })}
          </div>

          {time && (
            <form className="bk-form" onSubmit={submit}>
              <h2>{human(day)}, {time}</h2>
              <label>Что нужно сделать
                <select value={service} onChange={(e) => setService(e.target.value)}>
                  {zones.map((z) => (
                    <optgroup key={z.id} label={z.title}>
                      {z.services.map((s) => <option key={s.name}>{s.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label>Машина<input required placeholder="Например, Kia Rio 2017" value={form.car} onChange={(e) => setForm({ ...form, car: e.target.value })} /></label>
              <label>Имя<input required autoComplete="given-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Телефон<input required type="tel" autoComplete="tel" placeholder="+7" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <button className="btn" type="submit">Записаться</button>
            </form>
          )}
        </>
      )}

      {tab === "book" && done && (
        <div className="bk-done">
          <h1 className="appx-h">Вы записаны</h1>
          <p><b>{human(done.day)}, {done.time}</b>, пост {done.post}</p>
          <p>{done.service} · {done.car}</p>
          <p className="muted">В рабочей версии мастер перезвонит для подтверждения. Сейчас это демо.</p>
          <div className="row">
            <button className="btn" onClick={() => { setDone(null); setTab("mine"); }}>Мои записи</button>
            <button className="btn ghost" onClick={() => setDone(null)}>Записаться ещё</button>
          </div>
        </div>
      )}

      {tab === "mine" && (
        <div className="mine">
          {my.length === 0 && <p className="muted">Записей пока нет. Выберите время на вкладке «Запись».</p>}
          {my.map((b) => (
            <article key={b.id} className="mine-card">
              <div>
                <b>{human(b.day)}, {b.time}</b>
                <span>{b.service} · {b.car}</span>
                <small className={`st ${b.status}`}>{b.status === "new" ? "Ждёт подтверждения" : b.status === "confirmed" ? "Подтверждено" : "Выполнено"}</small>
              </div>
              <button className="link" onClick={() => cancelBooking(b.id)}>Отменить</button>
            </article>
          ))}
        </div>
      )}

      <footer className="appx-foot">
        <Install className="btn ghost" />
        <span className="muted">{site.address} · {site.hours}</span>
      </footer>
    </div>
  );
}
