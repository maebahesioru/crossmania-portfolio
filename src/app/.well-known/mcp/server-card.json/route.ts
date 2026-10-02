import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/**
 * MCP Server Card (SEP-1649)。
 * 実際に動いている MCP サーバー (/mcp) の capability を広告する。
 * ここに書いた capability は全部実装済み。無いものは書かない。
 */
export async function GET() {
  return Response.json(
    {
      serverInfo: { name: "hikamers.app", version: "1.0.0" },
      transport: {
        type: "streamable-http",
        endpoint: `${SITE.url}/mcp`,
      },
      capabilities: {
        tools: { listChanged: false },
        resources: { listChanged: false, subscribe: false },
        prompts: { listChanged: false },
      },
      instructions:
        "十字架_mania のポートフォリオ(hikamers.app)の読み取り専用サーバー。書き込みはできない。",
    },
    { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=3600" } },
  );
}
