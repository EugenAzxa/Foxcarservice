import type { Metadata } from "next";
import Booking from "@/components/Booking";

export const metadata: Metadata = {
  title: "Запись в FOX Car Service",
  description: "Внутренний инструмент записи FOX Car Service.",
  // Демо приложения для клиентов (ссылка со страницы /prilozhenie). В поиск не отдаём.
  robots: { index: false, follow: false }, // демо; на главной слотов нет
};

export default function AppPage() {
  return <Booking />;
}
