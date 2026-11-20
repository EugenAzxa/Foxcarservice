"use client";
// Кнопка «Установить приложение». Chrome/Edge/Android дают системное окно
// установки (beforeinstallprompt); на iPhone такого API нет, там подсказка
// «Поделиться → На экран Домой».
import { useEffect, useState } from "react";

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function Install({ className = "btn" }: { className?: string }) {
  const [evt, setEvt] = useState<Prompt | null>(null);
  const [ios, setIos] = useState(false);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (matchMedia("(display-mode: standalone)").matches) setDone(true);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const on = (e: Event) => { e.preventDefault(); setEvt(e as Prompt); };
    const ok = () => setDone(true);
    addEventListener("beforeinstallprompt", on);
    addEventListener("appinstalled", ok);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => { removeEventListener("beforeinstallprompt", on); removeEventListener("appinstalled", ok); };
  }, []);

  if (done) return <span className="installed">Приложение установлено</span>;

  const click = async () => {
    if (evt) {
      await evt.prompt();
      const r = await evt.userChoice;
      if (r.outcome === "accepted") setDone(true);
      setEvt(null);
    } else {
      setHint(true);
    }
  };

  return (
    <span className="install">
      <button type="button" className={className} onClick={click}>Установить приложение</button>
      {hint && (
        <small className="install-hint">
          {ios
            ? "На iPhone: кнопка «Поделиться» внизу Safari, затем «На экран Домой»."
            : "В адресной строке Chrome или Edge нажмите значок установки (монитор со стрелкой) или меню ⋮ → «Установить FOX»."}
        </small>
      )}
    </span>
  );
}
