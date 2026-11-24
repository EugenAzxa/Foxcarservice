"use client";
// Строка «Чем помочь?» на первом экране. Клиент пишет проблему своими словами,
// сразу видит подходящие услуги с ценами (кнопка — заявка на эту услугу) и статьи.
// Если ничего не подошло — отправляет свой текст заявкой. Логика поиска: src/lib/search.ts.
import { useMemo, useState } from "react";
import Link from "next/link";
import { openBooking } from "./Book";
import { SUGGEST, search } from "@/lib/search";
import { rub } from "@/data/services";

export default function HeroSearch() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const hits = useMemo(() => search(q), [q]);
  const t = q.trim();
  const book = (service?: string) => openBooking(service, service ? `${service}${t ? `. ${t}` : ""}` : t);

  return (
    <div className="hs">
      <form className="hs-box" role="search" onSubmit={(e) => { e.preventDefault(); if (hits[0]?.kind === "service") book(hits[0].title); else if (t) book(); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          placeholder="Чем помочь? Например: стучит спереди"
          aria-label="Опишите проблему или услугу"
          enterKeyHint="search"
          autoComplete="off"
        />
        {q && <button type="button" className="hs-x" aria-label="Очистить" onClick={() => setQ("")}>×</button>}
      </form>

      {!t && focus && (
        <div className="hs-sug" aria-label="Частые запросы">
          {SUGGEST.map((s) => <button key={s} type="button" onClick={() => setQ(s)}>{s}</button>)}
        </div>
      )}

      {t && (
        <ul className="hs-res" aria-live="polite">
          {hits.map((h) => h.kind === "service" ? (
            <li key={h.title}>
              <button type="button" className="hs-it" onClick={() => book(h.title)}>
                <span className="hs-t"><b>{h.title}</b><small>{h.sub}</small></span>
                <span className="hs-p">{h.price ? rub(h.price) : "цена после осмотра"}</span>
                <span className="hs-go">Записаться</span>
              </button>
            </li>
          ) : (
            <li key={h.slug}>
              <Link className="hs-it art" href={`/stati/${h.slug}`}>
                <span className="hs-t"><b>{h.title}</b><small>{h.sub}</small></span>
                <span className="hs-go">Читать</span>
              </Link>
            </li>
          ))}
          <li>
            <button type="button" className="hs-it own" onClick={() => book()}>
              <span className="hs-t"><b>{hits.length ? "Не то? Отправьте ваш вопрос мастеру" : "Не нашли? Отправьте вопрос мастеру"}</b><small>«{t}» — перезвоним и подскажем</small></span>
              <span className="hs-go">Отправить</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
