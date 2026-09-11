import { NextResponse } from "next/server";
import { collectBlog, type BlogFeed } from "@/lib/blog";

export const dynamic = "force-dynamic";

/**
 * note / Qiita / ビーストノート / X の記事一覧をまとめて返す。
 *
 * 外部サイトを毎リクエスト叩くと相手にも負荷がかかるので、結果をメモリに持つ。
 * 取得成功は 30 分、**全ソース失敗は 5 分**で切る(失敗を長く引くと、直したのに
 * いつまでも古いままになる。既存の favicon API と同じ考え方)。
 */
const TTL_OK = 30 * 60 * 1000;
const TTL_FAIL = 5 * 60 * 1000;

let cache: { at: number; data: BlogFeed } | null = null;

export async function GET() {
  const now = Date.now();
  if (cache) {
    const anyOk = Object.values(cache.data.status).some((s) => s.ok);
    const ttl = anyOk ? TTL_OK : TTL_FAIL;
    if (now - cache.at < ttl) {
      return NextResponse.json(cache.data, {
        headers: { "x-blog-cache": "hit", "cache-control": "no-store" },
      });
    }
  }

  try {
    const data = await collectBlog();
    // 全部落ちていたら前回の結果を返す(一時障害で一覧が空になるのを防ぐ)
    const anyOk = Object.values(data.status).some((s) => s.ok);
    if (!anyOk && cache) {
      return NextResponse.json(cache.data, {
        headers: { "x-blog-cache": "stale", "cache-control": "no-store" },
      });
    }
    cache = { at: now, data };
    return NextResponse.json(data, {
      headers: { "x-blog-cache": "miss", "cache-control": "no-store" },
    });
  } catch (e) {
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { "x-blog-cache": "stale", "cache-control": "no-store" },
      });
    }
    return NextResponse.json({ error: String(e).slice(0, 120) }, { status: 502 });
  }
}
