import type { Metadata } from "next";
import Sections from "@/components/Sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Лёгкая главная (11.2026): вместо проезда на 121 кадр и видеосцены.
// Заставка с логотипом, затем разделы. Ролик с BMW M3 и старая сцена удалены 24.11.2026.
export default function Page() {
  return (
    <main>
      <Sections />
    </main>
  );
}
