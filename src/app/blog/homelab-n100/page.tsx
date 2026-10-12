import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "N100の小さなサーバーで個人開発サービスを10本以上動かす話",
  description:
    "手のひらサイズのミニPC(N100/32GB)1台で、投票サイト・画像板・検索・SNSミラーなど10以上のサービスを自宅から公開しています。構成、ドメイン管理、バックアップ、Torミラーまで、個人開発のインフラを全部書きました。",
  alternates: { canonical: "/blog/homelab-n100" },
};

export default function HomelabPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        N100の小さなサーバーで個人開発サービスを10本以上動かす話
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-12 · 自宅サーバー / インフラ</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            このサイトを含め、私が公開しているWebサービスはほぼ全部、自宅に置いた
            手のひらサイズのミニPC 1台で動いています。
          </strong>{" "}
          スペックは Intel N100(4コア) + メモリ32GB。消費電力はアイドル時10W前後で、
          電気代は月に数百円です。この記事では、その小さなマシンの上で何をどう動かしているかをまとめます。
        </p>

        <h2 className="display text-xl sm:text-2xl">動いているもの一覧</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>ツイッタラー世論調査</strong>(Next.js + PostgreSQL)—
            登録1万人超の投票サイト。いまは選挙イベントで毎分投票が飛んできます
          </li>
          <li>
            <strong>馴れ合いサークル(馴れ合い表)</strong> — Xの交流関係をグリッド表示するツール
          </li>
          <li>
            <strong>ヒカマー8values</strong> — 政治思想診断のコミュニティ版
          </li>
          <li>
            <strong>画像板(ブール)</strong> — 自作のタグ検索付き画像ボード
          </li>
          <li>
            <strong>検索エンジン(SearXNG)</strong> — 自分用のメタ検索
          </li>
          <li>
            <strong>翻訳API</strong> — 多言語対応のためにNLLBモデルをCPUで自前ホスト
          </li>
          <li>
            <strong>自動化(n8n)</strong> — 通知や定期処理のワークフロー
          </li>
          <li>
            <strong>このポートフォリオ</strong> — 見ての通り
          </li>
          <li>ほか、Bot数体と定期ジョブ(cron)が10本以上</li>
        </ul>
        <p>
          これだけ詰め込んでも、N100のCPUは普段30%以下、メモリもまだ余っています。個人開発の
          規模なら、小型PC1台で十分すぎるのだと毎日実感しています。
        </p>

        <h2 className="display text-xl sm:text-2xl">なぜ自宅サーバーなのか</h2>
        <p>
          理由は主に3つです。
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>コスト</strong>: クラウドで同じことをやると月数千円〜。電気代数百円の世界に住みたい
          </li>
          <li>
            <strong>検閲耐性</strong>: 匿名投票所のようなサイトは、プラットフォームの都合で
            消されないことが大事。ドメインとサーバーを自分で握る
          </li>
          <li>
            <strong>勉強になる</strong>: Docker・リバースプロキシ・DNS・TLS・バックアップ、
            インフラの全部を実地で覚えられる
          </li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">構成: PaaSを自分でホストする</h2>
        <p>
          デプロイには <strong>Coolify</strong>(セルフホストできるPaaS)を使っています。Gitにpushしたら
          Dockerコンテナをビルドして差し替え、TLS証明書も勝手に更新してくれる——Herokuのような体験を
          自宅でやる感じです。HTTPSの公開は <strong>Cloudflare Tunnel</strong> 経由なので、
          ルーターのポートを開ける必要すらありません。
        </p>
        <p>
          アプリは全部Dockerコンテナで、DB(PostgreSQL)や検索エンジンも同様。1台のマシン上で
          20以上のコンテナが平和に共存しています。異常時はコンテナ単位で直せるので、
          小さく運用するのにDockerは本当に便利です。
        </p>

        <h2 className="display text-xl sm:text-2xl">止まらないための小ネタ集</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>バックアップ</strong>: DBダンプとファイルを毎朝別ディスクへ。これがないと
            検閲耐性も何もない
          </li>
          <li>
            <strong>死活監視</strong>: ヘルスチェックを5分おきのcronで回して、おかしければ再起動
          </li>
          <li>
            <strong>スナップショット</strong>: 選挙イベント中は毎時、議席状況をDBに記録。
            後から「あの時点の情勢」をグラフにできる
          </li>
          <li>
            <strong>Torミラー</strong>: 主要サイトは .onion でも公開。ドメインが死んでも、
            検閲圏からも届く場所を確保しています
          </li>
          <li>
            <strong>データはローカルに</strong>: バックアップ含め、外部サービスに依存しすぎない
          </li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">おわりに</h2>
        <p>
          「個人開発のインフラ」と聞くと大げさですが、実体は小さな箱1台とcronの山です。
          特別なものは何もなくて、強いて言えば「毎日ちゃんと動くように作る」ことだけを
          大事にしています。もし自宅サーバーに興味がある人がいたら、
          N100クラスのミニPCから始めるのをおすすめします。安い・静か・省電力・十分速い、の4冠です。
        </p>
        <p className="text-[13px] text-sub">
          ▼ 関連:{" "}
          <a
            href="https://tsuittara-yoron.hikamers.app"
            className="underline underline-offset-2"
            rel="noopener"
          >
            ツイッタラー世論調査
          </a>
          {" / "}
          <a href="/mirror" className="underline underline-offset-2">
            ミラーページ
          </a>
        </p>
      </article>
    </div>
  );
}
