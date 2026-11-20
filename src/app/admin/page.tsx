import type { Metadata } from "next";
import Admin from "@/components/Admin";

export const metadata: Metadata = { title: "Кабинет сервиса - FOX Car Service", robots: { index: false } };

export default function AdminPage() {
  return <Admin />;
}
