import { LOCAL_POSTS } from "@/lib/localPosts";
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
  /* フィードにはサイト内の記事だけを流す。外部サービスに書いた記事を混ぜると
     フィードがリンク集になり、サイトの中身と一致しなくなる。 */
  const items = LOCAL_POSTS.map((p) => {
    const url = `${SITE.url}${p.href}`;
    const date = new Date(p.date).toUTCString();
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <category>${esc(p.tag)}</category>
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
