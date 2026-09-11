"use client";

import { useEffect, useRef, useState } from "react";
import { SKILLS, SKILL_GROUPS, type Skill } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./ui";

/** Skills をローディング風プログレスバーで見せる */
/** 行ごとの開始遅延とバーの伸びる時間(完了判定と共有する) */
const ROW_DELAY_MS = 140;
const BAR_DURATION_MS = 900;

/**
 * 表示用のグループ。バーの開始遅延は**一覧全体で通し**にする
 * (グループごとに 0 から数えると、下のグループが上のと同時に伸びてガタつく)。
 */
const GROUPS = (() => {
  const out: {
    kind: Skill["kind"];
    label: { ja: string; en: string };
    rows: { skill: Skill; delay: number }[];
  }[] = [];
  let i = 0;
  for (const g of SKILL_GROUPS) {
    const items = SKILLS.filter((s) => s.kind === g.kind);
    if (!items.length) continue;
    out.push({
      kind: g.kind,
      label: g.label,
      rows: items.map((skill) => ({ skill, delay: i++ * ROW_DELAY_MS })),
    });
  }
  return out;
})();

export function Skills() {
  const { t, pick, locale } = useI18n();
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

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

  // 「完了」はバーが伸び切ってから出す(到達時点で出すと未完了なのに完了表示になる)
  useEffect(() => {
    if (!started) return;
    const total = (SKILLS.length - 1) * ROW_DELAY_MS + BAR_DURATION_MS;
    const id = setTimeout(() => setDone(true), total + 120);
    return () => clearTimeout(id);
  }, [started]);

  return (
    <section className="shell py-14">
      <Reveal>
        <SectionHeading index="03" title={t("sec.skills")} sub={`${SKILLS.length} items / 人前スケール`} id="skills" />
      </Reveal>

      {/* ⚠️ items-start で各パネルを内容の高さにする。既定(stretch)だと、行数が増えた
          左パネルに合わせて右パネルが引き伸ばされ、中央に数百pxの空白ができる。 */}
      <div ref={ref} className="mt-7 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="panel p-5">
          <div className="mb-4 flex items-center justify-between font-mono text-[11.5px] text-sub">
            <span>▚ loading profile…</span>
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-400" : "bg-amber-400"} blink`} />
              {done ? (locale === "ja" ? "完了" : "ready") : t("loading")}
            </span>
          </div>

          {/* ⚠️ グループは横並びにする。縦に積むと左パネルだけ 700px 近くになり、
              右パネル(スケール+ツールボックス)との間に数百pxの空白ができる。
              グループを列にすると高さが半分になり、右パネルとほぼ揃う。 */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            {GROUPS.map((g) => (
              <div key={g.kind} className="flex flex-col gap-5">
                <p className="label">{pick(g.label)}</p>
                {g.rows.map(({ skill, delay }) => (
                  <SkillRow
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    note={pick(skill.note)}
                    delay={delay}
                    started={started}
                  />
                ))}
              </div>
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
            {/* ⚠️ ここを手書きしないこと。SKILLS に足したのに片方だけ古いままになる事故が起きる */}
            {SKILLS.map((s) => (
              <span key={s.name} className="chip">
                {s.name} {s.level}
              </span>
            ))}
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
  const [progress, setProgress] = useState(0);

  // 数字とバーを同じ進捗値から描く(別々のアニメーションだと必ずズレて「変」に見える)
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now() + delay;
    const dur = BAR_DURATION_MS;
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - t0) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, delay]);

  const shown = Math.round(progress * pct);
  const width = progress * pct;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-2 font-mono text-sm">
          {name}
          {note ? <span className="text-[11.5px] text-sub">({note})</span> : null}
        </span>
        <span className="font-mono text-xs tabular-nums text-sub">
          <span className="text-accent2">{shown}%</span> · {(shown / 100).toFixed(2).replace(/0$/, "")}人前
        </span>
      </div>
      <div className="skill-track h-2.5 rounded-full border border-line bg-panel2">
        <div
          className="skill-fill absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${width}%`,
            // グラデーションは「トラック幅」を基準に固定する。バーごとに完走させると
            // 20%のバーも70%のバーも同じ色分布になり、色が値を表さなくなる。
            // background-size を (100 / 幅%) 倍にすると、細いバーでも同じ色スケールを切り取る。
            backgroundImage: "linear-gradient(90deg, var(--accent), var(--accent-2))",
            backgroundSize: width > 0 ? `${(10000 / width).toFixed(3)}% 100%` : "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* 塗りバーの上に別レイヤーの模様を重ねない(縞が塗りを分断して壊れて見える) */}
      </div>
    </div>
  );
}
