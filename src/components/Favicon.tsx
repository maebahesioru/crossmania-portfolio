"use client";

import { useState, type ReactNode } from "react";

/**
 * サイトURLから favicon を自動取得して表示する。
 * 取得は自前の /api/favicon(解決+キャッシュ)経由。失敗したら fallback(番号など)を出すので
 * 「壊れた画像アイコン」が出ることはない。
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
