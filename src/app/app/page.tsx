import type { Metadata } from "next";
import Booking from "@/components/Booking";

export const metadata: Metadata = {
  title: "Запись в FOX Car Service",
  description: "Внутренний инструмент записи FOX Car Service.",
  // Для сотрудников: с сайта не ссылаемся, в поиск не отдаём.
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return <Booking />;
}
