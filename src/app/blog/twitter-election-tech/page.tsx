import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "第1回ツイッタラー衆院選を支えた技術の話",
  description:
    "1万人以上が立候補するオンライン選挙を、自宅サーバーでどう作ったか。市区町村境界に沿った300選挙区マップ、サン＝ラグ方式、毎時の情勢スナップショット、掲示板のリッチ化まで、裏側の設計をまとめました。",
  alternates: { canonical: "/blog/twitter-election-tech" },
};

export default function ElectionTechPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        第1回ツイッタラー衆院選を支えた技術の話
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-12 · 個人開発 / 技術記事</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            2026年10月10日、登録者1万人超の匿名投票サイト
            「ツイッタラー世論調査」で、第1回ツイッタラー衆院選が開幕しました。
          </strong>{" "}
          総選挙を中止して始まったこのイベントは、全登録者が自動で候補者になり、実際の
          選挙制度に近いルールで議席を争うという、ちょっと変わった2週間の企画です。
        </p>
        <p>
          ここでは、この選挙を成立させるためにやった技術の話を書いておきます。派手な
          機械学習もブロックチェーンもなく、必要なのは「地味なデータ整備」と「毎日止まらない運用」でした。
        </p>

        <h2 className="display text-xl sm:text-2xl">議席設計: 1994年の制度を再現する</h2>
        <p>
          せっかくリアルな選挙シミュレーションをするなら、定数もそれっぽくしたい。ということで、
          <strong>衆議院は300小選挙区+比例212の合計512議席</strong>(1994年の選挙制度改革で生まれた
          300選挙区+比例という骨格をベースにしています)、
          <strong>参議院は1970〜2000年当時の47選挙区152+比例100=252議席</strong>を採用しました。
        </p>
        <p>
          小選挙区は1位当選(好き票+1・嫌い票-0.5)、比例はサン=ラグ方式で党の得票から配分し、
          党内は得票順の名簿で当選——という本格ルールです。参議院は非拘束名簿式にしました。
        </p>

        <h2 className="display text-xl sm:text-2xl">
          いちばん大変だったのは「地図」だった
        </h2>
        <p>
          選挙区ページには日本地図を表示して、当選者が確定した区から色が塗られていく演出を
          入れています。ここで問題になったのが、手元にあった選挙区ポリゴンデータが289区
          (2022年時点の現実の区割り)しかなかったこと。
        </p>
        <p>
          しかも、足りない11区を最初は「多角形を直線で2分割」という手抜きで作ったら、
          「そんな区割りはおかしい、市区町村の境に沿わせて」と当然の指摘が入り、作り直しになりました。
          最終的には
          <strong>
            共同通信が公開している「市区町村×選挙区」のオープンデータから、実際の市区町村境界に
            沿った11区を生成
          </strong>
          するパイプラインを組み直しています。投影法の微妙なズレ補正(メルカトル図法の当てはめ)、
          北海道だけ元データと系統が違う問題など、地図データの落とし穴は記事一本分ありました。
        </p>

        <h2 className="display text-xl sm:text-2xl">毎時スナップショットで「情勢」を見せる</h2>
        <p>
          開票中は「党勢の推移グラフ」や「注目の接戦区」を表示していますが、これらは
          <strong>1時間ごとに議席状況をDBに記録するスナップショット基盤</strong>
          の上に成り立っています。この定期処理はメインPCとは別の小型サーバー(N100)側のcronで動かしていて、
          万が一メインPCが落ちても記録は進み続ける構成です。
        </p>

        <h2 className="display text-xl sm:text-2xl">
          掲示板には技術を盛り込みすぎた
        </h2>
        <p>
          リアルタイムの議論の場として、管理スレ(掲示板)や人物ページのコメント欄には:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Markdown</strong>(太字・リスト・引用・表・リンクカード)と
            <strong>2ch互換の色タグ</strong>
          </li>
          <li>
            <strong>LaTeX数式(KaTeX)</strong> と <strong>Mermaidの図</strong>
            (```mermaid コードブロックがそのまま図になる)
          </li>
          <li>
            <strong>レス番号と &gt;&gt;アンカー</strong>、返信のスレッド表示、レス内検索
          </li>
          <li>
            既読管理+新着ジャンプ、アンカーのホバープレビュー、スクリーンショットなしで済む
            レス単体リンク共有
          </li>
          <li>
            <strong>&#33;dice 2d6</strong> みたいなコマンド(乱数は本文から決定的に生成するので、
            誰が見ても同じ結果になる)
          </li>
        </ul>
        <p>
          ユーザー投稿はすべて sanitize を通し、MermaidやKaTeXのような重い処理は
          必要なときだけ遅延読み込みする——「盛りたい」と「軽くしたい」の戦いでした。
        </p>

        <h2 className="display text-xl sm:text-2xl">運用: 不正対策とノーログの両立</h2>
        <p>
          開幕後、特定ページへの組織的な一斉投票が観測されました。こうした投票は
          「そのページに初めて来た1票だけ」などの行動パターンから検知し、
          <strong>退避テーブルに移して後から無効化できる仕組み</strong>を作っています
          (誤検知しても戻せるようにしています)。
        </p>
        <p>
          一方で、IPアドレスはそもそも保存していません。レート制限はメモリ上だけで完結させ、
          アクセスログも切る。匿名・無法地帯というサイトの性格上、「何かあったときに記録を見せる」
          運用はしない、というのが一貫した方針です。
        </p>

        <h2 className="display text-xl sm:text-2xl">おわりに</h2>
        <p>
          選挙はまだ開票期間中です。この規模のイベント運用は初めてでしたが、
          「データを正しく整えて、小さく継続する」だけで、ここまでリアルなものを作れるのだなと
          自分でも思いました。結果が出たら、また振り返りを書くかもしれません。
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
          <a
            href="https://tsuittara-yoron.hikamers.app/election"
            className="underline underline-offset-2"
            rel="noopener"
          >
            第1回ツイッタラー衆院選
          </a>
        </p>
      </article>
    </div>
  );
}
