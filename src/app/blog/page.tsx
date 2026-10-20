import type { Metadata } from "next";
import Link from "next/link";
import { BlogCount, BlogExplorer } from "@/components/BlogExplorer";
import { BLOG } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Blog",
  description: "note / Qiita / Zenn / 野獣ノート / X に書いた記事の一覧と検索。",
};

/** このサイト内に書いた記事（外部リンク集とは別枠で先頭に表示する） */
const LOCAL_POSTS = [
  {
    title: "WineでWindowsアプリの「クリックが効かない」を描画ライブラリまで追った話",
    href: "/blog/wine-app-hit-testing",
    date: "2026-10-20",
    tag: "デバッグ",
  },
  {
    title: "Arch系Linuxで日本語IMEを乗り換えた話 — インストーラ・既定IM・辞書の3つの罠",
    href: "/blog/linux-ime-fcitx5",
    date: "2026-10-20",
    tag: "環境構築",
  },
  {
    title: "GPUでボーカル分離を自宅に置いた話 — 音源分離モデルをミドルレンジGPUで回す",
    href: "/blog/local-vocal-separation-gpu",
    date: "2026-10-20",
    tag: "音声処理",
  },
  {
    title: "Cloudflare Tunnelで自宅サーバーを公開する — 運用で踏んだ落とし穴と対策",
    href: "/blog/cloudflare-tunnel-pitfalls",
    date: "2026-10-15",
    tag: "ネットワーク",
  },
  {
    title: "匿名投票サイトの不正対策をどう設計するか — トークン・レート制限・連投ブロックの実際",
    href: "/blog/anonymous-vote-anti-abuse",
    date: "2026-10-15",
    tag: "設計",
  },
  {
    title: "小さなホームラボのメモリがカツカツになった話 — zram・swap・犯人探しの手順",
    href: "/blog/homelab-memory-pressure",
    date: "2026-10-15",
    tag: "運用",
  },
  {
    title: "第1回ツイッタラー衆院選を支えた技術の話",
    href: "/blog/twitter-election-tech",
    date: "2026-10-12",
    tag: "技術",
  },
  {
    title: "N100の小さなサーバーで個人開発サービスを10本以上動かす話",
    href: "/blog/homelab-n100",
    date: "2026-10-12",
    tag: "インフラ",
  },
  {
    title: "AIエージェントと二人三脚で個人開発をしている話",
    href: "/blog/ai-agent-development",
    date: "2026-10-12",
    tag: "AI",
  },
  {
    title: "El Encuentro 2026: el evento Solana del año llega a Madrid",
    href: "/blog/encuentro-2026",
    date: "2026-10-07",
    tag: "イベント",
  },
];

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
          このサイトに直接書いた記事と、note・Qiita・Zenn・野獣ノート・X
          に書いたものを1か所にまとめました。新しい記事は自動で取り込みます。
        </p>

        <div className="mt-8 border-y border-[var(--line)]">
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
      <BlogExplorer />
    </>
  );
}
