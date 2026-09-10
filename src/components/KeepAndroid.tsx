"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const URL_KEEP = "https://keepandroidopen.org/ja/";

/** keepandroidopen.org の「Androidは閉鎖的なプラットフォームになろうとしています」ヘッダー */
export function KeepAndroidBanner() {
  const { t } = useI18n();
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="relative w-full overflow-hidden border-b border-line bg-gradient-to-r from-[#0b3d2e] via-[#116b3a] to-[#0b3d2e] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(45deg,transparent_0_14px,rgba(255,255,255,.06)_14px_28px)]" />
      <div className="shell relative flex items-center gap-3 py-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#3ddc84] font-bold text-[#07301d]">
          🤖
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight sm:text-sm">
          {t("keepandroid.text")}
        </p>
        <a
          href={URL_KEEP}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold whitespace-nowrap backdrop-blur transition hover:bg-white hover:text-[#07301d]"
        >
          {t("keepandroid.cta")} →
        </a>
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label={t("close")}
          className="shrink-0 text-white/60 transition hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
