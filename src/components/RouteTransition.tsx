"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * ページ移動アニメーション。
 * ルート変更時に上部のスイープバー + 本文のフェードインを行う。
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const [sweeping, setSweeping] = useState(false);
  /**
   * フェードは**クライアント遷移のときだけ**。
   *
   * `.page-fade` は `animation: page-in ... both` なので、初回ロードでも
   * 本文全体が opacity:0 から始まり 0.55 秒かけて現れる。その間ページは
   * 「何も描かれていない」扱いになり、FCP がその分だけ後ろにずれる(実測 -550ms)。
   * 初回はアニメーションを付けず、そのまま描かせる。
   */
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (pathname === key) return;
    setSweeping(true);
    setAnimate(true);
    const tm = setTimeout(() => setKey(pathname), 120);
    const tm2 = setTimeout(() => setSweeping(false), 900);
    return () => {
      clearTimeout(tm);
      clearTimeout(tm2);
    };
  }, [pathname, key]);

  return (
    <>
      {sweeping ? <div className="sweep" aria-hidden /> : null}
      <div key={key} className={animate ? "page-fade" : undefined}>
        {children}
      </div>
    </>
  );
}
