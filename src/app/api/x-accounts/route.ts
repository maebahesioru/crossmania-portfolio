import { NextResponse } from "next/server";
import { X_ACCOUNTS } from "@/lib/profile";

export const dynamic = "force-dynamic";

export type XAccount = {
  handle: string;
  ok: boolean;
  name?: string;
  followers?: number;
  following?: number;
  tweets?: number;
  likes?: number;
  avatar?: string;
  banner?: string;
  description?: string;
  protected?: boolean;
  verified?: boolean;
  joined?: string;
  error?: string;
};

const TTL_MS = 10 * 60 * 1000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let cache: { at: number; data: Record<string, XAccount> } | null = null;

/** アイコンは _normal(48px) なので大きいサイズに差し替える */
function bigAvatar(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/_(normal|bigger|mini)(\.[a-z]+)$/i, "_400x400$2");
}

async function fetchOne(handle: string): Promise<XAccount> {
  try {
    const res = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(handle)}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (res.status === 404) return { handle, ok: false, error: "not found" };
    if (!res.ok) return { handle, ok: false, error: `upstream ${res.status}` };
    const j = (await res.json()) as {
      code?: number;
      message?: string;
      user?: {
        name?: string;
        screen_name?: string;
        followers?: number;
        following?: number;
        tweets?: number;
        likes?: number;
        avatar_url?: string;
        banner_url?: string;
        description?: string;
        protected?: boolean;
        joined?: string;
        verification?: { verified?: boolean } | boolean;
      };
    };
    const u = j.user;
    if (j.code !== 200 || !u) return { handle, ok: false, error: j.message || `code ${j.code}` };
    const verified =
      typeof u.verification === "boolean" ? u.verification : Boolean(u.verification?.verified);
    return {
      handle,
      ok: true,
      name: u.name,
      followers: u.followers,
      following: u.following,
      tweets: u.tweets,
      likes: u.likes,
      avatar: bigAvatar(u.avatar_url),
      banner: u.banner_url,
      description: (u.description || "").slice(0, 200),
      protected: u.protected,
      verified,
      joined: u.joined,
    };
  } catch (e) {
    return { handle, ok: false, error: (e as Error).message };
  }
}

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(
      { accounts: cache.data, fetchedAt: new Date(cache.at).toISOString(), cached: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const list = await Promise.all(X_ACCOUNTS.map(fetchOne));
  const data: Record<string, XAccount> = {};
  for (const a of list) data[a.handle] = a;
  // 全部失敗した時は古いキャッシュを保持(一時的なAPI障害で表示を壊さない)
  if (list.some((a) => a.ok)) cache = { at: Date.now(), data };

  return NextResponse.json(
    { accounts: data, fetchedAt: new Date().toISOString(), cached: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
