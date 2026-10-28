import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "検索APIの代わりにSearXNGを自前で立てた話 — JSON APIと運用のつまずき",
  description:
    "汎用の検索APIは値上げ・レート制限・提供終了が続きます。メタ検索エンジンのSearXNGを自宅サーバーに置いて、検索の一次調査を自前で回すまでの手順と、JSONが返らない・エンジン単位で落ちるといった実際のつまずきをまとめました。",
  alternates: { canonical: "/blog/self-hosted-searxng" },
};

export default function SelfHostedSearxngPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        検索APIの代わりにSearXNGを自前で立てた話 — JSON APIと運用のつまずき
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-28 · インフラ</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            調べ物を自動化していると、検索そのものが一番のボトルネックになります。
          </strong>{" "}
          汎用の検索APIは、無料枠が縮小して有料プランへ移るか、
          レート制限が厳しくなって実用にならないかのどちらかです。
          そこでメタ検索エンジンのSearXNGを自宅サーバーに置きました。
          自分で立てれば、検索結果をJSONで取れて、呼び出し回数の上限も自分で決められます。
        </p>
        <p>
          ただし「立てるだけ」で終わらないのがこの手のミドルウェアの常で、
          <strong>JSONが返らない</strong>という最初の壁で1時間溶かしました。
          同じところで詰まる人がいそうなので、手順とつまずきを残します。
        </p>

        <h2 className="display text-xl sm:text-2xl">SearXNGとは何か</h2>
        <p>
          SearXNGは、複数の検索エンジンに同時に問い合わせて結果をまとめる
          <strong>メタ検索エンジン</strong>です。自分でホストする前提で作られていて、
          アカウントもAPIキーも要りません。
          検索行為が1社に集約されないという性格上、プライバシー重視の用途でよく使われますが、
          今回は「自分専用の検索エンドポイントが欲しい」という実用目的で導入しました。
        </p>

        <h2 className="display text-xl sm:text-2xl">
          手順: Docker Composeで立てる
        </h2>
        <p>
          配布物にはDocker Composeの定義が含まれているので、
          <code>docker compose up -d</code>で起動します。
          設定は<code>settings.yml</code>で、実運用ではここを触ることになります。
          最低限いじるのは次の3つです。
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code>search.formats</code>に<code>json</code>を追加（後述。これが最大の罠）
          </li>
          <li>
            <code>server.secret_key</code>をランダムな文字列に変更
          </li>
          <li>
            <code>server.limiter</code>と<code>botdetection</code>の方針（自前運用なら緩めでよい）
          </li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">
          つまずき1: JSONが返らない
        </h2>
        <p>
          起動直後、<code>/search?q=test&amp;format=json</code>を叩くと
          <strong>403</strong>が返りました。URLは合っているし、コンテナも上がっている。
          ここで「フォーマット指定の方法が違うのか」と無駄に試行錯誤しましたが、
          原因は設定側でした。
        </p>
        <p>
          SearXNGは<strong>出力フォーマットを明示的に許可制</strong>にしていて、
          既定では<code>html</code>しか有効になっていません。
          <code>settings.yml</code>の<code>search.formats</code>に<code>json</code>を足さない限り、
          どれだけ正しくURLを組み立てても拒否されます。
          設定を変えて再起動した瞬間に、あっさり通るようになりました。
        </p>
        <p>
          これはセキュリティ上の判断で、公開インスタンスのJSONを誰でも叩ける状態にすると
          スクレイピングの踏み台にされるためです。
          <strong>自前運用で、外から触られない場所に置く</strong>のが前提だと思っておいた方がいいです。
        </p>

        <h2 className="display text-xl sm:text-2xl">
          つまずき2: エンジン単位で落ちる
        </h2>
        <p>
          JSONが返るようになった後、特定のクエリだけ結果が0件になることがありました。
          これはSearXNG自体の不調ではなく、
          <strong>個々の検索エンジンがブロックされた</strong>パターンです。
          メタ検索はエンジンごとにHTMLを解析しているので、
          相手側のマークアップが変わると静かに壊れます。
        </p>
        <p>
          切り分けは、クエリの先頭に<code>!エンジン名</code>を付けて単体で叩くのが速いです。
          <code>!google キーワード</code>のように指定すると、そのエンジンだけを使います。
          特定エンジンだけ0件なら、そのエンジンが落ちていると確定できます。
          ログにも解析失敗が残るので、定期的に眺めておくと変化に気づけます。
        </p>

        <h2 className="display text-xl sm:text-2xl">つまずき3: 連打すると弾かれる</h2>
        <p>
          botdetectionは、同じ送信元からの短時間の連続アクセスを制限します。
          自分専用でも、スクリプトから数十回叩くと429が返ります。
          <strong>これは仕様であって不具合ではありません</strong>。
          対策は呼び出し側で間隔を空けることと、
          一度取った結果をキャッシュして同じクエリを投げ直さないことです。
        </p>
        <p>
          なお、User-Agentを付けずに叩くと弾かれることがあるので、
          スクリプトから呼ぶときは素直にブラウザ相当のUAを付けています。
        </p>

        <h2 className="display text-xl sm:text-2xl">自前検索を何に使っているか</h2>
        <p>
          一番役に立っているのが<strong>自分のサイトのインデックス確認</strong>です。
          <code>site:自分のドメイン</code>で検索して、記事が実際に拾われているかを見る。
          検索エンジンの管理画面を開かなくても、外から見た状態が分かります。
        </p>
        <p>
          ほかに、記事の重複チェック（同じ話題を二重に書いていないか）や、
          リンク切れの一次調査にも使っています。
          検索APIを課金で買う代わりに、1つのコンテナを置くだけで済むので、
          個人規模ならこちらの方が扱いやすいと感じています。
        </p>
        <p>
          ただし<strong>公開インスタンスのJSONを叩くのはやめた方がいい</strong>です。
          相手のサーバーに負荷をかける行為で、たいてい制限されています。
          使うなら自前で立てる。それが前提のソフトウェアだと思っています。
        </p>
      </article>
    </div>
  );
}
