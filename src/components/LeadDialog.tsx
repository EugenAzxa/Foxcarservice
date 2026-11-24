"use client";
// Окно заявки: имя, телефон, авто / что беспокоит + обязательное согласие на
// обработку ПД (152-ФЗ, по умолчанию не отмечено). Плюс мессенджеры и звонок.
// Заявка уходит в /api/lead (Telegram-бот сервиса). Если бот ещё не подключён,
// показываем кнопки отправить ту же заявку в WhatsApp / Telegram.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BOOK_EVENT } from "./Book";
import Messengers from "./Messengers";

type State = "form" | "sending" | "sent" | "manual";

export default function LeadDialog() {
  const dlg = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>("form");
  const [f, setF] = useState({ name: "", phone: "", car: "", agree: false, hp: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    const open = (e: Event) => {
      const { topic, text } = (e as CustomEvent<{ topic?: string; text?: string }>).detail ?? {};
      setState((s) => (s === "sending" ? s : "form"));
      setErr("");
      if (text) setF((x) => ({ ...x, car: text }));
      else if (topic) setF((x) => ({ ...x, car: x.car ? x.car : `${topic}: ` }));
      dlg.current?.showModal();
    };
    addEventListener(BOOK_EVENT, open);
    return () => removeEventListener(BOOK_EVENT, open);
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const text = `Здравствуйте! Хочу записаться в FOX Car Service.\nИмя: ${f.name}\nТелефон: ${f.phone}${f.car ? `\nАвто / вопрос: ${f.car}` : ""}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.phone.replace(/\D/g, "").length < 10) { setErr("Проверьте номер телефона"); return; }
    if (!f.agree) { setErr("Нужно согласие на обработку персональных данных"); return; }
    setState("sending");
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      setState(r.ok ? "sent" : "manual");
    } catch {
      setState("manual");
    }
  };

  const close = () => dlg.current?.close();

  return (
    <dialog ref={dlg} className="lead-dlg" aria-labelledby="lead-h" onClick={(e) => {
        if (e.target !== e.currentTarget) return; // клики по полям и кнопкам внутри
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
      }}>
      <button type="button" className="rv-x" onClick={close} aria-label="Закрыть">×</button>

      {state === "sent" ? (
        <div className="lead-done">
          <h2 id="lead-h">Заявка принята</h2>
          <p className="muted">Перезвоним в рабочее время (ежедневно 10:00-21:00) и подберём удобное время. Если срочно, позвоните или напишите нам.</p>
          <Messengers />
          <button type="button" className="btn ghost" onClick={close}>Закрыть</button>
        </div>
      ) : state === "manual" ? (
        <div className="lead-done">
          <h2 id="lead-h">Почти готово</h2>
          <p className="muted">Не получилось отправить заявку с сайта. Отправьте её в WhatsApp (текст уже заполнен), напишите в Telegram или MAX, или просто позвоните.</p>
          <Messengers text={text} />
          <button type="button" className="link" onClick={() => setState("form")}>Вернуться к форме</button>
        </div>
      ) : (
        <>
          <h2 id="lead-h">Запись в FOX</h2>
          <p className="muted lead-sub">Оставьте заявку: перезвоним и подберём время. Или напишите сразу в мессенджер.</p>
          <Messengers />
          <div className="lead-or"><span>или заявка</span></div>
          <form className="lead-form" onSubmit={submit} noValidate>
            <label>Имя<input name="name" autoComplete="given-name" value={f.name} onChange={set("name")} required maxLength={60} /></label>
            <label>Телефон<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7" value={f.phone} onChange={set("phone")} required maxLength={20} /></label>
            <label>Авто и что беспокоит<textarea name="car" rows={3} placeholder="Например: Kia Rio 2017, стучит спереди справа" value={f.car} onChange={set("car")} maxLength={600} /></label>
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} aria-hidden="true" />
            <label className="check">
              <input type="checkbox" name="agree" checked={f.agree} onChange={set("agree")} required />
              <span>Даю <Link href="/soglasie" target="_blank">согласие на обработку персональных данных</Link> и принимаю <Link href="/privacy" target="_blank">политику конфиденциальности</Link></span>
            </label>
            {err && <p className="err" role="alert">{err}</p>}
            <button className="btn" type="submit" disabled={!f.agree || state === "sending"}>{state === "sending" ? "Отправляем…" : "Отправить заявку"}</button>
          </form>
        </>
      )}
    </dialog>
  );
}
