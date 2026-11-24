import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";
import { readMin, ruDate, sorted } from "@/data/articles";

export const metadata: Metadata = {
  title: "Статьи об обслуживании автомобиля - FOX Car Service, Лисий Нос",
  description: "Шиномонтаж и хранение шин, тормоза, ТО, подвеска, ГРМ, диагностика: понятные статьи от мастеров автосервиса FOX в Лисьем Носу.",
  alternates: { canonical: "/stati" },
};

export default function Articles() {
  const list = sorted();
  const tags = [...new Set(list.map((a) => a.tag))];
  return (
    <>
      <Header base="/" />
      <main className="sec art-page">
        <div className="wrap">
          <nav className="crumbs" aria-label="Навигация"><Link href="/">Главная</Link> / <span>Статьи</span></nav>
          <h1>Статьи <em>об обслуживании авто</em></h1>
          <p className="lead">Объясняем простыми словами, что происходит с машиной, когда её пора везти в сервис и сколько это стоит в FOX Car Service.</p>
          <ul className="art-tags">{tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="arts">
            {list.map((a) => (
              <Link key={a.slug} className="art-card" href={`/stati/${a.slug}`}>
                <span className="art-tag">{a.tag}</span>
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <span className="art-meta">{ruDate(a.date)} · {readMin(a)} мин</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
