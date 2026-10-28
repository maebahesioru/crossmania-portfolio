import type { Metadata } from "next";
import Link from "next/link";
import { LOCAL_POSTS } from "@/lib/localPosts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "自宅サーバー・Linux・デバッグまわりで実際に踏んだことを、原因と手順まで書いた記事の一覧。",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="shell pt-10 pb-16">
      <p className="label">Blog index</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">
        Blog
        <span className="ml-3 font-sans text-sm font-normal tracking-wide text-sub">
          {LOCAL_POSTS.length} posts
        </span>
      </h1>
      <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-sub">
        このサイトに直接書いた記事だけを並べています。どれも実際に手を動かして詰まった話で、
        「何が起きたか」だけでなく「どう切り分けたか」「どこで間違えていたか」まで書くようにしています。
        外部サービス(note・Qiita など)に書いたものは各プロフィールから辿れます。
      </p>

      <div className="mt-8 max-w-3xl border-y border-[var(--line)]">
        {LOCAL_POSTS.map((p) => (
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
    </div>
  );
}
