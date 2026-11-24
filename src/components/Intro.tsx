"use client";
// Заставка при открытии сайта: анимация логотипа FOX (~3 с).
// Вся анимация на CSS (globals.css, блок «Заставка»), поэтому она рисуется
// сразу с сервера и сама исчезает, даже если JS не загрузился.
// JS нужен только для «Пропустить» и чтобы убрать заставку из DOM.
// При «уменьшить движение» заставка не показывается (CSS).
import { useEffect, useState } from "react";
import Logo from "./Logo";

const SPARKS = 10;

export default function Intro() {
  const [state, setState] = useState<"play" | "skip" | "gone">("play");

  useEffect(() => {
    const root = document.documentElement;
    delete root.dataset.intro;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setState("gone"); return; }
    root.style.overflow = "hidden";
    const t = setTimeout(() => setState("gone"), 3400);
    return () => { clearTimeout(t); root.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (state === "play") return;
    const root = document.documentElement;
    if (state === "skip") root.dataset.intro = "skip"; // текст первого экрана появляется сразу
    root.style.overflow = "";
    if (state === "skip") { const t = setTimeout(() => setState("gone"), 350); return () => clearTimeout(t); }
  }, [state]);

  if (state === "gone") return null;

  return (
    <div className={`splash${state === "skip" ? " out" : ""}`}>
      <div className="splash-glow" aria-hidden="true" />
      <div className="splash-stage" aria-hidden="true">
        <div className="splash-streak" />
        <Logo className="splash-logo" shine />
        <div className="splash-sparks">
          {Array.from({ length: SPARKS }, (_, i) => (
            <b key={i} style={{ "--a": `${(360 / SPARKS) * i + 12}deg`, "--d": `${70 + (i % 3) * 35}px` } as React.CSSProperties} />
          ))}
        </div>
        <p className="splash-tag">Автосервис · Лисий Нос</p>
      </div>
      <button type="button" className="intro-skip" onClick={() => setState("skip")}>Пропустить</button>
    </div>
  );
}
