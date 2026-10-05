import { SITE } from "@/lib/site";

/**
 * security.txt (RFC 9116)。
 * 脆弱性の報告先をセキュリティ研究者に示すためのファイル。
 *
 * - 置き場所は `/.well-known/security.txt` が正。`/security.txt` も従来互換で置く。
 * - `Contact` と `Expires` は必須。Expires は**未来日**でないと無効なファイル扱いになる。
 * - Content-Type は text/plain。署名はしない(読むだけのファイルなので)。
 *
 * ⚠️ Cloudflare のダッシュボードにも security.txt の自動生成機能があるが、
 *    あちらを使うとオリジン側と二重になる。ここで自前に出しているので
 *    ダッシュボード側は設定しないこと。
 */

/** 報告先。mailto と URL を併記できる(RFC 9116 は複数の Contact を許容する)。 */
const CONTACTS = [
  // このドメインは catch-all 転送が有効なので security@ にも届く
  "mailto:security@hikamers.app",
  "https://x.com/maebahesioru2",
];

/** Expires は未来日でないと無効。常に半年先を返して古くならないようにする。 */
function expires(): string {
  const d = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function securityTxt(): string {
  return [
    ...CONTACTS.map((c) => `Contact: ${c}`),
    `Expires: ${expires()}`,
    `Canonical: ${SITE.url}/.well-known/security.txt`,
    "Preferred-Languages: ja, en",
    `Policy: ${SITE.url}/terms`,
    "",
  ].join("\n");
}

export const SECURITY_TXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=3600",
} as const;
