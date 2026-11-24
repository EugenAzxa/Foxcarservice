"use client";
// Кнопка «Записаться»: открывает окно заявки (LeadDialog) где угодно на сайте.
// Без JS работает как ссылка на блок контактов (#route).
export const BOOK_EVENT = "fox:book";

export function openBooking(topic?: string) {
  window.dispatchEvent(new CustomEvent(BOOK_EVENT, { detail: { topic } }));
}

export default function Book({ topic, className = "btn", children = "Записаться" }: { topic?: string; className?: string; children?: React.ReactNode }) {
  return (
    <a
      className={className}
      href="#route"
      onClick={(e) => { e.preventDefault(); openBooking(topic); }}
    >
      {children}
    </a>
  );
}
