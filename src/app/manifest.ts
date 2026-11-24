import type { MetadataRoute } from "next";

// Приложение FOX (PWA): ставится на телефон из браузера и открывает /app (демо записи).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "FOX Car Service — запись",
    short_name: "FOX",
    description: "Запись в автосервис FOX, свои визиты и уведомления о готовности машины.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "ru",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [{ name: "Мои записи", url: "/app" }, { name: "Позвонить", url: "tel:+79533702010" }],
  };
}
