"use client";
// Меню на телефоне (details/summary работает и без JS). JS только закрывает его после выбора пункта.
import { useRef } from "react";

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const d = useRef<HTMLDetailsElement>(null);
  return (
    <details className="mnav" ref={d}>
      <summary aria-label="Меню"><i /><i /><i /></summary>
      <nav className="mnav-p" aria-label="Разделы" onClick={(e) => { if ((e.target as HTMLElement).closest("a") && d.current) d.current.open = false; }}>
        {children}
      </nav>
    </details>
  );
}
