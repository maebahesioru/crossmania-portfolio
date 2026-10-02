import { directoryResponse } from "@/lib/webbotauth";

/**
 * Web Bot Auth の鍵ディレクトリ (JWKS)。
 * https://datatracker.ietf.org/doc/draft-meunier-http-message-signatures-directory/
 *
 * このサイトが外向きリクエストに付ける署名を、受け取った側が検証するための公開鍵。
 * 応答自体にも署名が付く(ミラー防止)。
 *
 * 秘密鍵(WEBBOTAUTH_PRIVATE_JWK)が未設定なら 404 を返す。
 * 鍵が無いのに「鍵がある」と言わない。
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return directoryResponse(req);
}
