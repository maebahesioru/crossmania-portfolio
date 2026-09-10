import { NextResponse } from "next/server";
import { GITHUB_USER } from "@/lib/site";

export const dynamic = "force-dynamic";

const TTL_MS = 10 * 60 * 1000;

type GhPayload = {
  profile: { login: string; name: string | null; avatar: string; bio: string | null; repos: number; followers: number; following: number; createdAt: string };
  events: { type: string; repo: string; at: string; detail: string }[];
  fetchedAt: string;
};

let cache: { at: number; data: GhPayload } | null = null;

const DETAIL: Record<string, string> = {
  PushEvent: "push",
  CreateEvent: "create",
  IssuesEvent: "issues",
  IssueCommentEvent: "issue comment",
  PullRequestEvent: "pull request",
  WatchEvent: "starred",
  ForkEvent: "forked",
  ReleaseEvent: "released",
  PublicEvent: "made public",
  DeleteEvent: "deleted",
  CommitCommentEvent: "commit comment",
};

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) return NextResponse.json({ ...cache.data, cached: true });

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "crossmania-portfolio",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };

  try {
    const [uRes, eRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers, cache: "no-store" }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`, { headers, cache: "no-store" }),
    ]);
    if (!uRes.ok) throw new Error(`user ${uRes.status}`);
    const u = (await uRes.json()) as {
      login: string; name: string | null; avatar_url: string; bio: string | null;
      public_repos: number; followers: number; following: number; created_at: string;
    };
    const raw = eRes.ok
      ? ((await eRes.json()) as {
          type: string; created_at: string; repo: { name: string };
          payload?: { commits?: { message: string }[]; action?: string; ref_type?: string; ref?: string; size?: number };
        }[])
      : [];

    const events = raw.slice(0, 12).map((e) => {
      const label = DETAIL[e.type] ?? e.type.replace(/Event$/, "").toLowerCase();
      let detail = label;
      if (e.type === "PushEvent" && e.payload?.commits?.length) {
        detail = e.payload.commits[0].message.split("\n")[0].slice(0, 90);
      } else if (e.payload?.action) {
        detail = `${label} · ${e.payload.action}`;
      }
      return { type: e.type, repo: e.repo.name, at: e.created_at, detail };
    });

    const data: GhPayload = {
      profile: {
        login: u.login,
        name: u.name,
        avatar: u.avatar_url,
        bio: u.bio,
        repos: u.public_repos,
        followers: u.followers,
        following: u.following,
        createdAt: u.created_at,
      },
      events,
      fetchedAt: new Date().toISOString(),
    };
    cache = { at: Date.now(), data };
    return NextResponse.json(data);
  } catch (e) {
    if (cache) return NextResponse.json({ ...cache.data, cached: true, stale: true });
    return NextResponse.json({ error: `GitHubの情報を取得できませんでした: ${(e as Error).message}` }, { status: 502 });
  }
}
