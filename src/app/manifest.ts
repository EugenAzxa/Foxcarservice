import type { MetadataRoute } from "next";

// Веб-приложение FOX: ставится на телефон и компьютер из браузера (Chrome, Edge, Safari).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "FOX Car Service — запись",
    short_name: "FOX",
    description: "Свободные окна на подъёмниках и запись в автосервис FOX в Лисьем Носу.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#0a0d12",
    theme_color: "#0a0d12",
    lang: "ru",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Записаться", url: "/app" },
      { name: "Позвонить", url: "tel:+79533702010" },
    ],
  };
}
