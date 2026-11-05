"use client";
import { useEffect, useState } from "react";
import { site } from "@/data/site";

export default function OpenNow() {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const h = Number(new Intl.DateTimeFormat("ru-RU", { hour: "numeric", timeZone: "Europe/Moscow" }).format(new Date()));
    setOpen(h >= site.open && h < site.close);
  }, []);
  if (open === null) return null;
  return <span className={open ? "status on" : "status"}>{open ? "сейчас открыто" : "сейчас закрыто"}</span>;
}
