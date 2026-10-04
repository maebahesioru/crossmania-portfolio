"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const KEY = "crossmania-cookie-consent";

/**
 * Google Consent Mode v2 に同意状態を伝える。
 * 既定はすべて denied(layout の consent-default で設定済み)。
 * 「同意する」を選んだときだけ広告用 Cookie を許可する。
 */
function applyConsent(granted: boolean) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  const v = granted ? "granted" : "denied";
  w.gtag("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
}

export function CookieConsent() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (!saved) {
        const id = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(id);
      }
      // 以前の選択を Consent Mode に反映する(既定は denied のまま)
      applyConsent(saved === "all");
    } catch {
      /* ignore */
    }
  }, []);

  const decide = (v: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
    applyConsent(v === "all");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
      <div className="panel mx-auto flex max-w-4xl flex-col gap-3 p-4 shadow-2xl sm:flex-row sm:items-center">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent/25 to-accent2/25 text-lg">
          🍪
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold">{t("cookie.title")}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-sub">
            {t("cookie.body")}{" "}
            <Link href="/terms" className="link">
              {t("cookie.more")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide("essential")}
            className="rounded-full border border-line px-4 py-2 text-xs whitespace-nowrap text-sub transition hover:border-accent hover:text-fg"
          >
            {t("cookie.essential")}
          </button>
          <button
            type="button"
            onClick={() => decide("all")}
            className="rounded-full bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-xs font-bold whitespace-nowrap text-white transition hover:opacity-90"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
