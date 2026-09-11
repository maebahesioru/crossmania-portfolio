"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, PROFILE } from "@/lib/profile";
import { useI18n, type TKey } from "@/lib/i18n";
import { THEMES, useTheme, type ThemeName } from "@/lib/theme";

const THEME_LABEL: Record<ThemeName, TKey> = {
  light: "theme.light",
  darkblue: "theme.darkblue",
  black: "theme.black",
};
/* テーマのアイコンは絵文字ではなく SVG。
   ⚠️ "☀"(U+2600) は天気の「快晴 ☀️」と同じ符号位置なので、
      Twemoji を当てると片方だけ絵になる。SVG なら天気側だけが絵文字のまま揃う。 */
const THEME_GLYPH: Record<ThemeName, ReactNode> = {
  // 太陽
  light: (
    <>
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1.1v1.7M8 13.2v1.7M1.1 8h1.7M13.2 8h1.7M3.12 3.12l1.2 1.2M11.68 11.68l1.2 1.2M12.88 3.12l-1.2 1.2M4.32 11.68l-1.2 1.2" />
    </>
  ),
  // 半分だけ塗られた円
  darkblue: (
    <>
      <circle cx="8" cy="8" r="5.3" />
      <path d="M8 2.7a5.3 5.3 0 0 1 0 10.6z" fill="currentColor" stroke="none" />
    </>
  ),
  // 塗りつぶした円
  black: <circle cx="8" cy="8" r="5.3" fill="currentColor" stroke="none" />,
};

function ThemeGlyph({ theme, size = 15 }: { theme: ThemeName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      aria-hidden
      className="shrink-0"
    >
      {THEME_GLYPH[theme]}
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<null | "theme" | "lang">(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-navpop]")) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl" : "border-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent2 text-[15px] font-black text-white shadow-lg">
            十
            <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-emerald-400" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serifjp text-[15px] font-extrabold tracking-tight">十字架_mania</span>
            <span className="mt-0.5 font-mono text-[11.5px] tracking-[0.2em] text-sub">PORTFOLIO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                  active ? "text-fg" : "text-sub hover:text-fg"
                }`}
              >
                {t(n.key as TKey)}
                {active ? (
                  <span className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-accent to-accent2" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* テーマ */}
          <div className="relative" data-navpop>
            <button
              type="button"
              onClick={() => setMenu((m) => (m === "theme" ? null : "theme"))}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs text-sub transition hover:border-accent hover:text-fg"
              aria-label={t("nav.theme")}
            >
              <ThemeGlyph theme={theme} />
              <span className="hidden sm:inline">{t(THEME_LABEL[theme])}</span>
            </button>
            {menu === "theme" ? (
              <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
                {THEMES.map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => {
                      setTheme(th);
                      setMenu(null);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-panel2 ${
                      th === theme ? "text-accent" : "text-sub"
                    }`}
                  >
                    <ThemeGlyph theme={th} />
                    {t(THEME_LABEL[th])}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* 言語 */}
          <div className="relative" data-navpop>
            <button
              type="button"
              onClick={() => setMenu((m) => (m === "lang" ? null : "lang"))}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 font-mono text-xs text-sub transition hover:border-accent hover:text-fg"
              aria-label={t("nav.lang")}
            >
              🌐 {locale.toUpperCase()}
            </button>
            {menu === "lang" ? (
              <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
                {(["ja", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLocale(l);
                      setMenu(null);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-panel2 ${
                      l === locale ? "text-accent" : "text-sub"
                    }`}
                  >
                    {l === "ja" ? "🇯🇵 日本語" : "🇬🇧 English"}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-sub transition hover:border-accent hover:text-fg lg:hidden"
            aria-label={t("nav.menu")}
            aria-expanded={open}
          >
            <span className="flex flex-col gap-1">
              <span className={`block h-0.5 w-4 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-panel lg:hidden">
          <div className="shell flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-2 py-3 text-sm text-sub hover:bg-panel2 hover:text-fg">
                {t(n.key as TKey)}
              </Link>
            ))}
            <a
              href={`https://x.com/${PROFILE.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2 py-3 text-sm text-link"
            >
              X / @{PROFILE.handle}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
