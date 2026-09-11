"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * サイトURLから favicon を自動取得して表示する。
 * 取得は自前の /api/favicon(解決+キャッシュ)経由。失敗したら fallback(番号など)を出すので
 * 「壊れた画像アイコン」が出ることはない。
 *
 * ■ 下地を「必要なときだけ」敷く理由(実測で2回作り直した)
 *   faviconはサイトごとに色が全く違う。下地なしだと、背景と同系色のアイコンが溶けて見えなくなる
 *   (実測: sunsunsunday の「黒地に黄色い点」の .ico は黒テーマのカードに沈んで判別不能だった)。
 *   ただし全カードに下地を敷くと、暗色テーマで白いタイルが浮いて不自然になる(実測で指摘)。
 *   → アイコンの代表色とテーマ背景の「色差」を測り、足りないときだけ下地を敷く。
 *
 * ⚠️ 判定に輝度(明るさ)だけを使うと失敗する(実測)。青や赤のアイコンは輝度が低いため
 *    「暗いアイコン」と誤判定され、不要な白下地が敷かれてしまう。
 *    → RGBの距離(色差)で見る。彩度の違いも拾えるので、色付きアイコンは下地なしで済む。
 *
 * ■ onLoad / onError だけでは不十分(実測)
 *   サーバー描画された <img> はハイドレーション前に読み込みが終わることがあり、
 *   その間に失敗すると React のハンドラがまだ無いためイベントが捨てられる。
 *   → マウント時に「既に読み込みが終わっていたか」を自分で確認する。
 */
const LIGHT_PLATE = "rgba(255,255,255,0.92)"; // 背景に沈む暗いアイコン用
const DARK_PLATE = "rgba(0,0,0,0.18)"; // 背景に沈む明るいアイコン用
const MIN_COLOR_DIST = 0.28; // アイコン代表色と背景の色差がこれ未満なら「沈む」と判定
const MAX_DIST = 441.673; // sqrt(255^2 * 3)

type RGB = [number, number, number];

/** #rrggbb / #rgb / rgb() をパースする(テーマのCSS変数を読むため) */
function parseColor(s: string): RGB | null {
  const t = (s || "").trim();
  let m = t.match(/^#([0-9a-f]{3})$/i);
  if (m) {
    const [r, g, b] = [...m[1]].map((c) => parseInt(c + c, 16));
    return [r, g, b];
  }
  m = t.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const hex = m[1]; // クロージャ内では narrowing が効かないので const に退避
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
  }
  m = t.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1]
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    if (p.length >= 3 && p.slice(0, 3).every((n) => !Number.isNaN(n))) return [p[0], p[1], p[2]];
  }
  return null;
}

/** 正規化した色差(0〜1)。彩度の違いも拾えるので輝度より人間の見え方に近い */
function colorDistance(a: RGB, b: RGB): number {
  const d = Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
  return d / MAX_DIST;
}

/** テーマ背景色(カード地)を CSS 変数から取る。取れなければテーマ名でフォールバック */
function themeBg(): RGB {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--panel-2");
    const c = parseColor(v);
    if (c) return c;
  } catch {
    /* ignore */
  }
  const theme = document.documentElement.dataset.theme;
  return theme === "light" ? [245, 247, 252] : theme === "black" ? [16, 16, 19] : [17, 28, 51];
}

export function Favicon({
  url,
  size = 20,
  fallback,
  className = "",
}: {
  url: string;
  size?: number;
  fallback?: ReactNode;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [plate, setPlate] = useState<string | null>(null); // 下地色(測定後に決まる)
  const ref = useRef<HTMLImageElement | null>(null);

  /** アイコンの代表色と背景の色差を測り、沈む場合だけ下地を敷く */
  const decidePlate = () => {
    const el = ref.current;
    if (!el) return;
    try {
      const S = 16;
      const c = document.createElement("canvas");
      c.width = S;
      c.height = S;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, S, S);
      ctx.drawImage(el, 0, 0, S, S);
      const d = ctx.getImageData(0, 0, S, S).data;

      // 不透明画素を4bitに量子化して最頻色(=アイコンの地の色)を求める
      const hist = new Map<number, { n: number; r: number; g: number; b: number }>();
      let opaque = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] / 255 <= 0.5) continue;
        opaque++;
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        const cur = hist.get(key);
        if (cur) {
          cur.n++;
          cur.r += r;
          cur.g += g;
          cur.b += b;
        } else {
          hist.set(key, { n: 1, r, g, b });
        }
      }
      if (!opaque) return;
      let best = { n: 0, r: 0, g: 0, b: 0 };
      for (const v of hist.values()) if (v.n > best.n) best = v;
      const dominant: RGB = [Math.round(best.r / best.n), Math.round(best.g / best.n), Math.round(best.b / best.n)];

      const bg = themeBg();
      const dist = colorDistance(dominant, bg);
      if (dist >= MIN_COLOR_DIST) {
        setPlate(null); // 既にカード地と区別できるので下地は不要
        return;
      }
      // 沈む色なので、アイコンと反対の明るさの下地を敷く
      const iconLum = (0.299 * dominant[0] + 0.587 * dominant[1] + 0.114 * dominant[2]) / 255;
      const bgLum = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) / 255;
      // アイコンが暗ければ明るい下地、明るければ暗い下地(どちらも背景と差が出る方を選ぶ)
      setPlate(iconLum <= bgLum ? LIGHT_PLATE : DARK_PLATE);
    } catch {
      /* 測定できなければ下地なし */
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.complete) {
      if (el.naturalWidth === 0) setFailed(true);
      else decidePlate();
    }
  }, []);

  // 拡張ストアのようにアイコンがページ内にしか無い場合は url で詳細ページを見せる。
  // プロジェクトサイトのようにルートに favicon がある場合は host だけで十分。
  let host = "";
  let isPage = false;
  try {
    const u = new URL(url);
    host = u.host;
    // ルート以外を指しているなら、そのページを見に行く
    isPage = u.pathname !== "/" && u.pathname !== "";
  } catch {
    host = "";
  }

  if (failed || !host) return <>{fallback ?? null}</>;

  const src = isPage
    ? `/api/favicon?url=${encodeURIComponent(url)}`
    : `/api/favicon?host=${encodeURIComponent(host)}`;

  return (
    <span
      className="grid h-full w-full place-items-center"
      style={{ background: plate ?? "transparent" }}
      aria-hidden="true"
    >
      {/* 外部サイトのfaviconを自前APIで中継するので next/image は使わない(最適化対象外) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`shrink-0 object-contain ${className}`}
        style={{ width: size, height: size }}
        onLoad={decidePlate}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
