import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "自宅サーバーのNext.jsが更新されない — 反映されない原因を4層に分けて潰す",
  description:
    "デプロイしたはずなのに古いページが出る。原因は push・デプロイ・ビルドキャッシュ・エッジキャッシュの4層のどこかにあり、層を分けないと一生たどり着けません。実際に踏んだ順に、切り分けの手順を書きます。",
  alternates: { canonical: "/blog/nextjs-deploy-not-reflecting" },
};

export default function NextjsDeployNotReflectingPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        自宅サーバーのNext.jsが更新されない — 反映されない原因を4層に分けて潰す
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-28 · 運用</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            自宅サーバーでNext.jsを動かしていると、必ず「デプロイしたのに古いページが出る」に当たります。
          </strong>{" "}
          これが厄介なのは、原因が1つではないことです。コミットが届いていない、デプロイが走っていない、
          ビルドキャッシュが古い、前段のCDNが古い。どれも症状はまったく同じ「更新されない」になります。
          闇雲に再デプロイを繰り返すと、運良く直ることもありますが、次に同じことが起きたときに
          また同じ時間を捨てることになります。
        </p>
        <p>
          なので、確認する順番を固定しました。下流から疑うと時間が溶けるので、
          <strong>上流から1層ずつ潰す</strong>のがコツです。
        </p>

        <h2 className="display text-xl sm:text-2xl">層1: pushが本当に届いているか</h2>
        <p>
          最初に踏んだのがこれでした。ローカルではコミットできているのに、
          デプロイ基盤がビルドしているのは1つ前のコミット。
          <code>git push</code>を実行したとき、ブランチのupstreamが未設定だと失敗します。
          ところがエディタのUIから操作していると、その失敗が見えないまま次の作業に進んでしまい、
          「pushした」という記憶だけが残ります。
        </p>
        <p>
          確認は2つの値を並べるだけです。ローカルの<code>git rev-parse HEAD</code>と、
          リモートの<code>git ls-remote origin master</code>。この2つが違えば、
          その時点でデプロイを疑う必要はありません。
          初回だけ<code>git push --set-upstream origin master</code>で明示的に紐づけておくと、
          以降は素の<code>git push</code>が通ります。
        </p>
        <p>
          もう1つの落とし穴が、<strong>違うブランチにpushしている</strong>パターンです。
          ローカルでは<code>main</code>、リモートのビルド設定は<code>master</code>を見ている、といった状態。
          これは<code>git status -sb</code>の1行目（<code>## master...origin/master</code>）を見る習慣を
          つけるだけで防げます。
        </p>

        <h2 className="display text-xl sm:text-2xl">層2: デプロイが走り、そのコミットを掴んだか</h2>
        <p>
          pushが正しくても、デプロイが走っていないことがあります。
          セルフホストのデプロイ基盤は「Git連携で自動ビルド」と「APIから手動トリガー」の両方を
          持っていることが多く、<strong>片方だけ設定されている</strong>ケースが普通にあります。
        </p>
        <p>
          ここで見るべきは「成功したか」ではなく「<strong>どのコミットをビルドしたか</strong>」です。
          デプロイの一覧には、だいたい<code>commit</code>や<code>revision</code>のフィールドがあります。
          これが自分のHEADのSHAと一致していなければ、成功していても意味がありません。
          一致していない場合は、トリガーした対象（アプリのUUIDなのか、デプロイのUUIDなのか）を
          取り違えていることが多いです。ポーリング先を間違えると「見つからない」が返り続けるので、
          ここで詰まると無限に待つことになります。
        </p>

        <h2 className="display text-xl sm:text-2xl">層3: ビルドキャッシュ</h2>
        <p>
          commitが一致しているのに挙動が変わらない場合、次はビルド成果物を疑います。
          Next.jsはビルドキャッシュを積極的に使うので、
          <strong>依存関係の解決結果や設定の変更が反映されない</strong>ことがあります。
          特に<code>output: standalone</code>で動かしていると、古い<code>.next</code>がそのまま
          コンテナに入り、コードだけ新しくなって設定が古い、という噛み合わせの悪い状態が作れます。
        </p>
        <p>
          切り分けは単純で、キャッシュを使わないビルドを1回走らせるだけです。
          それで直るなら原因はここで確定です。
          「再起動しただけ」では直らないのもこの層の特徴で、
          コンテナの再起動はプロセスを立て直すだけで、イメージの中身は変わりません。
        </p>

        <h2 className="display text-xl sm:text-2xl">層4: 前段のキャッシュ</h2>
        <p>
          ここまで全部正しくても、まだ古いページが出ることがあります。
          リバースプロキシやCDNがエッジで返している場合です。
          Cloudflareを前段に置いているなら、レスポンスヘッダの<code>cf-cache-status</code>を見れば
          <code>HIT</code>なのか<code>MISS</code>なのかが分かります。
        </p>
        <p>
          確認するときは、URLに意味のないクエリを1つ足してキャッシュキーを変えます。
          <code>?cb=</code>にランダムな数字を付けて開き、それで新しい内容が出るなら、
          アプリケーションは正しくてエッジが古い、と一発で確定します。
          逆にクエリを付けても古いままなら、疑うべきは層3より上です。
        </p>

        <h2 className="display text-xl sm:text-2xl">チェックリスト</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code>git rev-parse HEAD</code>と<code>git ls-remote origin master</code>が一致しているか
          </li>
          <li>ビルドされたコミットのSHAが、そのHEADと一致しているか</li>
          <li>キャッシュ無効のビルドで直るか（直るならビルドキャッシュ）</li>
          <li>
            <code>?cb=</code>付きで直るか（直るならエッジキャッシュ）
          </li>
          <li>「再起動」と「再ビルド」を混同していないか</li>
        </ul>
        <p>
          この4層を上から順に見るようにしてから、原因不明のまま再デプロイを繰り返すことが
          なくなりました。地味ですが、デプロイ周りで一番効く習慣だと思っています。
        </p>
      </article>
    </div>
  );
}
