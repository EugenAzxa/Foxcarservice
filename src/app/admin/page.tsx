import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Кабинет сотрудников - FOX Car Service", robots: { index: false } };

const shots = [
  ["/admin-demo/1-raspisanie.png", "Расписание постов и заявки с сайта", 2160, 1350],
  ["/admin-demo/2-ceny.png", "Редактор цен", 2160, 1350],
  ["/admin-demo/3-prilozhenie.png", "Приложение для мастеров с пушами", 2700, 1500],
] as const;

export default function Admin() {
  return (
    <main className="sec admin">
      <div className="wrap">
        <Link className="link" href="/">На главную</Link>
        <p className="eyebrow">Для сотрудников</p>
        <h1>Кабинет в разработке</h1>
        <p className="muted">Так он будет выглядеть. Входа пока нет, все данные на картинках вымышленные.</p>
        {shots.map(([src, cap, w, h]) => (
          <figure key={src}>
            <Image src={src} alt={cap} width={w} height={h} sizes="(max-width: 1212px) 100vw, 1180px" />
            <figcaption>{cap}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
