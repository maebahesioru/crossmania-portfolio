import { NextResponse } from "next/server";

/**
 * リンク先サイトの favicon / 拡張機能アイコンを自動取得して中継する。
 *
 * なぜ中継するか: ブラウザから直接 <img src="https://他サイト/favicon.ico"> を貼ると、
 * 「そのサイトに favicon が無い」(404) 場合に壊れた画像アイコンが出るのと、
 * 先方に Referer を渡してしまう。ここで解決して自前でキャッシュし、失敗は 404 で返す。
 *
 * 取得順:
 *   1. そのページの <link rel="icon|apple-touch-icon"> をスコア順
 *   2. ストア系は og:image / twitter:image (Chrome Web Store は拡張のアイコンがここに入る)
 *   3. 最後の砦として /favicon.ico
 *
 * クエリ:
 *   host=<host>            サイトのルートを見る(プロジェクトサイト用)
 *   url=<フルURL>          特定ページを見る(拡張機能のストア詳細ページ用)。host より優先。
 *
 * ⚠️ 任意 URL を取れると SSRF の中継所になるため許可リストで縛る。
 *    - ページ取得は PAGE_HOSTS のみ。リダイレクト先も同じ条件で検証する。
 *    - 画像取得も IMAGE_HOSTS のみ(許可ページが参照した CDN に限定)。
 */
export const dynamic = "force-dynamic";

const UA = "crossmania-portfolio/1.0 (+https://hikamers.app; favicon)";
const OK_TTL_MS = 24 * 60 * 60 * 1000; // 成功は1日キャッシュ
const NG_TTL_MS = 10 * 60 * 1000; // 失敗は10分で再挑戦
const MAX_BYTES = 900 * 1024; // アイコン用途に巨大画像は不要

type Entry = { ok: boolean; at: number; body?: ArrayBuffer; type?: string };
const cache = new Map<string, Entry>();

/**
 * ページ(HTML)を取りに行ってよいホスト。
 *   - 自分の配下(hikamers.app)
 *   - 拡張機能/スクリプトの配布元(ストア・Tampermonkey・GitHub)
 *   - 環境変数 FAVICON_EXTRA_HOSTS で追加(カンマ区切り)
 */
const PAGE_HOSTS = [
  "hikamers.app",
  "chromewebstore.google.com",
  "chrome.google.com",
  "addons.mozilla.org",
  "www.tampermonkey.net",
  "tampermonkey.net",
  "raw.githubusercontent.com",
  "github.com",
  // SNS プロフィール(og:image がアイコンになる)
  "x.com",
  "twitter.com",
] as const;

/**
 * 画像だけを取りに行ってよい追加ホスト(CDN)。
 * 許可ページの og:image や icon がここを指すため。
 */
const IMAGE_HOSTS = [
  "lh3.googleusercontent.com",
  "ssl.gstatic.com",
  "addons.mozilla.org",
  "www.tampermonkey.net",
  "raw.githubusercontent.com",
  // X のプロフィール画像 CDN
  "pbs.twimg.com",
  "abs.twimg.com",
] as const;

function hostMatches(host: string, list: readonly string[]): boolean {
  const h = host.toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(h)) return false;
  return list.some((a) => h === a || h.endsWith(`.${a}`));
}

function pageAllowed(host: string, extra: string[]): boolean {
  return hostMatches(host, PAGE_HOSTS) || extra.includes(host.toLowerCase());
}

function imageAllowed(host: string, extra: string[]): boolean {
  return (
    hostMatches(host, PAGE_HOSTS) || hostMatches(host, IMAGE_HOSTS) || extra.includes(host.toLowerCase())
  );
}

/** ストア/SNS のページ。rel=icon が汎用ロゴなので og:image(実アイコン)を優先する。 */
const STORE_HOSTS = [
  "chromewebstore.google.com",
  "chrome.google.com",
  "addons.mozilla.org",
  "www.tampermonkey.net",
  "tampermonkey.net",
  "x.com",
  "twitter.com",
] as const;

function isStoreHost(host: string): boolean {
  const h = host.toLowerCase();
  return STORE_HOSTS.some((a) => h === a || h.endsWith(`.${a}`));
}

/**
 * HTML から候補を優先度つきで集める。
 * 戻り値は { icons, ogImages } に分ける。
 *   - 通常サイト: rel=icon が本物のアイコン → icons を先に使う
 *   - ストア/SNS : rel=icon は汎用ロゴ、og:image が実アイコン → ogImages を先に使う
 */
function collectCandidates(html: string, base: string) {
  const out: { url: string; score: number }[] = [];
  const og: { url: string; score: number }[] = [];
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

  // ストア系ページは rel=icon が汎用ロゴなので、og:image / twitter:image を優先候補にする
  // (Chrome Web Store は拡張のアイコンを og:image に出す)
  // og:image は「アイコン/アバター」、twitter:image は「バナー」のことが多い
  // (実測: x.com のプロフィールは og:image=プロフィール画像200x200 / twitter:image=バナー)。
  // → og:image を優先し、twitter:image は控えめにする。
  const ogRe = /<meta\b[^>]*(?:property|name)\s*=\s*["'](og:image|twitter:image)["'][^>]*>/gi;
  let om: RegExpExecArray | null;
  while ((om = ogRe.exec(html))) {
    const which = (om[1] || "").toLowerCase();
    const content = (om[0].match(/\bcontent\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (!content) continue;
    // バナー画像は正方形アイコンに不向きなので候補から外す
    if (/profile_banners|\/banner/i.test(content)) continue;
    try {
      const url = new URL(content, base).toString();
      if (url.startsWith("http")) og.push({ url, score: which === "og:image" ? 14 : 11 });
    } catch {
      /* ignore */
    }
  }

  const byScore = (a: { score: number }, b: { score: number }) => b.score - a.score;
  return {
    icons: out.sort(byScore).map((c) => c.url),
    ogImages: og.sort(byScore).map((c) => c.url),
  };
}

/**
 * 画像の実寸を読む(PNG/JPEG のみ。読めなければ null)。
 * 20px のアイコン枠に 1200x630 の OG カードを入れると潰れて読めないので、
 * 「正方形に近いか」を判定してから採用する。
 */
function imageSize(buf: ArrayBuffer, type: string): { w: number; h: number } | null {
  const b = new Uint8Array(buf);
  try {
    // PNG: 8byte シグネチャ + IHDR
    if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
      const dv = new DataView(buf);
      return { w: dv.getUint32(16), h: dv.getUint32(20) };
    }
    // JPEG: SOFn セグメントを走査
    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = b[i + 1];
        // SOF0..SOF15 (DHT/DAC/RST は除外)
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          const h = (b[i + 5] << 8) | b[i + 6];
          const w = (b[i + 7] << 8) | b[i + 8];
          if (h > 0 && w > 0) return { w, h };
          return null;
        }
        const len = (b[i + 2] << 8) | b[i + 3];
        if (len <= 0) break;
        i += 2 + len;
      }
      return null;
    }
    // GIF / WebP / SVG は判定しない(ベクターやアイコン前提のことが多い)
    if (type.includes("svg")) return null;
    if (b.length > 10 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
      return { w: b[6] | (b[7] << 8), h: b[8] | (b[9] << 8) };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** アイコン枠に使ってよい形か(正方形に近い or 判定不能) */
function iconShaped(buf: ArrayBuffer, type: string): boolean {
  const s = imageSize(buf, type);
  if (!s) return true; // 判定できないものは許容(svg等)
  if (s.w <= 0 || s.h <= 0) return true;
  const ratio = s.w / s.h;
  return ratio >= 0.72 && ratio <= 1.39;
}

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const extra = (process.env.FAVICON_EXTRA_HOSTS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // url が来たらそのページを見る(拡張ストア等)。無ければ host のルート。
  const rawUrl = (sp.get("url") || "").trim();
  let pageUrl: URL | null = null;
  if (rawUrl) {
    try {
      const u = new URL(rawUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("bad protocol");
      if (!pageAllowed(u.host, extra)) {
        return new NextResponse("host not allowed", { status: 403 });
      }
      pageUrl = u;
    } catch {
      return new NextResponse("bad url", { status: 400 });
    }
  } else {
    const host = (sp.get("host") || "").toLowerCase();
    if (!host) return new NextResponse("host or url required", { status: 400 });
    if (!pageAllowed(host, extra)) return new NextResponse("host not allowed", { status: 403 });
    pageUrl = new URL(`https://${host}/`);
  }

  const key = pageUrl.origin + pageUrl.pathname.replace(/\/$/, "") || pageUrl.origin;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < (hit.ok ? OK_TTL_MS : NG_TTL_MS)) {
    if (!hit.ok) return new NextResponse("no favicon", { status: 404 });
    return new NextResponse(hit.body, {
      headers: {
        "content-type": hit.type || "image/png",
        "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
        "access-control-allow-origin": "*",
        "x-favicon-key": key,
      },
    });
  }

  try {
    // 1) 対象ページの HTML から icon / og:image 候補を拾う
    const pageRes = await fetch(pageUrl, {
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: AbortSignal.timeout(9000),
      cache: "no-store",
      redirect: "follow",
    });
    const finalHost = new URL(pageRes.url).host;
    if (!pageAllowed(finalHost, extra)) throw new Error("redirected off-allowlist");
    const html = pageRes.ok ? await pageRes.text() : "";

    // 2) 候補を順に試す。通常サイトは rel=icon を最優先し、og:image(巨大なカード画像)は
    //    最後の手段にする(実測: nareaitter の rel=icon を差し置いて 1200x630 の OG カードが
    //    選ばれてしまい、20px の枠が潰れて見えた)。ストア/SNS は逆に og:image が実アイコン。
    const { icons, ogImages } = collectCandidates(html, pageRes.url || pageUrl.toString());
    const icoUrl = `${pageUrl.origin}/favicon.ico`;
    const tries = isStoreHost(pageUrl.host)
      ? [...ogImages, ...icons, icoUrl]
      : [...icons, icoUrl, ...ogImages];
    // 正方形に近い画像が見つかった時点で採用。横長カードしか無ければ最後に妥協採用する。
    let fallbackImage: { buf: ArrayBuffer; type: string } | null = null;

    const respond = (buf: ArrayBuffer, type: string, shaped: boolean) =>
      new NextResponse(buf, {
        headers: {
          "content-type": type,
          "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
          "access-control-allow-origin": "*",
          "x-favicon-key": key,
          "x-favicon-shaped": shaped ? "1" : "0",
        },
      });

    for (const url of tries) {
      try {
        const r = await fetch(url, {
          headers: { "user-agent": UA },
          signal: AbortSignal.timeout(8000),
          cache: "no-store",
          redirect: "follow",
        });
        if (!r.ok) continue;
        if (!imageAllowed(new URL(r.url).host, extra)) continue;
        const len = Number(r.headers.get("content-length") || 0);
        if (len > MAX_BYTES) continue;
        const buf = await r.arrayBuffer();
        if (buf.byteLength < 70) continue; // 空・エラーページを弾く
        if (buf.byteLength > MAX_BYTES) continue; // スクショ等の巨大画像は不要
        const type = r.headers.get("content-type") || "image/png";
        if (!/image\//.test(type) && !/octet-stream|icon/.test(type)) continue;

        if (iconShaped(buf, type)) {
          cache.set(key, { ok: true, at: Date.now(), body: buf, type });
          return respond(buf, type, true);
        }
        // 横長のカード画像など。他に候補が無ければこれを使う。
        if (!fallbackImage) fallbackImage = { buf, type };
      } catch {
        // 次の候補へ
      }
    }

    if (fallbackImage) {
      cache.set(key, { ok: true, at: Date.now(), body: fallbackImage.buf, type: fallbackImage.type });
      return respond(fallbackImage.buf, fallbackImage.type, false);
    }
    throw new Error("no candidate worked");
  } catch {
    cache.set(key, { ok: false, at: Date.now() });
    return new NextResponse("no favicon", { status: 404 });
  }
}
