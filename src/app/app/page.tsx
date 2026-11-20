import type { Metadata } from "next";
import Booking from "@/components/Booking";

export const metadata: Metadata = {
  title: "Запись в FOX Car Service",
  description: "Свободные окна на двух подъёмниках и онлайн-запись в автосервис FOX в Лисьем Носу.",
};

export default function AppPage() {
  return <Booking />;
}
