"use client";

import { useEffect, useState } from "react";
import { GITHUB_USER } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

type Gh = {
  profile: { login: string; avatar: string; bio: string | null; repos: number; followers: number; following: number; createdAt: string };
  events: { type: string; repo: string; at: string; detail: string }[];
  fetchedAt: string;
  cached?: boolean;
  error?: string;
};

const TYPE_ICON: Record<string, string> = {
  PushEvent: "⇡",
  CreateEvent: "＋",
  IssuesEvent: "◉",
  IssueCommentEvent: "💬",
  PullRequestEvent: "⇄",
  WatchEvent: "★",
  ForkEvent: "⑂",
  ReleaseEvent: "🏷",
  PublicEvent: "🌐",
  DeleteEvent: "✕",
};

function rel(iso: string, locale: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return locale === "ja" ? `${m}分前` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return locale === "ja" ? `${h}時間前` : `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return locale === "ja" ? `${d}日前` : `${d}d ago`;
  return new Date(iso).toLocaleDateString("ja-JP");
}

export function GithubActivity() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<Gh | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/github", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.error) setErr(j.error);
        else setData(j);
      })
      .catch(() => alive && setErr(t("github.error")));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="label">{t("sec.github")}</span>
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11.5px] text-link"
        >
          @{GITHUB_USER} ↗
        </a>
      </div>

      {err ? (
        <p className="p-5 text-sm text-sub">{err}</p>
      ) : !data ? (
        <div className="flex flex-col gap-2 p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 rounded-lg shimmer bg-panel2" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center">
            {[
              [data.profile.repos, t("github.repos")],
              [data.profile.followers, t("github.followers")],
              [data.profile.following, t("github.following")],
            ].map(([v, label]) => (
              <div key={String(label)} className="px-2 py-3">
                <div className="font-mono text-lg tabular-nums text-accent2">{Number(v).toLocaleString()}</div>
                <div className="mt-0.5 text-[11.5px] text-sub">{label as string}</div>
              </div>
            ))}
          </div>

          <ul className="max-h-[320px] overflow-y-auto">
            {data.events.length === 0 ? (
              <li className="p-5 text-sm text-sub">{t("github.empty")}</li>
            ) : (
              data.events.map((e, i) => (
                <li key={`${e.at}-${i}`} className="flex items-start gap-2.5 border-b border-line px-4 py-2.5 last:border-b-0">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-panel2 font-mono text-[11.5px] text-accent">
                    {TYPE_ICON[e.type] ?? "•"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <a
                      href={`https://github.com/${e.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate font-mono text-[12px] text-link"
                    >
                      {e.repo}
                    </a>
                    <span className="mt-0.5 block truncate text-[11.5px] text-sub">{e.detail}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11.5px] text-sub">{rel(e.at, locale)}</span>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}
