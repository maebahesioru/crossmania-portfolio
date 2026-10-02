import { authMd } from "@/lib/agentDocs";

export const dynamic = "force-static";

/**
 * auth.md — エージェントに認証の扱いを説明する。
 * ⚠️ このサイトに認可サーバーは無いので、OAuth/OIDC のメタデータは**出さない**。
 *    存在しないエンドポイントを広告すると、エージェントから見て壊れたサイトになる。
 */
export async function GET() {
  return new Response(authMd(), {
    headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
