import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/Chrome";
import Book from "@/components/Book";
import Messengers from "@/components/Messengers";
import { articles, bySlug, readMin, ruDate, sorted } from "@/data/articles";
import { site } from "@/data/site";

type P = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = bySlug((await params).slug);
  if (!a) return {};
  return {
    title: `${a.title} - FOX Car Service`,
    description: a.description,
    alternates: { canonical: `/stati/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.date },
  };
}

// простая разметка: "## " подзаголовок, "- " пункт списка, пустая строка — абзац
function Body({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list.map((x) => <li key={x}>{x}</li>)}</ul>); list = []; } };
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (l.startsWith("- ")) { list.push(l.slice(2)); continue; }
    flush();
    if (!l) continue;
    if (l.startsWith("## ")) out.push(<h2 key={`h${out.length}`}>{l.slice(3)}</h2>);
    else out.push(<p key={`p${out.length}`}>{l}</p>);
  }
  flush();
  return <>{out}</>;
}

export default async function ArticlePage({ params }: P) {
  const a = bySlug((await params).slug);
  if (!a) notFound();
  const more = sorted().filter((x) => x.slug !== a.slug && x.tag === a.tag).concat(sorted().filter((x) => x.slug !== a.slug && x.tag !== a.tag)).slice(0, 3);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: a.title, description: a.description, datePublished: a.date, inLanguage: "ru",
        author: { "@type": "Organization", name: "FOX Car Service" }, publisher: { "@type": "Organization", name: "FOX Car Service", logo: { "@type": "ImageObject", url: "https://foxcarservice.vercel.app/brand/logo.png" } },
        mainEntityOfPage: `https://foxcarservice.vercel.app/stati/${a.slug}` },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://foxcarservice.vercel.app/" },
        { "@type": "ListItem", position: 2, name: "Статьи", item: "https://foxcarservice.vercel.app/stati" },
        { "@type": "ListItem", position: 3, name: a.title },
      ] },
    ],
  };
  return (
    <>
      <Header base="/" />
      <main className="sec art-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <article className="wrap narrow art">
          <nav className="crumbs" aria-label="Навигация"><Link href="/">Главная</Link> / <Link href="/stati">Статьи</Link> / <span>{a.tag}</span></nav>
          <span className="art-tag">{a.tag}</span>
          <h1>{a.title}</h1>
          <p className="art-meta">{ruDate(a.date)} · {readMin(a)} мин чтения · FOX Car Service, Лисий Нос</p>
          <p className="lead">{a.description}</p>
          <div className="art-body"><Body text={a.body} /></div>

          <aside className="art-cta">
            <h2>Нужна помощь с машиной?</h2>
            <p className="muted">Лисий Нос, Большой просп., 10 · ежедневно 10:00-21:00 · рейтинг {site.rating} на Яндекс Картах</p>
            <div className="row"><Book topic={a.topic ?? a.title} /><a className="btn ghost" href={site.phoneHref}>{site.phone}</a></div>
            <Messengers call={false} />
          </aside>

          <h2 className="art-more-h">Читайте также</h2>
          <div className="arts">
            {more.map((x) => (
              <Link key={x.slug} className="art-card" href={`/stati/${x.slug}`}>
                <span className="art-tag">{x.tag}</span>
                <h3>{x.title}</h3>
                <span className="art-meta">{ruDate(x.date)} · {readMin(x)} мин</span>
              </Link>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
