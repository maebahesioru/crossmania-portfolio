import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/**
 * robots.txt。Next の MetadataRoute.Robots は独自行を出せないので自前の route にしている。
 *
 * Content-Signal は「AI にどう使われたいか」の意思表示(https://contentsignals.org/)。
 * - ai-train=no  : 学習には使ってほしくない(個人の文章なので)
 * - search=yes   : 検索エンジンには載ってよい
 * - ai-input=yes : エージェントが読んで回答に使うのは可(Markdown 配信もしている)
 */
export async function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "Content-Signal: ai-train=yes, search=yes, ai-input=yes",
    "",
    // ARD(Agentic Resource Discovery)の在り処を示す
    `Agentmap: ${SITE.url}/.well-known/ai-catalog.json`,
    "",
    `Host: ${SITE.url}`,
    `Sitemap: ${SITE.url}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
