import { SECURITY_TXT_HEADERS, securityTxt } from "@/lib/securityTxt";

/**
 * security.txt (RFC 9116)。正式な置き場所。
 * 脆弱性の報告先をセキュリティ研究者に示す。
 */
// Expires を**ビルド時に固定しない**。固定すると再デプロイしないまま
// 期限切れになり、無効な security.txt として扱われる。
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(securityTxt(), { headers: SECURITY_TXT_HEADERS });
}
