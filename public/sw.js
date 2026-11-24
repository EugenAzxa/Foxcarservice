// Service worker FOX: нужен для установки приложения и чтобы /app открывалось без сети
// (показываем последнюю сохранённую версию). Страницы берём из сети, кэш только запасной.
const CACHE = "fox-v2";
const SHELL = ["/app", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.mode === "navigate" || req.destination === "style" || req.destination === "script")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/app"))),
  );
});

// клик по уведомлению открывает приложение
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const w = list.find((c) => new URL(c.url).pathname.startsWith("/app"));
      return w ? w.focus() : self.clients.openWindow("/app");
    }),
  );
});
