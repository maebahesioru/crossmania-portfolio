"use client";

import { useEffect, useState } from "react";

/** Service Worker 登録 + オフライン通知(簡素) */
export function PwaRegister() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const onLoad = () => {
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      };
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad);
    }
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="fixed top-3 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-line bg-panel px-4 py-1.5 font-mono text-[11.5px] text-sub shadow-xl">
      ⚠ offline — キャッシュから表示中
    </div>
  );
}
