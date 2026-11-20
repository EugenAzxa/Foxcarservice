"use client";
// Заставка первого экрана: короткий ролик «разбитая машина заезжает → ремонт →
// блестит» поверх картинки героя. Играет при каждом открытии страницы, потом растворяется
// в ту же картинку (последний кадр ролика = hero.jpg), и проявляется логотип.
// Ролик не грузится при «уменьшить движение» и в режиме экономии трафика,
// на узком экране берётся лёгкая версия. Кнопка «Пропустить» всегда есть.
import { useEffect, useRef, useState } from "react";

type Conn = { saveData?: boolean; effectiveType?: string };

export default function HeroIntro() {
  const vid = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: Conn }).connection;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slow = conn?.saveData || /2g/.test(conn?.effectiveType ?? "");
    if (still || slow) { setPhase("done"); return; }
    setSrc(innerWidth < 760 ? "/media/intro-s.mp4" : "/media/intro.mp4");
  }, []);

  const finish = () => setPhase("done");

  useEffect(() => {
    const v = vid.current;
    if (!v || !src) return;
    v.play().then(() => setPhase("play")).catch(finish);
    // страховка: если ролик завис на загрузке, не держим посетителя
    const t = setTimeout(() => { if (v.readyState < 3) finish(); }, 2500);
    return () => clearTimeout(t);
  }, [src]);

  return (
    <>
      {src && (
        <div className={`intro ${phase}`} aria-hidden="true">
          <video ref={vid} src={src} muted playsInline preload="auto" onEnded={finish} onError={finish} />
        </div>
      )}
      {phase === "play" && (
        <button type="button" className="intro-skip" onClick={finish}>Пропустить</button>
      )}
      <div className={`hero-logo ${phase === "done" ? "in" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 2.5 20.2 7.2v9.6L12 21.5 3.8 16.8V7.2z" /></svg>
        <span>FOX<small>Car Service</small></span>
      </div>
    </>
  );
}
