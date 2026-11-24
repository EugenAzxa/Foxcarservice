import type { MetadataRoute } from "next";
import { articles } from "@/data/articles";

const BASE = "https://foxcarservice.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/stati`, changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((a) => ({ url: `${BASE}/stati/${a.slug}`, lastModified: a.date, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${BASE}/prilozhenie`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/soglasie`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
