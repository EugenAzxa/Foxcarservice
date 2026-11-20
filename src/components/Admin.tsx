"use client";
// Кабинет сервиса, ДЕМО. Пароль виден на экране входа: это показ, а не защита.
// Все правки живут в этом браузере (localStorage) и сразу видны на сайте в нём же.
import { useEffect, useState } from "react";
import Link from "next/link";
import { rub, zones } from "@/data/services";
import {
  SLOTS, addWork, getPrices, priceKey, priceOf, removeWork, resetDemo, resetPrices, setPrice, setStatus,
  usePrices, useBookings, useWorks, type Booking,
} from "@/lib/demo";

const DEMO_PASS = "fox2026";
const MON = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const short = (d: string) => { const [, m, day] = d.split("-").map(Number); return `${day} ${MON[m - 1]}`; };
const ST: Record<Booking["status"], string> = { new: "Новая", confirmed: "Подтверждена", done: "Готово" };

/* Фото уменьшаем в браузере до 1000 px, чтобы влезло в localStorage */
function shrink(file: File): Promise<string> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL("image/jpeg", 0.72));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = fail;
    img.src = URL.createObjectURL(file);
  });
}

function Login({ onIn }: { onIn: () => void }) {
  const [p, setP] = useState("");
  const [err, setErr] = useState(false);
  return (
    <main className="adm-login">
      <form onSubmit={(e) => { e.preventDefault(); if (p === DEMO_PASS) { sessionStorage.setItem("fox.admin", "1"); onIn(); } else setErr(true); }}>
        <span className="logo">FOX<small>Кабинет сервиса</small></span>
        <label>Пароль<input type="password" value={p} onChange={(e) => { setP(e.target.value); setErr(false); }} autoFocus /></label>
        {err && <p className="err">Неверный пароль</p>}
        <button className="btn" type="submit">Войти</button>
        <p className="demo-flag">Демо-вход. Пароль: <b>{DEMO_PASS}</b></p>
        <Link className="link" href="/">На сайт</Link>
      </form>
    </main>
  );
}

function Schedule() {
  const all = useBookings();
  const days = [...new Set(all.map((b) => b.day))].sort();
  const counts = { new: all.filter((b) => b.status === "new").length, confirmed: all.filter((b) => b.status === "confirmed").length };
  return (
    <>
      <div className="adm-stats">
        <div><b>{all.length}</b><span>записей всего</span></div>
        <div><b>{counts.new}</b><span>ждут подтверждения</span></div>
        <div><b>{counts.confirmed}</b><span>подтверждены</span></div>
        <div><b>2</b><span>поста</span></div>
      </div>
      {days.map((d) => (
        <section key={d} className="adm-card">
          <h3>{short(d)}</h3>
          <div className="adm-board">
            <div className="adm-hours"><span />{SLOTS.map((t) => <span key={t}>{t.slice(0, 2)}</span>)}</div>
            {([1, 2] as const).map((p) => (
              <div className="adm-lane" key={p}>
                <span>Пост {p}</span>
                <div className="adm-track">
                  {all.filter((b) => b.day === d && b.post === p).map((b) => (
                    <div key={b.id} className={`adm-job ${b.status}`} style={{ left: `${(SLOTS.indexOf(b.time) / SLOTS.length) * 100}%`, width: `${100 / SLOTS.length}%` }} title={`${b.time} ${b.car}`}>
                      <small>{b.time}</small><b>{b.car}</b>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ul className="adm-list">
            {all.filter((b) => b.day === d).sort((a, b) => a.time.localeCompare(b.time)).map((b) => (
              <li key={b.id}>
                <div><b>{b.time} · {b.name}</b><span>{b.car} · {b.service}</span><a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}>{b.phone}</a></div>
                <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value as Booking["status"])} className={`st ${b.status}`}>
                  {Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Prices() {
  const map = usePrices();
  const [saved, setSaved] = useState("");
  return (
    <>
      <p className="muted">Измените цену и уйдите из поля: она сразу поменяется на сайте в этом браузере. Пустое поле значит «по запросу».</p>
      {zones.map((z) => (
        <section key={z.id} className="adm-card">
          <h3>{z.title}</h3>
          <ul className="adm-prices">
            {z.services.map((s) => {
              const k = priceKey(z.id, s.name);
              const v = priceOf(map, z.id, s.name, s.price);
              return (
                <li key={k}>
                  <span>{s.name}</span>
                  <label>
                    от
                    <input
                      inputMode="numeric"
                      defaultValue={v ?? ""}
                      key={`${k}-${v}`}
                      onBlur={(e) => {
                        const n = e.target.value.replace(/\D/g, "");
                        const next = n ? Number(n) : null;
                        if ((next ?? undefined) === v) return;
                        setPrice(k, next);
                        setSaved(`${s.name}: ${next ? rub(next) : "по запросу"}`);
                      }}
                    />
                    ₽
                  </label>
                  {k in getPrices() && <small className="changed">изменено</small>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <div className="row">
        <button className="btn ghost" onClick={() => { resetPrices(); setSaved("Цены сброшены к исходным"); }}>Вернуть исходные цены</button>
        {saved && <span className="saved">Сохранено: {saved}</span>}
      </div>
    </>
  );
}

function Works() {
  const works = useWorks();
  const [f, setF] = useState({ title: "", car: "", text: "", photo: "" });
  const [busy, setBusy] = useState(false);
  return (
    <>
      <form className="adm-card adm-form" onSubmit={(e) => { e.preventDefault(); if (!f.photo) return; addWork(f); setF({ title: "", car: "", text: "", photo: "" }); }}>
        <h3>Новая работа</h3>
        <label>Фото
          <input type="file" accept="image/*" required onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try { setF((x) => ({ ...x, photo: "" })); const url = await shrink(file); setF((x) => ({ ...x, photo: url })); } finally { setBusy(false); }
          }} />
        </label>
        {f.photo && <img className="adm-prev" src={f.photo} alt="" />}
        <label>Что сделали<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Замена ГРМ" /></label>
        <label>Машина<input required value={f.car} onChange={(e) => setF({ ...f, car: e.target.value })} placeholder="Skoda Octavia 1.8" /></label>
        <label>Пара слов<textarea rows={3} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="С чем приехали и что нашли" /></label>
        <button className="btn" type="submit" disabled={busy || !f.photo}>{busy ? "Обрабатываем фото…" : "Опубликовать на сайте"}</button>
      </form>
      <div className="adm-works">
        {works.map((w) => (
          <article key={w.id} className="adm-card">
            <img src={w.photo} alt="" />
            <b>{w.title}</b>
            <span className="muted">{w.car} · {short(w.date)}</span>
            <button className="link" onClick={() => removeWork(w.id)}>Убрать с сайта</button>
          </article>
        ))}
      </div>
    </>
  );
}

const TABS = [["schedule", "Записи"], ["prices", "Цены"], ["works", "Работы"]] as const;

export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("schedule");
  useEffect(() => { setOk(sessionStorage.getItem("fox.admin") === "1"); }, []);

  if (ok === null) return null;
  if (!ok) return <Login onIn={() => setOk(true)} />;

  return (
    <div className="adm">
      <aside className="adm-side">
        <span className="logo">FOX<small>Кабинет сервиса</small></span>
        <nav>
          {TABS.map(([k, v]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{v}</button>)}
        </nav>
        <div className="adm-foot">
          <Link className="link" href="/" target="_blank">Открыть сайт</Link>
          <button className="link" onClick={() => { if (confirm("Сбросить демо-данные к исходным?")) resetDemo(); }}>Сбросить демо</button>
          <button className="link" onClick={() => { sessionStorage.removeItem("fox.admin"); setOk(false); }}>Выйти</button>
        </div>
      </aside>
      <main className="adm-main">
        <p className="demo-flag">Демо: данные хранятся в этом браузере. Изменения видны на сайте, открытом здесь же.</p>
        <h1>{TABS.find(([k]) => k === tab)![1]}</h1>
        {tab === "schedule" && <Schedule />}
        {tab === "prices" && <Prices />}
        {tab === "works" && <Works />}
      </main>
    </div>
  );
}
