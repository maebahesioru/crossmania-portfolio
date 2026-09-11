"use client";

import { APP_TOOLS, PROFILE, PROJECTS } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";
import { Favicon } from "./Favicon";
import { GlowCard, Reveal, SectionHeading } from "./ui";

export function Projects() {
  const { t, pick } = useI18n();

  return (
    <section className="shell py-14">
      <Reveal>
        <SectionHeading index="04" title={t("sec.projects")} sub={`${PROJECTS.length} projects`} id="projects" />
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <GlowCard className="group flex h-full flex-col">
              <div className="mb-3 flex items-start justify-between gap-2">
                {/* 左のマスは各サイトの favicon を自動取得して表示(取れなければ番号) */}
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-panel2">
                  <Favicon
                    url={p.url}
                    size={20}
                    fallback={<span className="font-mono text-xs text-accent2">{String(i + 1).padStart(2, "0")}</span>}
                  />
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] text-sub">{String(i + 1).padStart(2, "0")}</span>
                  <span className="chip">{pick(p.tag)}</span>
                </span>
              </div>
              <h3 className="text-[15px] leading-snug font-bold">{p.name}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-sub">{pick(p.desc)}</p>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center gap-1.5 border-t border-line pt-3.5 font-mono text-[11.5px] text-link"
              >
                <span className="truncate">{p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                <span className="transition group-hover:translate-x-1">↗</span>
              </a>
            </GlowCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <SectionHeading index="05" title={t("sec.tools")} sub={`${APP_TOOLS.length} tools`} id="tools" />
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {APP_TOOLS.map((tool, i) => (
          <Reveal key={tool.name} delay={i * 60}>
            <GlowCard className="flex h-full gap-4">
              {/* アイコンはリンク先サイトの favicon を自動取得(取れなければ従来の絵文字) */}
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-panel2 text-lg">
                <Favicon
                  url={tool.links[0]?.url ?? ""}
                  size={22}
                  fallback={<span aria-hidden>{["🤖", "🌍", "字", "↩", "🎬"][i] ?? "🧩"}</span>}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14.5px] font-bold leading-snug">{tool.name}</h3>
                  <span className="chip">{pick(tool.kind)}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-sub">{pick(tool.desc)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tool.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-line px-2.5 py-1 font-mono text-[11.5px] text-link transition hover:border-accent"
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            </GlowCard>
          </Reveal>
        ))}
      </div>

    </section>
  );
}

export function About() {
  const { t, pick, locale } = useI18n();

  return (
    <section className="shell py-14">
      <Reveal>
        <SectionHeading index="01" title={t("sec.about")} sub={`${PROFILE.name} / ${PROFILE.mbti}`} id="about" />
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Reveal className="panel p-6">
          <div className="flex flex-col gap-3.5">
            {PROFILE.intro.map((p, i) => (
              <p key={i} className="text-[14.5px] leading-[1.85] text-fg/90">
                {pick(p)}
              </p>
            ))}
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal className="panel p-5" delay={80}>
            <p className="label">{t("sec.oshi")}</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {PROFILE.oshi.map((o) => (
                <li key={o.name} className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${o.color}, color-mix(in srgb, ${o.color} 45%, #000))` }}
                  >
                    {o.name[0]}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {o.name}
                      <span className="ml-1.5 font-mono text-[11.5px] font-normal text-sub">{o.romaji}</span>
                    </span>
                    <span className="block truncate text-[11.5px] text-sub">{pick(o.from)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="panel p-5" delay={140}>
            <p className="label">{t("hero.birthday")} / {t("hero.mbti")}</p>
            <p className="mt-2 text-sm">{pick(PROFILE.birthday)}</p>
            <p className="mt-1 font-mono text-xs text-sub">
              MBTI: <span className="text-accent">{PROFILE.mbti}</span>
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Reveal className="panel p-5">
          <p className="label">{t("sec.hobbies")}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {PROFILE.hobbies.map((h) => (
              <li key={h.ja} className="chip">
                {pick(h)}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="panel p-5" delay={80}>
          <p className="label">{t("sec.games")}</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {PROFILE.games.map((g) => (
              <li key={g} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {g}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] text-sub">
            {locale === "ja" ? "HoI4 mod も作っています" : "I also build HoI4 mods."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
