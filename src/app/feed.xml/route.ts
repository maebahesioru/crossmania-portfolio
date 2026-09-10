import { BLOG, SOURCES } from "@/lib/profile";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const items = BLOG.map((p) => {
    const date = new Date(Date.UTC(2026, 8, 10)).toUTCString();
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(p.url)}</link>
      <guid isPermaLink="false">${esc(p.url)}</guid>
      <category>${esc(SOURCES[p.source].label)}</category>
      <pubDate>${date}</pubDate>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE.name)} — Blog</title>
    <link>${SITE.url}/blog</link>
    <description>${esc(SITE.description)}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
