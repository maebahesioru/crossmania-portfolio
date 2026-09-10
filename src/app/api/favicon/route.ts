import { NextResponse } from "next/server";

/**
 * 各プロジェクトサイトの favicon を自動取得して中継する。
 *
 * なぜ中継するか: ブラウザから直接 <img src="https://他サイト/favicon.ico"> を貼ると、
 * 「そのサイトにfaviconが無い」(404) 場合に壊れた画像アイコンが出るのと、
 * 先方に Referer を渡してしまう。ここで解決して自前でキャッシュし、失敗は404で返す。
 *
 * 取得順: HTMLの <link rel="icon|apple-touch-icon"> を大きい順に試す → 無ければ /favicon.ico
 *
 * ⚠️ 任意URLを取れると SSRF の中継所になるため、ホストは許可リストで縛る
 *    (PROJECTS のホスト + *.hikamers.app)。リダイレクト先も同じ条件で検証する。
 */
export const dynamic = "force-dynamic";

const UA = "crossmania-portfolio/1.0 (+https://hikamers.app; favicon)";
const OK_TTL_MS = 24 * 60 * 60 * 1000; // 成功は1日キャッシュ
const NG_TTL_MS = 10 * 60 * 1000; // 失敗は10分で再挑戦

type Entry = { ok: boolean; at: number; body?: ArrayBuffer; type?: string };
const cache = new Map<string, Entry>();

/** 許可ホストか(hikamers.app 配下 or 明示リスト) */
function allowedHost(host: string, extra: string[]): boolean {
  const h = host.toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(h)) return false;
  if (h === "hikamers.app" || h.endsWith(".hikamers.app")) return true;
  return extra.includes(h);
}

/** HTMLから icon 候補を優先度つきで集める */
function iconCandidates(html: string, base: string) {
  const out: { url: string; score: number }[] = [];
  const re = /<link\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const rel = (tag.match(/\brel\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    if (!/icon/i.test(rel)) continue;
    const href = (tag.match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (!href) continue;
    let url: string;
    try {
      url = new URL(href, base).toString();
    } catch {
      continue;
    }
    if (!url.startsWith("https://") && !url.startsWith("http://")) continue;
    const sizes = (tag.match(/\bsizes\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    let score = 0;
    if (/apple-touch-icon/i.test(rel)) score += 5; // 高解像度で綺麗
    if (/\bsvg\b/i.test(sizes) || /\.svg(\?|$)/i.test(url)) score += 6; // ベクターは拡大に強い
    const px = Number((sizes.match(/(\d+)x\d+/) || [])[1] || 0);
    if (px) score += Math.min(px, 256) / 32;
    if (/\.ico(\?|$)/i.test(url)) score -= 1;
    out.push({ url, score });
  }
  return out.sort((a, b) => b.score - a.score).map((c) => c.url);
}

export async function GET(request: Request) {
  const host = (new URL(request.url).searchParams.get("host") || "").toLowerCase();
  if (!host) return new NextResponse("host required", { status: 400 });

  const extra = (process.env.FAVICON_EXTRA_HOSTS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowedHost(host, extra)) {
    return new NextResponse("host not allowed", { status: 403 });
  }

  const hit = cache.get(host);
  if (hit && Date.now() - hit.at < (hit.ok ? OK_TTL_MS : NG_TTL_MS)) {
    if (!hit.ok) return new NextResponse("no favicon", { status: 404 });
    return new NextResponse(hit.body, {
      headers: {
        "content-type": hit.type || "image/png",
        "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
        "access-control-allow-origin": "*",
        "x-favicon-host": host,
      },
    });
  }

  const origin = `https://${host}/`;
  try {
    // 1) トップページのHTMLから icon 指定を拾う
    const pageRes = await fetch(origin, {
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: AbortSignal.timeout(9000),
      cache: "no-store",
      redirect: "follow",
    });
    const finalHost = new URL(pageRes.url).host;
    if (!allowedHost(finalHost, extra)) throw new Error("redirected off-allowlist");
    const html = pageRes.ok ? await pageRes.text() : "";

    // 2) 候補を順に試す(最後の砦は /favicon.ico)
    const tries = [...iconCandidates(html, origin), `https://${host}/favicon.ico`];
    for (const url of tries) {
      try {
        const r = await fetch(url, {
          headers: { "user-agent": UA },
          signal: AbortSignal.timeout(8000),
          cache: "no-store",
          redirect: "follow",
        });
        if (!r.ok) continue;
        if (!allowedHost(new URL(r.url).host, extra)) continue;
        const buf = await r.arrayBuffer();
        if (buf.byteLength < 70) continue; // 空・エラーページを弾く
        const type = r.headers.get("content-type") || "image/png";
        if (!/image\//.test(type) && !/octet-stream|icon/.test(type)) continue;
        cache.set(host, { ok: true, at: Date.now(), body: buf, type });
        return new NextResponse(buf, {
          headers: {
            "content-type": type,
            "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
            "access-control-allow-origin": "*",
            "x-favicon-host": host,
            "x-favicon-src": url.replace(origin, "./"),
          },
        });
      } catch {
        // 次の候補へ
      }
    }
    throw new Error("no candidate worked");
  } catch {
    cache.set(host, { ok: false, at: Date.now() });
    return new NextResponse("no favicon", { status: 404 });
  }
}
