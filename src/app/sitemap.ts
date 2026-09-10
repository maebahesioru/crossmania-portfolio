import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/blog", priority: 0.8, freq: "weekly" },
    { path: "/bbs", priority: 0.7, freq: "daily" },
    { path: "/mirror", priority: 0.3, freq: "monthly" },
    { path: "/terms", priority: 0.3, freq: "yearly" },
    { path: "/license", priority: 0.3, freq: "yearly" },
  ];
  return pages.map((p) => ({
    url: `${SITE.url}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
