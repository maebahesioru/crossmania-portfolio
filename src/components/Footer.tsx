"use client";

import Link from "next/link";
import { NAV, PROFILE, CONTACTS } from "@/lib/profile";
import { useI18n, type TKey } from "@/lib/i18n";
import { GithubIcon, XIcon } from "./icons";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-line bg-panel/40">
      <div className="shell grid grid-cols-1 gap-8 py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-serifjp text-lg font-extrabold">十字架_mania</p>
          <p className="mt-1.5 font-mono text-[11.5px] text-sub">{t("footer.self")}</p>
          <p className="mt-3 text-[12px] leading-relaxed text-sub">{t("footer.built")}</p>
          <div className="mt-3 flex gap-2">
            <a
              href={`https://x.com/${PROFILE.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-sub transition hover:border-accent hover:text-fg"
              aria-label="X"
            >
              <XIcon className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/maebahesioru"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-sub transition hover:border-accent hover:text-fg"
              aria-label="GitHub"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="label">Pages</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-sub transition hover:text-link">
                  {t(n.key as TKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label">Links</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
            {CONTACTS.slice(0, 8).map((c) => (
              <li key={c.label}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sub transition hover:text-link"
                >
                  <span className="truncate">{c.label}</span>
                  <span className="shrink-0 opacity-60">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-4 font-mono text-[11.5px] text-sub">
          <span>© {year} 十字架_mania — {t("footer.rights")}</span>
          <div className="flex items-center gap-4">
            <Link href="/license" className="link">
              WTFPL
            </Link>
            <Link href="/terms" className="link">
              {t("nav.terms")}
            </Link>
            <a href="#top" className="transition hover:text-fg">
              ↑ {t("footer.top")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
