import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/blog", priority: 0.8, freq: "weekly" },
    { path: "/blog/nextjs-deploy-not-reflecting", priority: 0.7, freq: "monthly" },
    { path: "/blog/adsense-rejection-content-audit", priority: 0.7, freq: "monthly" },
    { path: "/blog/self-hosted-searxng", priority: 0.7, freq: "monthly" },
    { path: "/blog/wine-app-hit-testing", priority: 0.7, freq: "monthly" },
    { path: "/blog/linux-ime-fcitx5", priority: 0.7, freq: "monthly" },
    { path: "/blog/local-vocal-separation-gpu", priority: 0.7, freq: "monthly" },
    { path: "/blog/cloudflare-tunnel-pitfalls", priority: 0.7, freq: "monthly" },
    { path: "/blog/anonymous-vote-anti-abuse", priority: 0.7, freq: "monthly" },
    { path: "/blog/homelab-memory-pressure", priority: 0.7, freq: "monthly" },
    { path: "/blog/twitter-election-tech", priority: 0.7, freq: "monthly" },
    { path: "/blog/homelab-n100", priority: 0.7, freq: "monthly" },
    { path: "/blog/ai-agent-development", priority: 0.7, freq: "monthly" },
    { path: "/blog/encuentro-2026", priority: 0.6, freq: "yearly" },
    // /bbs /donate /mirror は metadata.robots で noindex なので sitemap には載せない
    { path: "/terms", priority: 0.3, freq: "yearly" },
    { path: "/privacy", priority: 0.3, freq: "yearly" },
    { path: "/license", priority: 0.3, freq: "yearly" },
  ];
  return pages.map((p) => ({
    url: `${SITE.url}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
