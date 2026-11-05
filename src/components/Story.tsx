"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { rub, zones, type Zone } from "@/data/services";

const FRAMES = 121;
const LAST = FRAMES - 1;
const STAGE_AT = 0.94; // доля скролла, после которой включается интерактивная сцена
const READY_AT = 0.35; // остальные кадры догружаются в фоне
const CLIPS = ["idle", ...zones.flatMap((z) => [z.clip, `${z.clip}_r`])];

const fade = (p: number, a: number, b: number, c: number, d: number) =>
  Math.max(0, Math.min((p - a) / (b - a), 1, (d - p) / (d - c)));

function Hex() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 20.2 7.2v9.6L12 21.5 3.8 16.8V7.2z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" stroke="none" />
      {on ? <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
    </svg>
  );
}

export default function Story() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fog = useRef<HTMLVideoElement>(null);
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  const beats = useRef<(HTMLDivElement | null)[]>([]);
  const frames = useRef<HTMLImageElement[]>([]);
  const drawn = useRef(-1);
  const shown = useRef(0); // кадр на экране, плавно догоняет цель
  const target = useRef(0);
  const raf = useRef(0);
  const blobs = useRef<Record<string, string>>({});
  const front = useRef(0);
  const current = useRef<Zone | null>(null);
  const busy = useRef(false);
  const stageOn = useRef(false);
  const session = useRef(0); // растёт при выходе из сцены, отменяет всё, что ещё в полёте
  const release = useRef<(() => void) | null>(null);
  const audio = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  const muted = useRef(false);

  const [loaded, setLoaded] = useState(0);
  const [gate, setGate] = useState(true);
  const [stage, setStage] = useState(false);
  const [zone, setZone] = useState<Zone | null>(null);
  const [moving, setMoving] = useState(false);
  const [sound, setSound] = useState(false);

  // Если нужный кадр ещё не загружен, показываем ближайший готовый
  const draw = useCallback((i: number) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    for (let d = 0; d <= LAST; d++) {
      for (const n of [i - d, i + d]) {
        const img = frames.current[n];
        if (img?.complete && img.naturalWidth) {
          if (n !== drawn.current) {
            ctx.drawImage(img, 0, 0, 1280, 720);
            drawn.current = n;
            canvas.current!.dataset.frame = String(n);
          }
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    const dir = innerWidth < 800 ? "s" : "l";
    let done = 0;
    const tick = () => {
      setLoaded(++done / FRAMES);
      draw(Math.round(shown.current));
    };
    frames.current = Array.from({ length: FRAMES }, (_, i) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick;
      img.src = `/media/seq/${dir}/${String(i + 1).padStart(3, "0")}.webp`;
      return img;
    });
    const fallback = setTimeout(() => setLoaded(1), 12000);
    return () => clearTimeout(fallback);
  }, [draw]);

  useEffect(() => {
    if (gate) return;
    (async () => {
      for (const c of CLIPS) {
        try {
          const b = await fetch(`/media/${c}.mp4`).then((r) => r.blob());
          blobs.current[c] = URL.createObjectURL(b);
        } catch {}
      }
    })();
  }, [gate]);

  // Два видео по очереди: новый клип выходит наверх только когда уже играет, без вспышки
  const play = useCallback((name: string, loop = false) => new Promise<void>((resolve) => {
    const mine = session.current;
    const next = (front.current ? vidA : vidB).current;
    const prev = (front.current ? vidB : vidA).current;
    if (!next) return resolve();
    const stall = setTimeout(resolve, 9000);
    const finish = () => { clearTimeout(stall); resolve(); };
    release.current = finish;
    next.loop = loop;
    next.src = blobs.current[name] ?? `/media/${name}.mp4`;
    next.onended = finish;
    next.onerror = finish;
    next.onplaying = () => {
      next.onplaying = null;
      if (mine !== session.current) return;
      next.style.opacity = "1";
      if (prev) { prev.style.opacity = "0"; prev.pause(); }
      front.current = 1 - front.current;
      if (loop) finish();
    };
    next.play().catch(finish);
  }), []);

  const enterStage = useCallback(() => {
    stageOn.current = true;
    setStage(true);
    play("idle", true);
  }, [play]);

  const leaveStage = useCallback(() => {
    stageOn.current = false;
    session.current++;
    busy.current = false;
    current.current = null;
    release.current?.();
    for (const v of [vidA.current, vidB.current]) {
      if (!v) continue;
      v.onplaying = v.onended = v.onerror = null;
      v.pause();
      v.style.opacity = "0";
    }
    setStage(false);
    setZone(null);
    setMoving(false);
  }, []);

  // Скролл задаёт цель, кадры плавно её догоняют, сцена включается только когда проезд закончен
  useEffect(() => {
    const sync = () => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      target.current = Math.min(p / STAGE_AT, 1) * LAST;
      if (fog.current) fog.current.style.opacity = p < 0.006 ? "1" : "0";
      const b = beats.current;
      if (b[0]) b[0].style.opacity = String(1 - Math.min(p / 0.1, 1));
      if (b[1]) b[1].style.opacity = String(fade(p, 0.2, 0.28, 0.42, 0.5));
      if (b[2]) b[2].style.opacity = String(fade(p, 0.58, 0.66, 0.8, 0.88));
      if (audio.current && !muted.current) audio.current.gain.gain.value = 0.8 * (1 - Math.min(p / 0.7, 1)) + 0.04;
      if (stageOn.current && p < STAGE_AT - 0.004) leaveStage();
      if (!raf.current) raf.current = requestAnimationFrame(step);
    };
    const step = () => {
      const diff = target.current - shown.current;
      shown.current = Math.abs(diff) < 0.4 ? target.current : shown.current + diff * 0.22;
      draw(Math.round(shown.current));
      if (!stageOn.current && shown.current >= LAST) enterStage();
      raf.current = shown.current === target.current ? 0 : requestAnimationFrame(step);
    };
    addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    sync();
    return () => {
      removeEventListener("scroll", sync);
      removeEventListener("resize", sync);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [draw, enterStage, leaveStage]);

  useEffect(() => {
    document.documentElement.style.overflow = gate ? "hidden" : "";
  }, [gate]);

  useEffect(() => {
    const onHide = () => {
      const ctx = audio.current?.ctx;
      if (ctx) void (document.hidden ? ctx.suspend() : ctx.resume());
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  const startEngine = async () => {
    setGate(false);
    fog.current?.play().catch(() => {});
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0.8;
      gain.connect(ctx.destination);
      const buf = await ctx.decodeAudioData(await fetch("/media/engine.mp3").then((r) => r.arrayBuffer()));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = Math.max(0, buf.duration - 3);
      src.loopEnd = buf.duration;
      src.connect(gain);
      src.start();
      audio.current = { ctx, gain };
      setSound(true);
    } catch { muted.current = true; }
  };

  const toggleSound = () => {
    if (!audio.current) return;
    muted.current = sound;
    audio.current.gain.gain.value = sound ? 0 : 0.3;
    setSound(!sound);
  };

  const open = useCallback(async (z: Zone | null) => {
    if (busy.current || !stageOn.current || current.current?.id === z?.id) return;
    const mine = session.current;
    busy.current = true;
    setMoving(true);
    setZone(null);
    if (current.current) await play(`${current.current.clip}_r`);
    if (mine !== session.current) return;
    current.current = z;
    await play(z ? z.clip : "idle", !z);
    if (mine !== session.current) return;
    if (z) setZone(z);
    setMoving(false);
    busy.current = false;
  }, [play]);

  const ready = loaded >= READY_AT;

  return (
    <>
      <header className="top">
        <a className="logo" href="#top">{site.brand}<small>{site.brandSub}</small></a>
        <nav>
          <a href="#about">Сервис</a>
          <a href="#prices">Цены</a>
          <a href="#reviews">Отзывы</a>
          <a href="#route">Как доехать</a>
        </nav>
        <button className="icon" onClick={toggleSound} aria-label={sound ? "Выключить звук" : "Включить звук"}>
          <SoundIcon on={sound} />
        </button>
        <a className="tel" href={site.phoneHref}>{site.phone}</a>
      </header>

      {gate && (
        <div className="gate">
          <div className="gate-hex"><Hex /></div>
          <div className="gate-logo">{site.brand}<small>{site.brandSub}</small></div>
          {ready ? (
            <button className="btn" onClick={startEngine}>Запуск</button>
          ) : (
            <div className="bar" role="progressbar" aria-valuenow={Math.round(Math.min(loaded / READY_AT, 1) * 100)}>
              <i style={{ width: `${Math.min(loaded / READY_AT, 1) * 100}%` }} />
            </div>
          )}
        </div>
      )}

      <section className="story" id="top" ref={section}>
        <div className="pin">
          <div className={`media${zone ? " open" : ""}`}>
            <div className="frame">
              <canvas ref={canvas} width={1280} height={720} />
              <video ref={fog} src="/media/fog.mp4" muted loop playsInline autoPlay preload="auto" />
              <video ref={vidA} muted playsInline preload="auto" className="clip" />
              <video ref={vidB} muted playsInline preload="auto" className="clip" />
              {stage && !zone && !moving && zones.map((z) => (
                <button
                  key={z.id}
                  className={`pin-btn ${z.pin.side === "top" ? "up" : "down"}`}
                  style={{ left: `${z.pin.x}%`, top: `${z.pin.y}%` }}
                  onClick={() => open(z)}
                >
                  <Hex /><span>{z.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="beat title" ref={(n) => { beats.current[0] = n; }}>
            <h1>{site.brand}<small>{site.brandSub}</small></h1>
            <p>Автосервис в Лисьем Носу</p>
            <span className="cue">Листайте вниз</span>
          </div>
          <div className="beat side" ref={(n) => { beats.current[1] = n; }}>
            <h2>Ворота открыты каждый день</h2>
            <p>{site.hours.replace("Ежедневно, ", "С ").replace("-", " до ")}</p>
          </div>
          <div className="beat side" ref={(n) => { beats.current[2] = n; }}>
            <h2>Два поста, свой аквабласт</h2>
            <p>Рейтинг {site.rating} на Яндекс Картах, {site.votes} оценок</p>
          </div>

          {stage && (
            <div className="stage-ui">
              {!zone && <p className="hint">{moving ? "Секунду, готовим машину" : "Что беспокоит? Выберите узел"}</p>}
              <div className="rail">
                {zones.map((z) => (
                  <button key={z.id} className={zone?.id === z.id ? "on" : ""} onClick={() => open(z)} disabled={moving}>
                    {z.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {zone && (
            <aside className="panel">
              <button className="close" onClick={() => open(null)} aria-label="Закрыть">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
              <h2>{zone.title}</h2>
              <p>{zone.lead}</p>
              <ul>
                {zone.services.map((s) => (
                  <li key={s.name}><span>{s.name}</span><b>{s.price ? rub(s.price) : "по запросу"}</b></li>
                ))}
              </ul>
              <div className="row">
                <a className="btn" href={site.phoneHref}>Позвонить</a>
                <a className="btn ghost" target="_blank" rel="noreferrer"
                  href={`${site.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Хочу записаться: ${zone.title}`)}`}>WhatsApp</a>
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
