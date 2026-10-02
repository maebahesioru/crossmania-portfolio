import { answer } from "@/lib/agentApi";

/**
 * A2A (Agent2Agent) サーバー。JSON-RPC 2.0。
 * https://a2a-protocol.org/latest/specification/
 *
 * 対応: message/send(同期応答)。ストリーミングは提供しないので
 * エージェントカードで capabilities.streaming = false と明示している。
 */
export const dynamic = "force-dynamic";

const AGENT_VERSION = "1.0.0";

type Part = { kind?: string; text?: string };
type Msg = { role?: string; parts?: Part[]; messageId?: string; contextId?: string; taskId?: string };

const rpc = (id: unknown, result: unknown) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id: unknown, code: number, message: string, data?: unknown) => ({
  jsonrpc: "2.0", id, error: { code, message, ...(data ? { data } : {}) },
});

function partsToText(parts: Part[] | undefined): string {
  return (parts ?? []).map((p) => (typeof p.text === "string" ? p.text : "")).join("\n").trim();
}

export async function POST(req: Request) {
  let body: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json(rpcErr(null, -32700, "Parse error"), { status: 400 });
  }

  const { id, method, params = {} } = body ?? {};
  if (typeof method !== "string") {
    return Response.json(rpcErr(id ?? null, -32600, "Invalid Request"), { status: 400 });
  }

  // 通知(id なし)は 202
  if (id === undefined) return new Response(null, { status: 202 });

  if (method === "message/send" || method === "message/stream") {
    const message = (params.message ?? {}) as Msg;
    const question = partsToText(message.parts);
    if (!question) {
      return Response.json(rpcErr(id, -32602, "message.parts に text がありません"), { status: 400 });
    }
    const out = await answer(question);
    const contextId = message.contextId ?? crypto.randomUUID();
    // ストリーミングは非対応なので、message/stream でも1件の Message を返す
    return Response.json(
      rpc(id, {
        kind: "message",
        messageId: crypto.randomUUID(),
        role: "agent",
        parts: [{ kind: "text", text: out }],
        contextId,
        ...(message.taskId ? { taskId: message.taskId } : {}),
      }),
      { headers: { "cache-control": "no-store" } },
    );
  }

  if (method === "tasks/get") {
    // このエージェントは同期応答のみでタスクを保持しない
    return Response.json(rpcErr(id, -32001, "Task not found: このエージェントはタスクを保持しません"), { status: 404 });
  }

  if (method === "agent/getAuthenticatedExtendedCard") {
    return Response.json(rpcErr(id, -32004, "Unsupported operation"), { status: 404 });
  }

  return Response.json(rpcErr(id, -32601, "Method not found"), { status: 404 });
}

export function GET() {
  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}
