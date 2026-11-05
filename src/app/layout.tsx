import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

const body = Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-body" });
const display = Unbounded({ subsets: ["cyrillic", "latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: site.title,
  description: "Ремонт двигателя, подвески, ТО, шиномонтаж и аквабласт. Лисий Нос, ежедневно 10:00-21:00. Рейтинг 5,0 на Яндекс Картах.",
};
export const viewport: Viewport = { themeColor: "#0a0d12" };

const ld = {
  "@context": "https://schema.org", "@type": "AutoRepair", name: "FOX Car Service", telephone: "+79533702010",
  address: { "@type": "PostalAddress", streetAddress: "Большой просп., 10", addressLocality: "посёлок Лисий Нос", addressCountry: "RU" },
  geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lon },
  openingHours: "Mo-Su 10:00-21:00",
  aggregateRating: { "@type": "AggregateRating", ratingValue: 5, ratingCount: site.votes },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${body.variable} ${display.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        {children}
      </body>
    </html>
  );
}
