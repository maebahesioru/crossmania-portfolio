"use client";

import { useMemo, useState } from "react";
import { BLOG, SOURCES, type SourceKey } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./ui";

const ALL: SourceKey[] = ["note", "qiita", "beastnote", "x"];

export function BlogExplorer({ compact = false, limit }: { compact?: boolean; limit?: number }) {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const [src, setSrc] = useState<SourceKey | "all">("all");
  const [expand, setExpand] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return BLOG.filter((p) => {
      if (src !== "all" && p.source !== src) return false;
      if (!query) return true;
      return p.title.toLowerCase().includes(query) || SOURCES[p.source].label.toLowerCase().includes(query);
    });
  }, [q, src]);

  /** 絞り込み中は「もっと見る」で隠さない(検索結果は全部出す) */
  const filtering = q.trim() !== "" || src !== "all";
  const base = limit ?? 6;
  const collapsed = compact && !expand && !filtering;
  const shown = collapsed ? filtered.slice(0, base) : filtered;
  const hiddenCount = filtered.length - shown.length;

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: BLOG.length };
    for (const p of BLOG) m[p.source] = (m[p.source] ?? 0) + 1;
    return m;
  }, []);

  return (
    <section className="shell py-14">
      {!compact ? (
        <Reveal>
          <SectionHeading index="06" title={t("sec.blog")} sub={`${BLOG.length} posts`} id="blog" />
        </Reveal>
      ) : (
        <Reveal>
          <SectionHeading index="06" title={t("sec.blog")} sub={`${BLOG.length} posts / note · Qiita · ビーストノート · X`} id="blog" />
        </Reveal>
      )}

      {/* 検索枠 */}
      <Reveal className="mt-6">
        <div className="panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-sub">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("blog.search")}
              className="w-full pl-9"
              aria-label={t("blog.search")}
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-1.5 text-xs text-sub hover:text-fg"
                aria-label={t("close")}
              >
                ✕
              </button>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSrc("all")}
              className={`rounded-full border px-3 py-1 text-xs whitespace-nowrap transition ${
                src === "all" ? "border-accent text-accent" : "border-line text-sub hover:text-fg"
              }`}
            >
              {t("blog.all")} <span className="font-mono text-[11.5px]">{counts.all}</span>
            </button>
            {ALL.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSrc(s)}
                className={`rounded-full border px-3 py-1 text-xs whitespace-nowrap transition ${
                  src === s ? "border-accent text-accent" : "border-line text-sub hover:text-fg"
                }`}
              >
                {SOURCES[s].label} <span className="font-mono text-[11.5px]">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <p className="mt-3 font-mono text-[11.5px] text-sub">
        {filtered.length} {t("blog.count")}
        {q ? ` — "${q}"` : ""}
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {shown.map((p, i) => (
          <li key={p.url}>
            <Reveal delay={Math.min(i * 40, 300)}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="card group flex items-start gap-3 p-4">
                <span
                  className="mt-0.5 shrink-0 rounded px-2 py-0.5 font-mono text-[11.5px] font-bold text-white"
                  style={{ background: SOURCES[p.source].color }}
                >
                  {SOURCES[p.source].label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] leading-snug font-medium group-hover:text-link">{p.title}</span>
                  <span className="mt-1 block truncate font-mono text-[11.5px] text-sub">
                    {p.url.replace(/^https?:\/\//, "").slice(0, 64)}
                  </span>
                </span>
                <span className="shrink-0 text-sub transition group-hover:translate-x-0.5 group-hover:text-link">↗</span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="panel mt-4 p-6 text-center text-sm text-sub">{t("blog.noresult")}</p>
      ) : null}

      {compact && !filtering && (hiddenCount > 0 || expand) ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpand((v) => !v)}
            aria-expanded={expand}
            className="rounded-full border border-line px-5 py-2 text-sm text-sub transition hover:border-accent hover:text-fg"
          >
            {expand ? t("blog.less") : `${t("blog.more")} (${hiddenCount})`}
          </button>
        </div>
      ) : null}

      {!compact ? (
        <p className="mt-4 text-xs text-sub">
          {locale === "ja"
            ? "note / Qiita / ビーストノート / X に書いたものをまとめて検索できます。"
            : "Search everything I've written on note, Qiita, Beast Note and X."}
        </p>
      ) : null}
    </section>
  );
}
