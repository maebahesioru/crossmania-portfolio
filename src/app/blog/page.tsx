import type { Metadata } from "next";
import { BlogCount, BlogExplorer } from "@/components/BlogExplorer";
import { BLOG } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Blog",
  description: "note / Qiita / ビーストノート / X に書いた記事の一覧と検索。",
};

export default function BlogPage() {
  return (
    <>
      <div className="shell pt-10">
        <p className="label">Blog index</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">
          Blog
          {/* 件数は自動取得の結果に追従させる(静的リストの長さを焼き込むと一覧とズレる) */}
          <span className="ml-3 font-sans text-sm font-normal tracking-wide text-sub">
            <BlogCount fallback={BLOG.length} /> posts
          </span>
        </h1>
        <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-sub">
          note・Qiita・ビーストノート・X に書いたものを1か所にまとめました。新しい記事は自動で取り込みます。タイトルとソースで検索できます。
        </p>
      </div>
      <BlogExplorer />
    </>
  );
}
