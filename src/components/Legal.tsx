import Link from "next/link";
import { operator, site } from "@/data/site";
import Logo from "./Logo";

// Обёртка юридических страниц (/privacy, /soglasie). Реквизиты: operator в site.ts.
export default function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="legal">
      <header className="legal-top">
        <Link href="/" aria-label="На главную FOX Car Service"><Logo /></Link>
        <Link className="link" href="/">← На главную</Link>
      </header>
      <article className="legal-body">
        <h1>{title}</h1>
        <p className="muted">Редакция от {operator.updated}</p>
        {children}
        <h2>Оператор персональных данных</h2>
        <p>
          {operator.name}, ИНН {operator.inn}, ОГРНИП {operator.ogrn}.<br />
          Адрес: {operator.address}.<br />
          Телефон: <a href={site.phoneHref}>{site.phone}</a>. Эл. почта: {operator.email}.
        </p>
      </article>
    </div>
  );
}
