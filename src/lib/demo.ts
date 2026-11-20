"use client";
// ДЕМО-хранилище. Настоящей базы нет: всё живёт в localStorage этого браузера.
// Сделано, чтобы показать клиенту, как работают админка, запись и «Мои записи».
// Когда понадобится рабочая версия, эти функции заменяются запросами к API.
import { useEffect, useState } from "react";
import { zones } from "@/data/services";

export type Work = { id: string; title: string; car: string; text: string; photo: string; date: string; tag?: string };
export type Booking = {
  id: string; name: string; phone: string; car: string; service: string;
  day: string; time: string; post: 1 | 2; status: "new" | "confirmed" | "done"; demo?: boolean;
};

const K = { prices: "fox.prices", works: "fox.works2", bookings: "fox.bookings", mine: "fox.mine" };
const EVT = "fox-demo";

// Настоящие работы: фото из галереи карточки FOX на Яндекс Картах и из отзывов клиентов
// (скачаны 20.11.2026 с согласия пользователя, исходники в Материалы/). Подписи только по тому,
// что видно на фото. Админ может добавить свои работы сверху (демо, в этом браузере).
const DEMO_WORKS: Work[] = [
  { id: "y1", title: "Суппорты до и после аквабласта", car: "", tag: "Аквабласт деталей", text: "", photo: "/works/supporty-akvablast.jpg", date: "" },
  { id: "y2", title: "Головка блока и привод ГРМ на разборке", car: "", tag: "Ремонт двигателя", text: "", photo: "/works/dvigatel-gbc-grm.jpg", date: "" },
  { id: "y3", title: "Двигатель с коробкой снят в сборе", car: "", tag: "Ремонт двигателя", text: "", photo: "/works/dvigatel-v-sbore.jpg", date: "" },
  { id: "y4", title: "Volkswagen Scirocco: блок цилиндров и ГБЦ", car: "", tag: "Ремонт двигателя", text: "", photo: "/works/scirocco-blok-gbc.jpg", date: "" },
  { id: "y5", title: "Впускной коллектор и клапанная крышка после аквабласта", car: "", tag: "Аквабласт деталей · фото клиента", text: "", photo: "/works/kollektor-akvablast.jpg", date: "" },
  { id: "y6", title: "Замена мотора", car: "", tag: "Ремонт двигателя · фото клиента", text: "", photo: "/works/zamena-motora.jpg", date: "" },
  { id: "y7", title: "Mercedes-AMG в боксе", car: "", tag: "Обслуживание", text: "", photo: "/works/mercedes-amg.jpg", date: "" },
  { id: "y8", title: "Новое сцепление, заказанное через сервис", car: "", tag: "Запчасти под заказ · фото клиента", text: "", photo: "/works/sceplenie.jpg", date: "" },
];

export const today = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const plus = (n: number) => { const d = today(); d.setDate(d.getDate() + n); return iso(d); };

const demoBookings = (): Booking[] => [
  { id: "b1", name: "Андрей", phone: "+7 (900) 000-00-01", car: "Toyota Camry", service: "Замена масла в двигателе", day: plus(1), time: "11:00", post: 1, status: "confirmed", demo: true },
  { id: "b2", name: "Ольга", phone: "+7 (900) 000-00-02", car: "Hyundai Solaris", service: "Шиномонтаж", day: plus(2), time: "15:00", post: 2, status: "new", demo: true },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* квота или приватный режим */ }
  window.dispatchEvent(new Event(EVT));
}

/* Подписка на изменения: админка в одной вкладке, сайт в другой. */
function useStored<T>(get: () => T, initial: T): T {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    const sync = () => setV(get());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

/* Цены: правки админа поверх src/data/services.ts. Ключ «зона/услуга». */
export type PriceMap = Record<string, number | null>;
export const priceKey = (zone: string, name: string) => `${zone}/${name}`;
export const getPrices = () => read<PriceMap>(K.prices, {});
export const setPrice = (key: string, value: number | null) => write(K.prices, { ...getPrices(), [key]: value });
export const resetPrices = () => write(K.prices, {});
export const usePrices = () => useStored(getPrices, {});
export const priceOf = (map: PriceMap, zone: string, name: string, base?: number) => {
  const k = priceKey(zone, name);
  return k in map ? map[k] ?? undefined : base;
};
export const allServices = zones.flatMap((z) => z.services.map((s) => ({ zone: z.id, zoneTitle: z.title, ...s })));

/* Работы */
export const getWorks = () => read<Work[]>(K.works, DEMO_WORKS);
export const addWork = (w: Omit<Work, "id" | "date">) =>
  write(K.works, [{ ...w, id: `w${Date.now()}`, date: iso(today()) }, ...getWorks()]);
export const removeWork = (id: string) => write(K.works, getWorks().filter((w) => w.id !== id));
export const useWorks = () => useStored(getWorks, DEMO_WORKS);

/* Записи */
export const getBookings = () => read<Booking[] | null>(K.bookings, null) ?? demoBookings();
export const useBookings = () => useStored(getBookings, [] as Booking[]);
export const addBooking = (b: Omit<Booking, "id" | "status">) => {
  const id = `b${Date.now()}`;
  write(K.bookings, [...getBookings(), { ...b, id, status: "new" }]);
  write(K.mine, [...read<string[]>(K.mine, []), id]);
  return id;
};
export const setStatus = (id: string, status: Booking["status"]) =>
  write(K.bookings, getBookings().map((b) => (b.id === id ? { ...b, status } : b)));
export const cancelBooking = (id: string) => {
  write(K.bookings, getBookings().filter((b) => b.id !== id));
  write(K.mine, read<string[]>(K.mine, []).filter((x) => x !== id));
};
export const useMine = () => useStored(() => read<string[]>(K.mine, []), [] as string[]);
export const resetDemo = () => {
  try { Object.values(K).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVT));
};

/* Расписание: 2 подъёмника, слоты по часу с открытия до закрытия.
   Кроме настоящих (демо) записей занята часть слотов «псевдослучайно»,
   чтобы календарь выглядел живым; для одного дня картина всегда одинаковая. */
export const SLOTS = Array.from({ length: 11 }, (_, i) => `${String(10 + i).padStart(2, "0")}:00`);
function filler(day: string, time: string, post: number) {
  let h = 0;
  for (const c of `${day}${time}${post}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 100 < 34;
}
export function isBusy(bookings: Booking[], day: string, time: string, post: 1 | 2) {
  if (bookings.some((b) => b.day === day && b.time === time && b.post === post)) return true;
  if (day === iso(today()) && Number(time.slice(0, 2)) <= today().getHours()) return true;
  return filler(day, time, post);
}
export function freePost(bookings: Booking[], day: string, time: string): 1 | 2 | null {
  if (!isBusy(bookings, day, time, 1)) return 1;
  if (!isBusy(bookings, day, time, 2)) return 2;
  return null;
}
