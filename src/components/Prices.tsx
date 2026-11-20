"use client";
// Услуги на машине: клиент нажимает на узел (двигатель, колесо, подвеска...)
// и видит, что именно чиним и сколько стоит. Точки — из services.ts (pin x/y
// в процентах кадра hero.jpg). Ниже те же узлы вкладками, для телефона и
// клавиатуры. Цены берутся из services.ts с правками демо-админки поверх.
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { rub, zones } from "@/data/services";
import { priceOf, usePrices } from "@/lib/demo";

const icons: Record<string, string> = {
  engine: "M4 10h3l2-3h6l2 3h3v7h-3l-2 2H9l-2-2H4z",
  service: "M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z",
  wheels: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  suspension: "M7 3v4l10 3-10 3 10 3-10 3v2",
  extras: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
};

export default function Prices() {
  const [cur, setCur] = useState(zones[0].id);
  const map = usePrices();
  const z = zones.find((x) => x.id === cur)!;

  return (
    <section className="sec alt" id="uslugi">
      <div className="wrap">
        <p className="eyebrow">Услуги и цены</p>
        <h2>Покажите, <em>что беспокоит</em></h2>
        <p className="lead">Нажмите на узел машины: увидите, что мы там делаем и сколько это стоит. Цены «от», точную сумму мастер называет после осмотра на подъёмнике.</p>

        <div className="car-map">
          <div className="car-col">
          <div className="car">
            <Image src="/photo/hero.jpg" alt="Схема услуг на автомобиле" fill sizes="(max-width: 900px) 100vw, 60vw" />
            <svg className="car-ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx={z.pin.x} cy={z.pin.y} rx="9" ry="13" />
            </svg>
            {zones.map((x) => (
              <button
                key={x.id}
                type="button"
                className={`hot${x.id === cur ? " on" : ""}${x.pin.side === "top" ? " up" : " down"}`}
                style={{ left: `${x.pin.x}%`, top: `${x.pin.y}%` }}
                aria-pressed={x.id === cur}
                onClick={() => setCur(x.id)}
              >
                <i aria-hidden="true" />
                <span>{x.label}</span>
              </button>
            ))}
          </div>
          <div className="tabs" role="tablist" aria-label="Узлы автомобиля">
            {zones.map((x) => (
              <button key={x.id} role="tab" aria-selected={x.id === cur} className={x.id === cur ? "on" : ""} onClick={() => setCur(x.id)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[x.id]} /></svg>
                {x.label}
              </button>
            ))}
          </div>
          </div>

          <div className="svc" aria-live="polite">
            <div className="svc-head">
              <span className="svc-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[z.id]} /></svg></span>
              <h3>{z.title}</h3>
            </div>
            <p className="svc-lead">{z.lead}</p>
            <ul className="svc-list">
              {z.services.map((s) => {
                const p = priceOf(map, z.id, s.name, s.price);
                return (
                  <li key={s.name}>
                    <span>{s.name}</span>
                    <i aria-hidden="true" />
                    <b>{p ? rub(p) : "по запросу"}</b>
                  </li>
                );
              })}
            </ul>
            <Link className="btn" href={`/app?service=${encodeURIComponent(z.services[0].name)}`}>Записаться: {z.label.toLowerCase()}</Link>
          </div>
        </div>

      </div>
    </section>
  );
}
