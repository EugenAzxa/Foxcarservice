// Поиск «Чем помочь?» на первом экране: клиент пишет своими словами
// («стучит спереди», «скрипят тормоза», «переобуться»), получает услуги с ценами и статьи.
// Без сервера: небольшой словарь симптомов + совпадение по началу слов.
import { articles } from "@/data/articles";
import { zones } from "@/data/services";

export type Hit =
  | { kind: "service"; title: string; sub: string; price?: number; zone: string; score: number }
  | { kind: "article"; title: string; sub: string; slug: string; score: number };

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
// грубый «стеммер»: первые 4–5 букв слова, чтобы «стучит/стук/стучать» совпадали
const stem = (w: string) => (w.length <= 4 ? w : w.slice(0, Math.max(4, Math.min(6, w.length - 2))));
const words = (s: string) => norm(s).split(" ").filter((w) => w.length > 1);

// Симптомы и разговорные слова → услуги (точные названия из services.ts) и статьи
const SYMPTOMS: { keys: string[]; services: string[]; articles?: string[] }[] = [
  { keys: ["стук", "стучит", "гремит", "кочк", "яма", "ямы", "ямк", "подвеск", "ходов", "шаров", "сайлент", "стойк", "стабилиз", "амортиз", "раскачив", "пробива"], services: ["Ремонт ходовой части", "Замена амортизаторов", "Ремонт шаровых опор"], articles: ["stuk-v-podveske"] },
  { keys: ["тормоз", "колодк", "скрип", "скрежет", "пищ", "свист", "вибрац", "бьет", "биен", "уводит", "педал", "суппорт"], services: ["Замена тормозных дисков, колодок", "Ремонт тормозной системы", "Проточка тормозных дисков"], articles: ["priznaki-iznosa-tormoznyh-kolodok", "pritirka-novyh-tormoznyh-kolodok"] },
  { keys: ["масл", "то", "техобслуж", "обслуживан", "фильтр", "свеч", "жидкост", "регламент", "плановое"], services: ["Замена масла в двигателе", "Полное сервисное обслуживание", "Замена воздушного фильтра", "Замена свечей зажигания", "Замена масла в коробке"], articles: ["kak-chasto-menyat-maslo-v-dvigatele", "chto-vhodit-v-planovoe-to"] },
  { keys: ["шин", "резин", "переобу", "переобуть", "шиномонтаж", "балансир", "зимн", "летн", "сезон", "шип"], services: ["Шиномонтаж легковой, 4 колеса", "Шиномонтаж кроссовер / внедорожник, 4 колеса", "Хранение колёс, комплект на 6 мес."], articles: ["skolko-stoit-shinomontazh-lisiy-nos", "kogda-menyat-rezinu-na-zimnyuyu-spb"] },
  { keys: ["прокол", "гвозд", "самор", "спуст", "спускает", "дырк", "грыж", "порез", "боков"], services: ["Ремонт прокола жгутом"], articles: ["remont-prokola-i-gryzhi-shiny"] },
  { keys: ["хранен", "хранить", "сдать"], services: ["Хранение колёс, комплект на 6 мес."], articles: ["hranenie-shin-i-koles"] },
  { keys: ["диск", "литой", "литые", "рихтов", "прокатк", "погнул", "восьмерк"], services: ["Прокатка, рихтовка литых дисков"] },
  { keys: ["двигател", "мотор", "троит", "дым", "дымит", "глохнет", "check", "чек", "ошибк", "лампа", "горит", "компресси", "расход"], services: ["Ремонт двигателя", "Эндоскопия двигателя", "Ремонт и чистка форсунок"], articles: ["kompyuternaya-diagnostika-avto", "endoskopiya-dvigatelya"] },
  { keys: ["диагност", "провер", "осмотр", "покупк", "подбор", "эндоскоп"], services: ["Эндоскопия двигателя", "Ремонт ходовой части"], articles: ["kompyuternaya-diagnostika-avto", "endoskopiya-dvigatelya"] },
  { keys: ["грм", "ремен", "ремень", "цеп", "цепь"], services: ["Замена ГРМ", "Замена сервисного ремня"], articles: ["zamena-remnya-grm"] },
  { keys: ["перегрев", "антифриз", "тосол", "охлажд", "печк", "радиатор", "помп", "течет", "течь"], services: ["Ремонт системы охлаждения"] },
  { keys: ["заводит", "заводится", "стартер", "генератор", "аккумул", "зарядк", "села", "сел"], services: ["Ремонт стартеров и генераторов"], articles: ["podgotovka-avto-k-zime"] },
  { keys: ["турбин", "турбо", "свистит", "наддув"], services: ["Ремонт турбокомпрессора"] },
  { keys: ["форсунк", "топлив", "бензин", "дизел", "солярк"], services: ["Ремонт и чистка форсунок", "Ремонт топливной системы"] },
  { keys: ["руль", "рулев", "гур", "люфт", "тяжело крутить"], services: ["Ремонт гидроусилителя руля", "Ремонт ходовой части"] },
  { keys: ["сцеплен", "педаль сцепления", "буксует"], services: ["Ремонт сцепления"] },
  { keys: ["выхлоп", "глушител", "катализат", "гудит", "ревет"], services: ["Ремонт выхлопной системы"] },
  { keys: ["аквабласт", "ржав", "коррози", "очистк", "чистк"], services: ["Аквабластинг деталей"], articles: ["akvablasting-supportov"] },
  { keys: ["запчаст", "детал", "заказ"], services: ["Запчасти и комплектующие под заказ"] },
  { keys: ["зим", "мороз", "подготов"], services: ["Шиномонтаж легковой, 4 колеса", "Полное сервисное обслуживание"], articles: ["podgotovka-avto-k-zime"] },
  { keys: ["раскокс", "кокс", "жрет масло", "ест масло"], services: ["Раскоксовка", "Эндоскопия двигателя"] },
  { keys: ["гбц", "головк", "прокладк"], services: ["Ремонт ГБЦ"] },
];

const allServices = zones.flatMap((z) => z.services.map((s) => ({ ...s, zone: z.id, zoneTitle: z.title })));
const svc = (name: string) => allServices.find((s) => s.name === name);

export const SUGGEST = ["Стучит подвеска", "Скрипят тормоза", "Замена масла", "Переобуться", "Горит check engine", "Прокол колеса"];

export function search(q: string): Hit[] {
  const ws = words(q);
  if (!ws.length) return [];
  const stems = ws.map(stem);
  const has = (key: string) => {
    const k = norm(key);
    if (k.includes(" ")) return norm(q).includes(k);
    if (k.length <= 3) return ws.includes(k); // «то», «грм», «гур» — только целым словом
    return stems.some((s) => s.length >= 3 && (k.startsWith(s) || s.startsWith(k)));
  };
  const scores = new Map<string, number>();
  const art = new Map<string, number>();
  const add = (m: Map<string, number>, k: string, v: number) => m.set(k, (m.get(k) ?? 0) + v);

  // 1) словарь симптомов
  for (const sy of SYMPTOMS) {
    const n = sy.keys.filter(has).length;
    if (!n) continue;
    sy.services.forEach((s, i) => add(scores, s, n * 3 - i * 0.3));
    sy.articles?.forEach((a, i) => add(art, a, n * 2 - i * 0.3));
  }
  // 2) прямое совпадение со словами в названии услуги и узла
  for (const s of allServices) {
    const t = words(`${s.name} ${s.zoneTitle}`).map(stem);
    const n = stems.filter((x) => x.length >= 3 && t.some((y) => y.length >= 3 && (y.startsWith(x) || x.startsWith(y)))).length;
    if (n) add(scores, s.name, n * 2);
  }
  // 3) статьи по заголовку
  for (const a of articles) {
    const t = words(`${a.title} ${a.tag}`).map(stem);
    const n = stems.filter((x) => x.length >= 3 && t.some((y) => y.length >= 3 && (y.startsWith(x) || x.startsWith(y)))).length;
    if (n) add(art, a.slug, n * 1.5);
  }

  const out: Hit[] = [];
  for (const [name, score] of [...scores].sort((a, b) => b[1] - a[1]).slice(0, 4)) {
    const s = svc(name);
    if (s) out.push({ kind: "service", title: s.name, sub: s.zoneTitle, price: s.price, zone: s.zone, score });
  }
  for (const [slug, score] of [...art].sort((a, b) => b[1] - a[1]).slice(0, 2)) {
    const a = articles.find((x) => x.slug === slug);
    if (a) out.push({ kind: "article", title: a.title, sub: `Статья · ${a.tag}`, slug, score });
  }
  return out;
}
