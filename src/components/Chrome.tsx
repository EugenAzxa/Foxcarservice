// Общие шапка, подвал и плавающая кнопка записи для главной и внутренних страниц.
// base = "" на главной (якоря #uslugi), "/" на внутренних (ссылки /#uslugi).
import Link from "next/link";
import { site } from "@/data/site";
import Logo from "./Logo";
import Book from "./Book";
import LeadDialog from "./LeadDialog";
import MobileNav from "./MobileNav";

const phoneIc = "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z";

function NavLinks({ base }: { base: string }) {
  return (
    <>
      <a href={`${base}#uslugi`}>Услуги и цены</a>
      <a href={`${base}#reviews`}>Отзывы</a>
      <a href={`${base}#raboty`}>Работы</a>
      <Link href="/stati">Статьи</Link>
      <Link href="/prilozhenie" className="nav-app">Приложение</Link>
      <a href={`${base}#route`}>Контакты</a>
    </>
  );
}

export function Header({ base = "" }: { base?: string }) {
  return (
    <header className="top">
      <a className="top-logo" href={base ? "/" : "#top"} aria-label="FOX Car Service, на главную"><Logo /></a>
      <nav aria-label="Разделы"><NavLinks base={base} /></nav>
      <a className="tel" href={site.phoneHref}>{site.phone}</a>
      <a className="tel-ic" href={site.phoneHref} aria-label={`Позвонить ${site.phone}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={phoneIc} /></svg></a>
      <Book className="btn sm top-book" />
      <MobileNav><NavLinks base={base} /></MobileNav>
    </header>
  );
}

export function Footer() {
  return (
    <>
      <footer className="foot">
        <div className="wrap foot-in">
          <Link href="/" aria-label="FOX Car Service, на главную"><Logo className="foot-logo" /></Link>
          <div className="foot-col">
            <span className="muted">{site.address}</span>
            <a href={site.phoneHref}>{site.phone}</a>
          </div>
          <div className="foot-col">
            <Link className="link" href="/stati">Статьи об обслуживании авто</Link>
            <Link className="link" href="/prilozhenie">Приложение FOX (демо)</Link>
            <Link className="link" href="/privacy">Политика конфиденциальности</Link>
            <Link className="link" href="/soglasie">Согласие на обработку данных</Link>
            <Link className="link" href="/admin">Для сотрудников</Link>
          </div>
        </div>
      </footer>

      <div className="fab">
        <Book className="btn fab-book" />
        <a className="btn fab-call" href={site.phoneHref} aria-label={`Позвонить ${site.phone}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={phoneIc} /></svg></a>
      </div>

      <LeadDialog />
    </>
  );
}
