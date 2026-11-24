import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

// Montserrat: тот же шрифт, что на плакатах и прайсах FOX (жирные заголовки капсом).
const font = Montserrat({ subsets: ["cyrillic", "latin"], variable: "--font-main", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://foxcarservice.vercel.app"),
  title: site.title,
  description: "Ремонт двигателя, подвески, ТО, шиномонтаж и аквабласт. Лисий Нос, ежедневно 10:00-21:00. Рейтинг 5,0 на Яндекс Картах.",
};
export const viewport: Viewport = { themeColor: "#0a0a0a" };

const ld = {
  "@context": "https://schema.org", "@type": "AutoRepair", name: "FOX Car Service", telephone: "+79533702010", logo: "https://foxcarservice.vercel.app/brand/logo.png", image: "https://foxcarservice.vercel.app/photo/hero-wide.jpg",
  address: { "@type": "PostalAddress", streetAddress: "Большой просп., 10", addressLocality: "посёлок Лисий Нос", addressCountry: "RU" },
  geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lon },
  openingHours: "Mo-Su 10:00-21:00",
  aggregateRating: { "@type": "AggregateRating", ratingValue: 5, ratingCount: site.votes },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={font.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        {children}
      </body>
    </html>
  );
}
