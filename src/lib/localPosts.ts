/**
 * このサイト内に直接書いた記事の一覧。
 *
 * ホームの抜粋と /blog の一覧が同じ配列を参照する（二重管理を避ける）。
 * 外部サービス(note / Qiita / 野獣ノート / X)に書いたものはここに入れない。
 * 外部の記事をまとめて並べると「独自コンテンツの無いリンク集」と見なされるため、
 * この配列はあくまでサイト内記事だけを扱う。
 */

export type LocalPost = {
  title: string;
  href: string;
  date: string;
  tag: string;
};

export const LOCAL_POSTS: LocalPost[] = [
  {
    title: "自宅サーバーのNext.jsが更新されない — 反映されない原因を4層に分けて潰す",
    href: "/blog/nextjs-deploy-not-reflecting",
    date: "2026-10-28",
    tag: "運用",
  },
  {
    title: "個人サイトのAdSense審査に2回落ちて分かった、文字数より先に見られる3つのこと",
    href: "/blog/adsense-rejection-content-audit",
    date: "2026-10-28",
    tag: "運用",
  },
  {
    title: "検索APIの代わりにSearXNGを自前で立てた話 — JSON APIと運用のつまずき",
    href: "/blog/self-hosted-searxng",
    date: "2026-10-28",
    tag: "インフラ",
  },
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
