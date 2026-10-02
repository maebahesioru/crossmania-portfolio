import { mcpServerCard } from "@/lib/agentApi";

export const dynamic = "force-static";

/**
 * MCP Server Card の別名パス。
 * 標準は `server-card.json` だが、`mcp.json` を探すクライアントがいるので同じ実体を返す。
 */
export async function GET() {
  return Response.json(mcpServerCard(), {
    headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=3600" },
  });
}
