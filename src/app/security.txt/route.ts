import { SECURITY_TXT_HEADERS, securityTxt } from "@/lib/securityTxt";

/**
 * security.txt の従来互換パス。
 * RFC 9116 の正式な場所は `/.well-known/security.txt` だが、
 * ルート直下を見るスキャナがあるので同じ内容を返す。
 */
// Expires を**ビルド時に固定しない**。固定すると再デプロイしないまま
// 期限切れになり、無効な security.txt として扱われる。
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(securityTxt(), { headers: SECURITY_TXT_HEADERS });
}
