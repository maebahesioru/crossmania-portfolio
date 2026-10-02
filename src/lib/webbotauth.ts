import { createHash, createPrivateKey, sign as edSign, type JsonWebKey as NodeJsonWebKey } from "node:crypto";
import { createSignature, component } from "http-message-sig";
import { generateNonce, jwkToKeyID, sign } from "web-bot-auth";
import { SITE } from "@/lib/site";

/**
 * Web Bot Auth (IETF WebBotAuth WG)。
 * https://datatracker.ietf.org/wg/webbotauth/about/
 *
 * このサイトが**外向きにリクエストを送るとき**に「これは hikamers.app のものだ」と
 * 暗号署名で証明する仕組み。サイトを守る仕組みではなく、送信側の名乗り。
 *
 * - 公開鍵: /.well-known/http-message-signatures-directory (JWKS)
 * - 署名: RFC 9421 の HTTP Message Signatures
 *   ヘッダは Signature-Input / Signature / Signature-Agent の3つ
 *
 * 実装は Cloudflare の参照実装 (github.com/cloudflare/web-bot-auth,
 * IETF ドラフトの著者本人) をそのまま使う。署名ベースの組み立てを自前で書くと
 * エスケープやパラメータ順でズレて検証が通らないため。
 *
 * 秘密鍵は環境変数 WEBBOTAUTH_PRIVATE_JWK に JWK(JSON) で入れる。
 * **リポジトリには絶対に置かない。** 未設定なら署名せず、ディレクトリも 404 を返す
 * (鍵が無いのに「鍵がある」と言わない)。
 */

export const DIRECTORY_PATH = "/.well-known/http-message-signatures-directory";
export const DIRECTORY_TAG = "http-message-signatures-directory";
export const SIGNATURE_AGENT_URI = SITE.url;

/** Signature-Agent は構造化フィールドなので**二重引用符で囲む**必要がある。
 *  囲まない / 辞書形式(sig2="...")にすると Cloudflare は検証に失敗する。 */
export const SIGNATURE_AGENT_VALUE = `"${SIGNATURE_AGENT_URI}"`;

type Key = {
  keyid: string;
  privateJwk: JsonWebKey;
  publicJwk: JsonWebKey;
  signer: { algorithm: "ed25519"; keyid: string; sign: (d: Uint8Array) => Uint8Array };
};

let cached: Key | null | undefined;

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).toString("base64url");

/** BufferSource は ArrayBuffer のことも Uint8Array のこともあるので正規化する */
const toU8 = (b: BufferSource): Uint8Array =>
  b instanceof ArrayBuffer
    ? new Uint8Array(b)
    : new Uint8Array(b.buffer as ArrayBuffer, b.byteOffset, b.byteLength);

/** RFC 7638 の JWK thumbprint。Cloudflare 実装に hash 実装を渡して計算する。 */
async function thumbprint(jwk: JsonWebKey): Promise<string> {
  return jwkToKeyID(
    jwk,
    (b) => Promise.resolve(createHash("sha256").update(toU8(b)).digest().buffer as ArrayBuffer),
    (ab) => b64url(ab),
  );
}

/** 環境変数から鍵を読む。無効なら null(署名しない)。 */
export async function loadKey(): Promise<Key | null> {
  if (cached !== undefined) return cached;
  cached = null;

  const raw = process.env.WEBBOTAUTH_PRIVATE_JWK;
  if (!raw) return cached;

  try {
    const privateJwk = JSON.parse(raw) as JsonWebKey;
    if (privateJwk.kty !== "OKP" || privateJwk.crv !== "Ed25519" || !privateJwk.d || !privateJwk.x) {
      console.warn("[webbotauth] WEBBOTAUTH_PRIVATE_JWK が Ed25519 の秘密鍵JWKではない");
      return cached;
    }
    // 公開部分だけ取り出す(ディレクトリに載せるのはこれだけ)
    const publicJwk: JsonWebKey = { kty: "OKP", crv: "Ed25519", x: privateJwk.x };
    // Node の JsonWebKey 型は DOM のものと別定義なのでキャストする
    const keyObject = createPrivateKey({ key: privateJwk as unknown as NodeJsonWebKey, format: "jwk" });
    const keyid = await thumbprint(publicJwk);

    cached = {
      keyid,
      privateJwk,
      publicJwk,
      signer: {
        algorithm: "ed25519",
        // WebBotSigner は keyid を要求する(署名の keyid パラメータに使われる)
        keyid,
        sign: (d: Uint8Array) => new Uint8Array(edSign(null, Buffer.from(d), keyObject)),
      },
    };
  } catch (e) {
    console.warn("[webbotauth] 鍵の読み込みに失敗:", e instanceof Error ? e.message : e);
  }
  return cached ?? null;
}

/**
 * 署名付き fetch。外向きリクエストに3ヘッダを付ける。
 *
 * 署名に失敗しても**元の fetch は必ず実行する**(署名は付加価値であって、
 * 失敗したら通信ごと落とす、という設計にはしない)。
 */
export async function signedFetch(url: string | URL, init: RequestInit = {}): Promise<Response> {
  const key = await loadKey();
  if (!key) return fetch(url, init);

  try {
    const headers = new Headers(init.headers);
    // Signature-Agent は署名対象のコンポーネントなので、署名の前に必ず入れる
    headers.set("Signature-Agent", SIGNATURE_AGENT_VALUE);

    const now = Date.now();
    const fields = await sign(
      new Request(url, { method: init.method ?? "GET", headers }),
      {
        signer: key.signer,
        created: new Date(now),
        // Cloudflare 推奨は短命。リプレイ対策はこの expires で担保する
        expires: new Date(now + 60_000),
        nonce: generateNonce(),
      },
    );
    headers.set("Signature", fields.signature);
    headers.set("Signature-Input", fields.signatureInput);
    return fetch(url, { ...init, headers });
  } catch (e) {
    console.warn("[webbotauth] 署名に失敗したので未署名で送る:", e instanceof Error ? e.message : e);
    return fetch(url, init);
  }
}

/**
 * 鍵ディレクトリの応答。
 *
 * ディレクトリ**自体にも署名が必要**(他人が同じ内容をミラーして
 * 「自分がこの鍵の持ち主だ」と登録できてしまうのを防ぐため)。
 * タグは web-bot-auth ではなく http-message-signatures-directory。
 * コンポーネントは @authority に ;req を付ける(応答から見た要求側の authority)。
 */
export async function directoryResponse(req?: Request): Promise<Response> {
  const key = await loadKey();
  if (!key) {
    return new Response("Not Found", { status: 404 });
  }

  // @authority は「受け取った側の Host」で決まる。SITE.url を固定で使うと
  // 別ドメイン(ローカル検証や onion ミラー)から来た要求と食い違って検証が落ちる。
  const authority =
    req?.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req?.headers.get("host") ||
    new URL(SITE.url).host;

  const body = JSON.stringify({ keys: [key.publicJwk] });
  const now = Math.floor(Date.now() / 1000);
  const contentType = "application/http-message-signatures-directory+json";

  const fields = await createSignature(
    {
      kind: "response",
      status: 200,
      fields: [{ name: "content-type", value: contentType }],
      request: {
        kind: "request",
        method: "GET",
        targetUri: `https://${authority}${DIRECTORY_PATH}`,
        fields: [],
      },
    },
    {
      label: "sig1",
      components: [component("@authority", { req: true })],
      parameters: {
        alg: "ed25519",
        keyid: key.keyid,
        nonce: generateNonce(),
        tag: DIRECTORY_TAG,
        created: now,
        // ディレクトリは公開文書なのでリプレイの害が薄い。キャッシュ(1h)より長めに取る
        expires: now + 7200,
      },
      signer: key.signer,
    },
  );

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "signature-input": fields.signatureInput,
      signature: fields.signature,
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    },
  });
}
