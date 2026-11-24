import Link from "next/link";
import { readMin, ruDate, sorted } from "@/data/articles";

// Блок «Полезное» на главной: 3 свежие статьи + ссылка на все (для SEO и доверия).
export default function ArticlesTeaser() {
  const list = sorted().slice(0, 3);
  return (
    <section className="sec" id="stati">
      <div className="wrap">
        <div className="art-head">
          <div>
            <p className="eyebrow">Полезное</p>
            <h2>Статьи <em>от мастеров FOX</em></h2>
          </div>
          <Link className="btn ghost" href="/stati">Все статьи ({sorted().length})</Link>
        </div>
        <div className="arts">
          {list.map((a) => (
            <Link key={a.slug} className="art-card" href={`/stati/${a.slug}`}>
              <span className="art-tag">{a.tag}</span>
              <h3>{a.title}</h3>
              <p>{a.description}</p>
              <span className="art-meta">{ruDate(a.date)} · {readMin(a)} мин</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
