"use client";
// Услуги на машине: клиент нажимает на узел (двигатель, колёса, подвеска...)
// и видит, что именно чиним и сколько стоит.
// Картинка: public/photo/car-xray.jpg (рентген-схема машины без марки, Higgsfield 24.11.2026),
// точки — из services.ts (pin x/y в % кадра). Рядом те же узлы списком (на телефоне — лентой),
// для клавиатуры и маленьких экранов. Цены из services.ts с правками демо-админки поверх.
import { useState } from "react";
import Book from "./Book";
import { rub, zones } from "@/data/services";
import { priceOf, usePrices } from "@/lib/demo";

const icons: Record<string, string> = {
  engine: "M4 10h3l2-3h6l2 3h3v7h-3l-2 2H9l-2-2H4z",
  service: "M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z",
  wheels: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  suspension: "M7 3v4l10 3-10 3 10 3-10 3v2",
  extras: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
};
const Ic = ({ id }: { id: string }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[id]} /></svg>;

export default function Prices() {
  const [cur, setCur] = useState(zones[0].id);
  const [all, setAll] = useState(false); // на телефоне длинный список свёрнут до 6 строк
  const pick = (id: string) => { setCur(id); setAll(false); };
  const map = usePrices();
  const z = zones.find((x) => x.id === cur)!;

  // минимальная цена узла для подписи в списке
  const from = (id: string) => {
    const zone = zones.find((x) => x.id === id)!;
    const ps = zone.services.map((s) => priceOf(map, zone.id, s.name, s.price)).filter((p): p is number => !!p);
    return ps.length ? rub(Math.min(...ps)) : "по запросу";
  };

  return (
    <section className="sec alt" id="uslugi">
      <div className="wrap">
        <p className="eyebrow">Услуги и цены</p>
        <h2>Покажите, <em>что беспокоит</em></h2>
        <p className="lead">Нажмите на узел машины: увидите, что мы там делаем и сколько это стоит. Цены «от», точную сумму мастер называет после осмотра на подъёмнике.</p>

        <div className="svc-grid">
        <div className="svc-left">
        <div className="xr">
          <picture>
            <source media="(max-width: 760px)" srcSet="/photo/car-xray-760.jpg 760w, /photo/car-xray.jpg 1344w" sizes="100vw" />
            <img className="xr-img" src="/photo/car-xray.jpg" alt="Схема автомобиля: двигатель, подвеска, тормоза, выхлоп" width={1344} height={560} loading="lazy" decoding="async" />
          </picture>
          {zones.map((x, i) => (
            <button
              key={x.id}
              type="button"
              className={`xr-pin${x.id === cur ? " on" : ""}${x.pin.side === "top" ? " up" : " down"}`}
              style={{ left: `${x.pin.x}%`, top: `${x.pin.y}%` }}
              aria-pressed={x.id === cur}
              aria-label={x.label}
              onClick={() => pick(x.id)}
            >
              <i aria-hidden="true">{i + 1}</i>
              <span aria-hidden="true">{x.label}</span>
            </button>
          ))}
        </div>

          <div className="nodes" role="tablist" aria-label="Узлы автомобиля">
            {zones.map((x, i) => (
              <button key={x.id} type="button" role="tab" aria-selected={x.id === cur} className={x.id === cur ? "on" : ""} onClick={() => pick(x.id)}>
                <span className="nodes-n">{i + 1}</span>
                <span className="nodes-ic"><Ic id={x.id} /></span>
                <span className="nodes-t"><b>{x.label}</b><small>{from(x.id)}</small></span>
              </button>
            ))}
          </div>
        </div>

          <div className={`svc${all ? " all" : ""}`} role="tabpanel" aria-live="polite">
            <div className="svc-head">
              <span className="svc-ic"><Ic id={z.id} /></span>
              <h3>{z.title}</h3>
            </div>
            <p className="svc-lead">{z.lead}</p>
            <ul className="svc-list">
              {z.services.map((s, i) => {
                const p = priceOf(map, z.id, s.name, s.price);
                return (
                  <li key={s.name} className={i >= 6 ? "more" : undefined}>
                    <span>{s.name}</span>
                    <b className={p ? "" : "ask"}>{p ? rub(p) : "по запросу"}</b>
                  </li>
                );
              })}
            </ul>
            {z.services.length > 6 && !all && (
              <button type="button" className="svc-all" onClick={() => setAll(true)}>Показать все услуги ({z.services.length})</button>
            )}
            <div className="svc-cta">
              <Book topic={z.title}>Записаться: {z.label.toLowerCase()}</Book>
              <span className="muted">Точную цену назовём после осмотра</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
