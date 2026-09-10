"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t, locale } = useI18n();
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-[11.5px] tracking-[0.3em] text-sub uppercase">error</p>
      <h1 className="display mt-3 text-7xl text-accent">404</h1>
      <p className="mt-4 text-[14px] text-sub">
        {locale === "ja" ? "このページは存在しないか、移動しました。" : "This page doesn't exist, or it moved somewhere else."}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-accent to-accent2 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          {t("nav.home")}
        </Link>
        <Link href="/blog" className="rounded-full border border-line px-5 py-2.5 text-sm text-sub transition hover:border-accent hover:text-fg">
          {t("nav.blog")}
        </Link>
        <Link href="/bbs" className="rounded-full border border-line px-5 py-2.5 text-sm text-sub transition hover:border-accent hover:text-fg">
          {t("nav.bbs")}
        </Link>
      </div>
    </div>
  );
}
