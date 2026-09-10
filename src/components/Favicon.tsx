"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * サイトURLから favicon を自動取得して表示する。
 * 取得は自前の /api/favicon(解決+キャッシュ)経由。失敗したら fallback(番号など)を出すので
 * 「壊れた画像アイコン」が出ることはない。
 *
 * ⚠️ onError だけでは不十分(実測)。サーバー描画された <img> はハイドレーション前に
 *    読み込みが終わることがあり、その間に失敗すると React のハンドラがまだ無いため
 *    エラーイベントが捨てられる → 番号に戻らず壊れた画像が残る。
 *    → マウント時に「既に失敗していたか」を自分で確認する。
 */
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
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // complete かつ naturalWidth 0 = ハイドレーション前に失敗していた
    // (lazy読み込みで未着手の場合は complete=false なので誤判定しない)
    if (el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  let host = "";
  try {
    host = new URL(url).host;
  } catch {
    host = "";
  }

  if (failed || !host) return <>{fallback ?? null}</>;

  return (
    // 外部サイトのfaviconを自前APIで中継するので next/image は使わない(最適化対象外)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={`/api/favicon?host=${encodeURIComponent(host)}`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
