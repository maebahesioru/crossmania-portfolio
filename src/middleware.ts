import { NextResponse, type NextRequest } from "next/server";

/**
 * Markdown for Agents。
 *
 * ブラウザは `Accept: text/html,...` を送るので既定はこれまで通り HTML。
 * エージェントが `Accept: text/markdown` を付けたときだけ Markdown に差し替える。
 * 実体は /api/markdown 側で元データから組み立てる(HTML を変換しない)。
 *
 * ⚠️ パスは**クエリではなくリクエストヘッダ**で渡す。
 *    `NextResponse.rewrite()` はクエリ文字列を落とすことがあり、
 *    実際 `?path=/blog` を付けてもルート側で `"/"` になっていた(実測)。
 *    `request.headers` を差し替える形なら rewrite 後も残る。
 */
export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  if (!accept.includes("text/markdown")) return NextResponse.next();

  const headers = new Headers(req.headers);
  headers.set("x-md-path", req.nextUrl.pathname);

  const url = req.nextUrl.clone();
  url.pathname = "/api/markdown";
  url.search = "";
  return NextResponse.rewrite(url, { request: { headers } });
}

/** 対象は HTML のページだけ。アセットや API には噛ませない */
export const config = {
  matcher: ["/", "/blog", "/bbs", "/donate", "/mirror", "/terms", "/license"],
};
