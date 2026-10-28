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

      <section className="mt-12 max-w-3xl space-y-6 text-[13.5px] leading-relaxed">
        <div className="space-y-3">
          <h2 className="display text-xl sm:text-2xl">このブログについて</h2>
          <p className="text-sub">
            書いているのは、自宅サーバーとLinuxまわりで実際に詰まったことです。
            動いた手順だけを並べた記事はなるべく書かないようにしていて、
            原因が分からなかった時間、切り分けた順番、間違っていた仮説も残すようにしています。
            同じところで詰まっている人が、検索から来て「次に何を確認すればいいか」だけ持って帰れる記事を狙っています。
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="display text-xl sm:text-2xl">扱っている範囲</h2>
          <ul className="list-disc space-y-1 pl-5 text-sub">
            <li>自宅サーバー・コンテナ・デプロイ（反映されない、落ちる、遅い）</li>
            <li>Linuxデスクトップ（日本語入力、音、GPU、Wine）</li>
            <li>小さなWebサービスの設計（認証、レート制限、データの持ち方）</li>
            <li>手元のGPUで動かす系（音源分離、画像・音声の処理）</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="display text-xl sm:text-2xl">更新と構成</h2>
          <p className="text-sub">
            更新は不定期です。何かを直している最中に「これは書いておくべきだ」と思ったときだけ増えます。
            サイト自体はNext.jsで作り、自宅サーバーのコンテナ上で動かしています。
            記事はすべて静的なHTMLとして生成しているので、広告や外部スクリプトが無くても読めます。
            誤りを見つけたときは、XのDMか掲示板から教えてもらえれば直します。
          </p>
        </div>
      </section>
    </div>
  );
}
