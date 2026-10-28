import Link from "next/link";
import { LOCAL_POSTS } from "@/lib/localPosts";

/**
 * トップページ用の「サイト内記事」抜粋。
 *
 * 以前は外部サービス(note / Qiita / 野獣ノート / X)の記事を自動収集して並べていたが、
 * 独自本文を持たないリンクの羅列になり、サイトのコンテンツ面として不適切だったため廃止した。
 * ここはサイト内の記事だけを、日付とタイトルで並べる。
 */
export function LocalPosts({ limit = 6 }: { limit?: number }) {
  const posts = LOCAL_POSTS.slice(0, limit);

  return (
    <section className="shell py-14">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="label">Blog</p>
          <h2 className="display mt-2 text-2xl sm:text-3xl">書いたもの</h2>
        </div>
        <Link
          href="/blog"
          className="text-[12px] tracking-wide text-sub underline underline-offset-4 hover:text-[var(--fg)]"
        >
          すべて見る ({LOCAL_POSTS.length})
        </Link>
      </div>

      <div className="mt-6 max-w-3xl border-y border-[var(--line)]">
        {posts.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex items-baseline gap-4 border-b border-[var(--line)] py-3 last:border-b-0"
          >
            <span className="shrink-0 text-[11px] tabular-nums tracking-wide text-sub">
              {p.date}
            </span>
            <span className="text-[14px] leading-snug group-hover:underline underline-offset-2">
              {p.title}
            </span>
            <span className="label ml-auto shrink-0">{p.tag}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
