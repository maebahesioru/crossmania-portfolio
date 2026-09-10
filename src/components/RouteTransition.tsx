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

  useEffect(() => {
    if (pathname === key) return;
    setSweeping(true);
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
      <div key={key} className="page-fade">
        {children}
      </div>
    </>
  );
}
