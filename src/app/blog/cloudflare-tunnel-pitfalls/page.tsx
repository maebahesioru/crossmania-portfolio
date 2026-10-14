import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloudflare Tunnelで自宅サーバーを公開する — 運用で踏んだ落とし穴と対策",
  description:
    "ポート開放なし・自宅IPを隠したままWebサービスを公開できるCloudflare Tunnel。実際に半年以上運用して踏んだ落とし穴(リクエストがランダムに失敗する怪現象とその正体、DNSとingressの2層構造、設定の一括管理)と対策をまとめます。",
  alternates: { canonical: "/blog/cloudflare-tunnel-pitfalls" },
};

export default function TunnelPitfallsPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        Cloudflare Tunnelで自宅サーバーを公開する — 運用で踏んだ落とし穴と対策
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-15 · 自宅サーバー / ネットワーク</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            自宅サーバーを公開するとき、いちばん安全なのは「ポートを一切開けない」方法です。
          </strong>{" "}
          ルーターのポート開放をすると、自宅のグローバルIPがそのまま世界に露出します。DDoSを受ければ回線ごと落ちるし、
          IPから住所の特定につながることもあります。そこで使っているのが
          <strong>Cloudflare Tunnel</strong>です。自宅サーバー側からCloudflareへ外向きのトンネルを張り、
          公開はCloudflareのエッジ経由で行う仕組みで、自宅IPは一切見えません。
        </p>

        <h2 className="display text-xl sm:text-2xl">仕組みはシンプル、でも層が多い</h2>
        <p>
          構成はこうです。ドメインをCloudflareで管理し、DNSのワイルドカードCNAMEをトンネルに向けます。
          自宅サーバーでは<code>cloudflared</code>というデーモンが常駐し、Cloudflareのエッジとの間で
          接続を維持します。Webサイト側はDocker + リバースプロキシ(Traefik)で複数サービスを振り分け、
          トンネルは「このホスト名は、このローカルポートへ」という対応表(ingress)に従って転送します。
        </p>
        <p>
          <strong>最初に混乱したのが「DNSとingressの2層構造」です。</strong>
          Cloudflare Tunnelでは、DNSレコード(名前解決)とingressルール(転送先)は完全に別物です。
          ワイルドカードDNSを張っておけば、どんなサブドメインも名前解決自体は成功してしまいます。
          しかしingressに対応表がなければ、Cloudflareが「404 Not Found」を返して終わり。
          つまり<strong>「新サブドメインを追加するときは、DNSは何もしなくていいが、ingressへの追記は必須」</strong>
          ということです。逆に、個別のDNSレコードが残っていても、ingressがなければ何も動きません。
          片方だけ見て「DNSは正しいのに動かない」と悩むのは時間の無駄なので、2層をセットで覚えておくのが大事です。
        </p>

        <h2 className="display text-xl sm:text-2xl">怪現象: リクエストがランダムに失敗する</h2>
        <p>
          運用が安定してきた頃、いちばん厄介な問題が起きました。
          <strong>
            サイトが「たまに」繋がらなくなるのです。リロードすれば直る。負荷の問題ではなさそう。
          </strong>
          ユーザーからは「たまにエラーになる」と報告が来るのに、こちらで何度試しても再現しない —
          これが「Failed to fetch」系のいちばん嫌なパターンです。
        </p>
        <p>
          調べるために<code>cloudflared</code>のログを数えたところ、衝撃の数字が出ました。
          <code>Failed to proxy HTTP: http2: stream closed</code>というエラーが
          <strong>24時間で数万件</strong>。つまり、リクエストのうち一部が毎分のように
          「トンネルの先で切れている」状態でした。1件1件は小さな失敗でも、ユーザーの体感としては
          「たまに壊れる不安定なサイト」になります。
        </p>
        <p>
          原因は<strong>cloudflaredとオリジン(自宅側のリバースプロキシ)の間のHTTP/2接続が不安定</strong>なことでした。
          cloudflaredの送信設定自体を更新しても直らず、最終的に効いたのは 
          Cloudflareのダッシュボード側の設定 — <strong>公開ホスト名ごとの「HTTP/2 connection to origin」の無効化</strong>です。
          これをオフにすると、cloudflaredはオリジンとの通信にHTTP/1.1を使うようになり、stream closedは
          文字通りゼロになりました。API経由で全ホスト名に一括適用できるので、ホスト名が多い環境では
          設定の一括書き換えをおすすめします。
        </p>

        <h2 className="display text-xl sm:text-2xl">運用で効いた小ネタ集</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>ひたすらログを数える</strong>: 「たまに失敗する」系は、エラーの
            <em>件数</em>を時間帯別に集計すると正体が見えます。1件ずつ追うより、まず数を数えるのが近道
          </li>
          <li>
            <strong>設定はAPIで管理する</strong>: トンネルの設定(ingress)はダッシュボードの手作業より、
            APIで「読む→一部分を書き換える→丸ごと書き戻す」方が安全です。ホスト名が数十個あると、
            手作業ではいつか壊します
          </li>
          <li>
            <strong>ワイルドカード証明書+DNSで証明書管理はほぼ不要</strong>: サブドメインを増やしても、
            TLS証明書の心配は基本的にありません
          </li>
          <li>
            <strong>自宅側のプロキシは「Hostヘッダで振り分け」</strong>: トンネルからは
            <code>http://localhost:80</code>のようにローカルに転送するだけ。サービス追加は
            プロキシのラベル追加で完結します
          </li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">まとめ</h2>
        <p>
          Cloudflare Tunnelは、家庭用回線でも本物のHTTPSサイトを安全に公開できる、
          個人開発にとって最高の道具です。ただし「設定はどこにあるか」が
          DNS・ingress・オリジン側の3層に分かれているので、トラブル時は
          「今どの層を見ているか」を常に意識するのがコツ。
          そして「たまに失敗する」ときは、ログの件数を数える — これだけで
          「24時間数万件のエラー」という答えにたどり着けます。
        </p>
        <p>
          ポート開放なし、固定IPなし、証明書管理なしでここまでできる時代なので、
          「自宅サーバーを公開したいけどセキュリティが怖い」という人は、
          まずトンネル方式から始めてみるのがおすすめです。
        </p>
      </article>
    </div>
  );
}
