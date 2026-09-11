"use client";

/**
 * `/api/blog` の取得を1回にまとめて共有する小さなストア。
 *
 * ⚠️ 記事一覧(BlogExplorer)と見出しの件数(BlogCount)が別々に fetch すると、
 *    同じエンドポイントを2回叩くうえ、片方だけ更新されて**件数が食い違う**
 *    (実測: 見出しは profile.ts の静的件数 22、一覧は自動取得後の 29 とズレていた)。
 *    → モジュール内で1本の Promise を共有し、取得できたら購読者に配る。
 */
import type { BlogFeed } from "./blog";

let cache: BlogFeed | null = null;
let inflight: Promise<BlogFeed | null> | null = null;
const listeners = new Set<(feed: BlogFeed) => void>();

function load(): Promise<BlogFeed | null> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/blog")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: BlogFeed) => {
        if (!d || !Array.isArray(d.posts) || !d.posts.length) return null;
        cache = d;
        for (const fn of listeners) fn(d);
        return d;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** 購読して取得を開始する。戻り値を呼ぶと解除。 */
export function subscribeBlogFeed(onData: (feed: BlogFeed) => void): () => void {
  listeners.add(onData);
  if (cache) onData(cache);
  else void load();
  return () => {
    listeners.delete(onData);
  };
}

/** すでに取得済みなら同期的に返す(SSR では null) */
export function peekBlogFeed(): BlogFeed | null {
  return cache;
}
