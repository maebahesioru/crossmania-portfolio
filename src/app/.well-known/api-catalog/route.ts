import { PUBLIC_API } from "@/lib/agentDocs";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/**
 * API カタログ(RFC 9727)。エージェントが「このサイトにどんな API があるか」を
 * 機械可読に発見するための索引。
 *
 * ⚠️ 実在する API だけを載せること。ここに書いた URL は実際に叩かれる。
 */
export async function GET() {
  const linkset = PUBLIC_API.map((a) => ({
    anchor: `${SITE.url}${a.path}`,
    "service-desc": [{ href: `${SITE.url}/openapi.json`, type: "application/openapi+json" }],
    "service-doc": [{ href: `${SITE.url}/llms.txt`, type: "text/plain" }],
    // status は「GET して 200 なら生きている」を見るための URL
    status: [{ href: `${SITE.url}${a.path}`, type: "application/json" }],
  }));

  return new Response(JSON.stringify({ linkset }, null, 2), {
    headers: {
      "content-type": "application/linkset+json",
      "cache-control": "public, max-age=3600",
    },
  });
}
