"use client";

import { useEffect, useRef, useState } from "react";
import { SKILLS } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./ui";

/** Skills をローディング風プログレスバーで見せる */
export function Skills() {
  const { t, pick, locale } = useI18n();
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setStarted(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="shell py-14">
      <Reveal>
        <SectionHeading index="03" title={t("sec.skills")} sub={`${SKILLS.length} items / 人前スケール`} id="skills" />
      </Reveal>

      <div ref={ref} className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="panel p-5">
          <div className="mb-4 flex items-center justify-between font-mono text-[11.5px] text-sub">
            <span>▚ loading profile…</span>
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${started ? "bg-emerald-400" : "bg-amber-400"} blink`} />
              {started ? (locale === "ja" ? "完了" : "ready") : t("loading")}
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {SKILLS.map((s, i) => (
              <SkillRow key={s.name} name={s.name} level={s.level} note={pick(s.note)} delay={i * 140} started={started} />
            ))}
          </div>
        </Reveal>

        <Reveal className="panel flex flex-col gap-5 p-5" delay={120}>
          <div>
            <p className="label">{locale === "ja" ? "スケール" : "scale"}</p>
            <p className="mt-2 text-sm leading-relaxed text-sub">
              {locale === "ja"
                ? "0.0人前(未経験)〜1.0人前(一人前)で自己申告したものです。伸びしろは無限大。"
                : "Self-reported on a 0.0 (no experience) to 1.0 (fully capable) scale. Room to grow: infinite."}
            </p>
          </div>
          <div>
            <p className="label">{locale === "ja" ? "よく使うもの" : "toolbox"}</p>
            <ul className="mt-2.5 flex flex-col gap-2 text-[13px]">
              {(locale === "ja"
                ? ["Next.js / React / Tailwind CSS", "TypeScript / Node.js / bun", "Python (スクレイピング・自動化)", "Debian 13 (自宅鯖・Coolify)", "Chrome拡張 / ユーザースクリプト"]
                : ["Next.js / React / Tailwind CSS", "TypeScript / Node.js / bun", "Python (scraping & automation)", "Debian 13 (home server, Coolify)", "Chrome extensions / userscripts"]
              ).map((x) => (
                <li key={x} className="flex items-start gap-2 text-sub">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent2" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <span className="chip">HTML 0.7</span>
            <span className="chip">JS/TS 0.5</span>
            <span className="chip">Python 0.4</span>
            <span className="chip">Linux 0.3</span>
            <span className="chip">CSS 0.2</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SkillRow({
  name,
  level,
  note,
  delay,
  started,
}: {
  name: string;
  level: number;
  note: string;
  delay: number;
  started: boolean;
}) {
  const pct = Math.round(level * 100);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now() + delay;
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - t0) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * pct));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, delay, pct]);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-2 font-mono text-sm">
          {name}
          {note ? <span className="text-[11.5px] text-sub">({note})</span> : null}
        </span>
        <span className="font-mono text-xs tabular-nums text-sub">
          <span className="text-accent2">{shown}%</span> · {(shown / 100).toFixed(1)}人前
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full border border-line bg-panel2">
        <div
          className="skill-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent2"
          style={{ width: started ? `${pct}%` : 0, transitionDelay: `${delay}ms` }}
        />
        <div className="absolute inset-0 opacity-40 [background:repeating-linear-gradient(90deg,transparent_0_6px,var(--bg)_6px_8px)]" />
      </div>
    </div>
  );
}
