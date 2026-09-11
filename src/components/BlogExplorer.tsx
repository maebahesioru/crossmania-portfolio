"use client";

import { useEffect, useMemo, useState } from "react";
import { BLOG, SOURCES, type BlogPost, type SourceKey } from "@/lib/profile";
import type { BlogFeed } from "@/lib/blog";
import { subscribeBlogFeed } from "@/lib/blogFeed";
import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./ui";

const ALL: SourceKey[] = ["note", "qiita", "beastnote", "x"];

export function BlogExplorer({ compact = false, limit }: { compact?: boolean; limit?: number }) {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const [src, setSrc] = useState<SourceKey | "all">("all");
  const [expand, setExpand] = useState(false);
  /**
   * 記事一覧は /api/blog が note(RSS) / Qiita(Atom) / ビーストノート(公開一覧) / X(公開タイムライン)
   * から自動で集めてくる。SSR では profile.ts の既知一覧をそのまま描き、マウント後に
   * 差し替える — こうすると初回描画が空にならず、自動更新分だけが後から乗る。
   * 取得は blogFeed の共有ストア経由(見出しの件数表示と同じ1回のフェッチを共有する)。
   */
  const [feed, setFeed] = useState<BlogFeed | null>(null);

  useEffect(() => subscribeBlogFeed(setFeed), []);

  const posts: BlogPost[] = feed?.posts ?? BLOG;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (src !== "all" && p.source !== src) return false;
      if (!query) return true;
      return p.title.toLowerCase().includes(query) || SOURCES[p.source].label.toLowerCase().includes(query);
    });
  }, [q, src, posts]);

  /** 絞り込み中は「もっと見る」で隠さない(検索結果は全部出す) */
  const filtering = q.trim() !== "" || src !== "all";
  const base = limit ?? 6;
  const collapsed = compact && !expand && !filtering;
  const shown = collapsed ? filtered.slice(0, base) : filtered;
  const hiddenCount = filtered.length - shown.length;

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: posts.length };
    for (const p of posts) m[p.source] = (m[p.source] ?? 0) + 1;
    return m;
  }, [posts]);

  return (
    <section className="shell py-14">
      {!compact ? (
        <Reveal>
          <SectionHeading index="06" title={t("sec.blog")} sub={`${posts.length} posts`} id="blog" />
        </Reveal>
      ) : (
        <Reveal>
          <SectionHeading index="06" title={t("sec.blog")} sub={`${posts.length} posts / note · Qiita · ビーストノート · X`} id="blog" />
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

      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-sub">
        <span>
          {filtered.length} {t("blog.count")}
          {q ? ` — "${q}"` : ""}
        </span>
        {feed ? (
          <span className="flex items-center gap-1.5" title={t("blog.live")}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent2" aria-hidden />
            <span>{t("blog.auto")}</span>
            <span className="opacity-70">
              {t("blog.synced")} {feed.fetchedAt.slice(11, 16)} UTC
            </span>
          </span>
        ) : null}
        {/* 取れなかったソースだけ注記する(全部落ちた時に黙って古い一覧を出すのを避ける) */}
        {feed
          ? (Object.entries(feed.status) as [SourceKey, { ok: boolean; error?: string }][])
              .filter(([, s]) => !s.ok)
              .map(([k, s]) => (
                <span key={k} className="text-accent" title={s.error ?? ""}>
                  {SOURCES[k].label}: {t("blog.srcfail")}
                </span>
              ))
          : null}
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
                  <span className="mt-1 flex items-baseline gap-2 font-mono text-[11.5px] text-sub">
                    {p.date ? <span className="shrink-0 tabular-nums">{p.date.replace(/-/g, ".")}</span> : null}
                    <span className="truncate">{p.url.replace(/^https?:\/\//, "").slice(0, 56)}</span>
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

/**
 * 見出し用のライブ件数。
 * ⚠️ サーバー側で `BLOG.length` を焼き込むと、自動取得で記事が増えたときに
 *    「見出し 22 / 一覧 29」と食い違う(実測)。一覧と同じ共有フェッチから数える。
 */
export function BlogCount({ fallback }: { fallback: number }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => subscribeBlogFeed((f) => setN(f.posts.length)), []);
  return <>{n ?? fallback}</>;
}
