"use client";

import { HeroHeader } from "./HeroHeader";
import { ClockJST, SinceCounter } from "./ClockJST";
import { useI18n } from "@/lib/i18n";
import { PROFILE } from "@/lib/profile";
import { Reveal } from "./ui";
import { XIcon, GithubIcon, BlueskyIcon, QiitaIcon } from "./icons";

const QUICK = [
  { label: "X", url: `https://x.com/${PROFILE.handle}`, Icon: XIcon, color: "#1d9bf0" },
  { label: "GitHub", url: "https://github.com/maebahesioru", Icon: GithubIcon, color: "#8b949e" },
  { label: "Bluesky", url: "https://bsky.app/profile/maebahesioru.bsky.social", Icon: BlueskyIcon, color: "#0285ff" },
  { label: "Qiita", url: "https://qiita.com/maebahesioru", Icon: QiitaIcon, color: "#55c500" },
];

const TICKER = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Bun", "Node.js", "Python", "Debian 13", "N100 home server",
  "Docker", "MariaDB", "MediaWiki", "HoI4 modding", "Markov chain", "WebGL", "PWA", "Chrome Extension",
];

export function Hero() {
  const { t, locale } = useI18n();

  return (
    <section className="relative pt-6 pb-4">
      <div className="shell">
        <Reveal>
          <HeroHeader />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* お知らせ */}
          <Reveal className="flex h-full flex-col">
            <div className="panel relative flex h-full flex-col overflow-hidden p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="label">{t("announce.title")}</p>
                <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">NEW</span>
              </div>
              <p className="mt-2 text-[16.5px] leading-snug font-bold">{t("announce.body")}</p>
              <p className="mt-1.5 font-mono text-[11.5px] text-sub">{t("announce.date")}</p>

              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {QUICK.map((q) => (
                  <a
                    key={q.label}
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs transition hover:border-accent hover:text-fg"
                  >
                    <q.Icon className="h-3.5 w-3.5" style={{ color: q.color }} />
                    {q.label}
                    <span className="text-sub transition group-hover:translate-x-0.5">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="flex h-full flex-col gap-4">
            <ClockJST />
            <div className="panel flex flex-1 flex-wrap content-start gap-2 p-4">
              <span className="chip">{t("hero.role")}</span>
              <span className="chip">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("hero.status")}
              </span>
              <span className="chip">{t("hero.server")}</span>
              <span className="chip">MBTI {PROFILE.mbti}</span>
              <span className="chip">🍪 Cookie最小限</span>
            </div>
          </Reveal>

          <Reveal delay={160} className="flex h-full flex-col gap-4">
            <SinceCounter />
            <div className="panel flex flex-1 flex-col p-4">
              <p className="label">{t("sec.contents")}</p>
              <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[13px]">
                {[
                  ["#about", t("sec.about")],
                  ["#skills", t("sec.skills")],
                  ["#projects", t("sec.projects")],
                  ["#tools", t("sec.tools")],
                  ["#blog", t("sec.blog")],
                  ["#rig", t("sec.rig")],
                  ["#links", t("sec.links")],
                  ["#donate", t("sec.donate")],
                  ["#bbs", t("sec.bbs")],
                  ["#info", t("sec.client")],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="flex items-center gap-1.5 text-sub transition hover:text-link">
                      <span className="text-accent">›</span>
                      <span className="truncate">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="marquee mt-8 overflow-hidden border-y border-line bg-panel/40 py-3">
        <div className="marquee-track gap-8">
          {[...TICKER, ...TICKER].map((x, i) => (
            <span key={i} className="flex shrink-0 items-center gap-8 font-mono text-[11.5px] tracking-[0.2em] text-sub uppercase">
              {x}
              <span className="text-accent">◆</span>
            </span>
          ))}
        </div>
      </div>

      <p className="shell mt-3 font-mono text-[11.5px] text-sub">
        {locale === "ja" ? "↓ スクロールして中身を見る" : "↓ scroll for more"}
      </p>
    </section>
  );
}
