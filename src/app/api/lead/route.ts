// Заявка с сайта → сообщение в Telegram сервису.
// Нужны переменные окружения в Vercel: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
// (бот от @BotFather, chat_id мастера или группы, куда бот добавлен).
// Пока их нет, отвечаем 503, и окно на сайте предлагает отправить заявку в мессенджер.
// Персональные данные на сервере сайта не сохраняются.

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }

  if (body.hp) return Response.json({ ok: true }); // ловушка для ботов
  const name = clean(body.name, 60);
  const phone = clean(body.phone, 20);
  const car = clean(body.car, 600);
  if (body.agree !== true) return Response.json({ ok: false, error: "consent" }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10) return Response.json({ ok: false, error: "phone" }, { status: 400 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return Response.json({ ok: false, error: "not_configured" }, { status: 503 });

  const time = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Moscow" }).format(new Date());
  const text = `🦊 Заявка с сайта (${time})\nИмя: ${name || "—"}\nТелефон: ${phone}\nАвто / вопрос: ${car || "—"}\nСогласие на обработку ПД: да`;

  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  }).catch(() => null);

  if (!r?.ok) return Response.json({ ok: false, error: "send" }, { status: 502 });
  return Response.json({ ok: true });
}
