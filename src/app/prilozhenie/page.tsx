import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";
import Install from "@/components/Install";

export const metadata: Metadata = {
  title: "Приложение FOX Car Service (демо): запись, мои визиты, уведомления",
  description: "Как работает приложение автосервиса FOX: запись на удобное время, свои записи и уведомления о подтверждении и готовности машины. Ставится на телефон из браузера.",
  alternates: { canonical: "/prilozhenie" },
};

const features = [
  ["Запись на работу", "Выбираете услугу, день и удобное время. Мастер подтверждает запись или предлагает ближайшее время."],
  ["Мои записи", "Все визиты в одном месте: дата, время, пост, статус работы."],
  ["Уведомления", "Сообщим, когда мастер подтвердил запись и когда машина готова."],
  ["Без магазина приложений", "Ставится прямо из браузера на iPhone и Android, места почти не занимает."],
];

const steps = [
  ["Откройте демо", "Нажмите «Открыть демо-приложение». Можно прямо в браузере, ничего не ставя."],
  ["Оставьте заявку", "Выберите день, удобное время, услугу и машину. Заявка появится в «Мои записи»."],
  ["Включите уведомления", "Через несколько секунд «мастер» подтвердит запись, и придёт уведомление. В «Мои записи» можно проверить уведомление «машина готова»."],
  ["Поставьте на телефон", "iPhone: Safari → «Поделиться» → «На экран Домой». Android: Chrome → меню ⋮ → «Установить приложение»."],
];

export default function AppLanding() {
  return (
    <>
      <Header base="/" />
      <main className="sec art-page">
        <div className="wrap">
          <nav className="crumbs" aria-label="Навигация"><Link href="/">Главная</Link> / <span>Приложение</span></nav>
          <div className="pa">
            <div>
              <span className="art-tag">Демо-версия</span>
              <h1>Приложение <em>FOX</em></h1>
              <p className="lead">Запись в сервис, свои визиты и уведомления в телефоне. Это демо: попробуйте, как будет выглядеть приложение для клиентов. Записи из демо в сервис не уходят, чтобы записаться по-настоящему, оставьте заявку на сайте или позвоните.</p>
              <div className="row pa-cta">
                <Link className="btn" href="/app">Открыть демо-приложение</Link>
                <Install className="btn ghost" />
              </div>
            </div>
            <div className="pa-phone" aria-hidden="true">
              <div className="pa-scr">
                <div className="pa-push"><b>🔔 FOX: запись подтверждена</b><span>Завтра, 12:00, пост 1. Ждём вас!</span></div>
                <b className="pa-h">Мои записи</b>
                <div className="pa-card"><b>Завтра, 12:00</b><span>Замена масла · Kia Rio</span><small className="st confirmed">Подтверждено</small></div>
                <div className="pa-card"><b>12 октября, 15:00</b><span>Шиномонтаж · Kia Rio</span><small className="st done">Выполнено</small></div>
                <span className="pa-btn">Записаться</span>
              </div>
            </div>
          </div>

          <h2 className="pa-sec">Что умеет</h2>
          <div className="perks">{features.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>

          <h2 className="pa-sec">Как попробовать</h2>
          <ol className="steps">{steps.map(([t, d], i) => <li key={t}><span>{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>

          <p className="muted pa-note">В рабочей версии записи увидит мастер в кабинете сервиса, а уведомления будут приходить с сервера, даже когда приложение закрыто. На iPhone уведомления работают в приложении, добавленном на экран «Домой» (iOS 16.4 и новее).</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
