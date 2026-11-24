"use client";
// Кнопки мессенджеров и звонка. Ссылки и телефон: src/data/site.ts.
import { useState } from "react";
import { messengers, site } from "@/data/site";

const ic = {
  telegram: "M21.5 4.2 2.9 11.4c-1.3.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.8-1.4-1.5ZM9.6 14.3l8.7-5.5c.4-.3.8-.1.5.2l-7.4 6.7-.3 3.2-1.5-4.6Z",
  whatsapp: "M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.9c-1.5 0-3-.4-4.2-1.1l-.3-.2-2.9.8.8-2.8-.2-.3a8.1 8.1 0 1 1 6.8 3.6Zm4.5-6c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z",
  max: "M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.2A9.5 9.5 0 1 0 12 2.5Zm4.4 13.1h-2V11l-2.4 3.4L9.6 11v4.6h-2V8.4h1.9l2.5 3.6 2.5-3.6h1.9v7.2Z",
  phone: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z",
};
function I({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>;
}

// text: готовое сообщение (подставляется в WhatsApp; в Telegram ссылка на профиль без текста)
export default function Messengers({ text, call = true }: { text?: string; call?: boolean }) {
  const [maxHint, setMaxHint] = useState(false);
  const wa = text ? `${messengers.whatsapp}?text=${encodeURIComponent(text)}` : messengers.whatsapp;

  const maxClick = async (e: React.MouseEvent) => {
    if (messengers.max) return;
    e.preventDefault();
    try { await navigator.clipboard.writeText(site.phone.replace(/[^\d+]/g, "")); } catch { /* без буфера просто покажем номер */ }
    setMaxHint(true);
  };

  return (
    <div className="msg">
      <div className="msg-row">
        <a className="msg-b tg" href={messengers.telegram} target="_blank" rel="noreferrer"><I d={ic.telegram} />Telegram</a>
        <a className="msg-b wa" href={wa} target="_blank" rel="noreferrer"><I d={ic.whatsapp} />WhatsApp</a>
        <a className="msg-b mx" href={messengers.max || "https://max.ru/"} target="_blank" rel="noreferrer" onClick={maxClick}><I d={ic.max} />MAX</a>
        {call && <a className="msg-b call" href={site.phoneHref}><I d={ic.phone} />Позвонить</a>}
      </div>
      {maxHint && <p className="msg-hint" role="status">Номер {site.phone} скопирован. Найдите нас в MAX по этому номеру: Контакты → Поиск по номеру.</p>}
    </div>
  );
}
