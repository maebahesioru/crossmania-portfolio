import {
  MCP_RESOURCES, MCP_TOOLS, callTool, recentBbs,
} from "@/lib/agentApi";
import { render } from "@/app/api/markdown/route";

/**
 * MCP サーバー (Streamable HTTP)。
 * https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
 *
 * 実装しているのは tools / resources / prompts。
 * セッションは持たない(initialize で Mcp-Session-Id を返さないのでクライアントも送らない)。
 * SSE は提供しないので GET は 405(仕様上どちらか必須)。
 */
export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "hikamers.app", version: "1.0.0" };

const rpc = (id: unknown, result: unknown) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id: unknown, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });
const text = (t: string) => ({ content: [{ type: "text", text: t }] });

function handle(req: { id?: unknown; method?: string; params?: Record<string, unknown> }) {
  const { id, method, params = {} } = req;
  switch (method) {
    case "initialize":
      return rpc(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false, subscribe: false },
          prompts: { listChanged: false },
        },
        serverInfo: SERVER_INFO,
        instructions:
          "十字架_mania のポートフォリオ(hikamers.app)の読み取り専用サーバー。"
          + "プロフィール・プロジェクト・記事・BBS・寄付先を返す。書き込みはできない。",
      });

    case "ping":
      return rpc(id, {});

    case "tools/list":
      return rpc(id, {
        tools: MCP_TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
        })),
      });

    case "tools/call": {
      const name = String(params.name ?? "");
      if (!MCP_TOOLS.some((t) => t.name === name)) {
        return rpcErr(id, -32602, `unknown tool: ${name}`);
      }
      return callTool(name).then((out) => rpc(id, text(out)));
    }

    case "resources/list":
      return rpc(id, {
        resources: MCP_RESOURCES.map((r) => ({
          uri: r.uri,
          name: r.name,
          mimeType: "text/markdown",
        })),
      });

    case "resources/read": {
      const uri = String(params.uri ?? "");
      const hit = MCP_RESOURCES.find((r) => r.uri === uri);
      if (!hit) return rpcErr(id, -32602, `unknown resource: ${uri}`);
      // 実体は Markdown for Agents と同じ関数を使う(二重実装しない)
      return render(hit.path).then((md) =>
        md === null
          ? rpcErr(id, -32602, `no markdown for: ${hit.path}`)
          : rpc(id, { contents: [{ uri, mimeType: "text/markdown", text: md }] }),
      );
    }

    case "prompts/list":
      return rpc(id, {
        prompts: [
          {
            name: "introduce",
            description: "十字架_mania を日本語で紹介する",
            arguments: [],
          },
          {
            name: "summarize_bbs",
            description: "BBS の最近の投稿を要約する",
            arguments: [{ name: "limit", description: "件数(既定20)", required: false }],
          },
        ],
      });

    case "prompts/get": {
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, string>;
      if (name === "introduce") {
        return rpc(id, {
          description: "十字架_mania を日本語で紹介する",
          messages: [{ role: "user", content: { type: "text", text: "十字架_mania を日本語で3行で紹介して。" } }],
        });
      }
      if (name === "summarize_bbs") {
        const n = Math.min(Math.max(Number(args.limit) || 20, 1), 50);
        return recentBbs(n).then((posts) =>
          rpc(id, {
            description: "BBS の最近の投稿を要約する",
            messages: [{
              role: "user",
              content: {
                type: "text",
                text: `次のBBS投稿を日本語で要約して。\n\n`
                  + (posts.length ? posts.map((p) => `- ${p.at} ${p.name}: ${p.body}`).join("\n") : "(投稿なし)"),
              },
            }],
          }),
        );
      }
      return rpcErr(id, -32602, `unknown prompt: ${name}`);
    }

    default:
      return rpcErr(id, -32601, `method not found: ${method}`);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(rpcErr(null, -32700, "parse error"), { status: 400 });
  }
  // 通知(initialized など)は id を持たない → 202 で本文なし
  if (!body || typeof body !== "object" || !("method" in body)) {
    return Response.json(rpcErr(null, -32600, "invalid request"), { status: 400 });
  }
  const msg = body as { id?: unknown; method: string };
  if (msg.id === undefined) return new Response(null, { status: 202 });

  const out = await handle(msg as never);
  return Response.json(out, { headers: { "cache-control": "no-store" } });
}

export function GET() {
  // SSE を提供しないので 405(仕様: GET は SSE か 405 のどちらか)
  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}
