import { PUBLIC_API } from "@/lib/agentDocs";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/**
 * ARD (Agentic Resource Discovery) の capability manifest。
 * エージェントが「このサイトに何があるか」を機械可読に発見するための索引。
 *
 * ⚠️ 実体のあるものだけを載せる。ここに書いた URL は実際に取得される。
 *    MCP サーバーや A2A エージェントは動かしていないので**載せない**
 *    (載せるとエージェントが接続を試みて失敗する)。
 */
export async function GET() {
  const entries = [
    {
      identifier: "urn:air:hikamers.app:api:catalog",
      displayName: "hikamers.app public API catalog",
      type: "application/linkset+json",
      url: `${SITE.url}/.well-known/api-catalog`,
      representativeQueries: [
        "what APIs does hikamers.app expose",
        "list the public endpoints of this portfolio",
      ],
    },
    {
      identifier: "urn:air:hikamers.app:api:openapi",
      displayName: "hikamers.app OpenAPI description",
      type: "application/openapi+json",
      url: `${SITE.url}/openapi.json`,
      representativeQueries: [
        "how do I fetch the blog feed from hikamers.app",
        "openapi spec for hikamers.app",
      ],
    },
    {
      identifier: "urn:air:hikamers.app:skill:portfolio",
      displayName: "hikamers.app agent skill",
      type: "text/markdown",
      url: `${SITE.url}/.well-known/agent-skills/hikamers-portfolio/SKILL.md`,
      representativeQueries: [
        "who is 十字架_mania",
        "how to read hikamers.app as an agent",
      ],
    },
    ...PUBLIC_API.map((a) => ({
      identifier: `urn:air:hikamers.app:api:${a.path.replace(/\/api\//, "")}`,
      displayName: `hikamers.app ${a.path}`,
      type: "application/json",
      url: `${SITE.url}${a.path}`,
      // ⚠️ ARD は 2〜5 件を期待する。1件だと構造チェックで弾かれる(実測)。
      representativeQueries: [a.summary, `fetch ${a.path} from hikamers.app`],
    })),
  ];

  return Response.json(
    {
      specVersion: "1.0",
      host: {
        displayName: "hikamers.app (十字架_mania portfolio)",
        identifier: "did:web:hikamers.app",
      },
      entries,
    },
    {
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=3600",
      },
    },
  );
}
