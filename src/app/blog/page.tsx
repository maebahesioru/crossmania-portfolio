import type { Metadata } from "next";
import { BlogExplorer } from "@/components/BlogExplorer";
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
          <span className="ml-3 font-sans text-sm font-normal tracking-wide text-sub">{BLOG.length} posts</span>
        </h1>
        <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-sub">
          note・Qiita・ビーストノート・X に書いたものを1か所にまとめました。タイトルとソースで検索できます。
        </p>
      </div>
      <BlogExplorer />
    </>
  );
}
