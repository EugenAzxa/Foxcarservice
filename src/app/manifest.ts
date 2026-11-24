import type { MetadataRoute } from "next";

// Сайт FOX можно добавить на экран телефона из браузера. Открывается главная.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FOX Car Service",
    short_name: "FOX",
    description: "Автосервис FOX в Лисьем Носу: ремонт, ТО, шиномонтаж. Запись по заявке и в мессенджерах.",
    start_url: "/",
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
    shortcuts: [{ name: "Позвонить", url: "tel:+79533702010" }],
  };
}
