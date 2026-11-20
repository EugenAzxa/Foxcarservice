"use client";
// Услуги по узлам машины. Цены берутся из services.ts, поверх кладутся правки
// из демо-админки (в этом же браузере), так клиенту видно, что админка работает.
import { useState } from "react";
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
        <h2>Что делаем <em>и сколько это стоит</em></h2>
        <p className="lead">Цены «от»: точную сумму мастер называет после осмотра на подъёмнике, до начала работ.</p>

        <div className="tabs" role="tablist" aria-label="Узлы автомобиля">
          {zones.map((x) => (
            <button key={x.id} role="tab" aria-selected={x.id === cur} className={x.id === cur ? "on" : ""} onClick={() => setCur(x.id)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[x.id]} /></svg>
              {x.label}
            </button>
          ))}
        </div>

        <div className="svc" role="tabpanel">
          <div className="svc-head">
            <h3>{z.title}</h3>
            <p>{z.lead}</p>
            <Link className="btn" href={`/app?service=${encodeURIComponent(z.services[0].name)}`}>Записаться</Link>
          </div>
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
        </div>
      </div>
    </section>
  );
}
