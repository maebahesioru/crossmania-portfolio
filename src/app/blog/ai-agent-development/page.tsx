import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIエージェントと二人三脚で個人開発をしている話",
  description:
    "選挙サイトの地図修正から掲示板のリッチ化、インフラ運用まで。AIエージェント(コーディングエージェント)を開発・運用の相棒として使うときの、任せ方と検証の作法を実例つきで書きます。",
  alternates: { canonical: "/blog/ai-agent-development" },
};

export default function AiAgentPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        AIエージェントと二人三脚で個人開発をしている話
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-12 · AI / 開発ワークフロー</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            最近の個人開発は、ほぼ全部AIエージェントと一緒にやっています。
          </strong>{" "}
          「コードを書いてもらう」というより、調査・実装・テスト・デプロイ・運用監視までを
          一続きで任せる使い方です。この記事では、実際にどう役に立っているかと、
          失敗しないための線引きを書いておきます。
        </p>

        <h2 className="display text-xl sm:text-2xl">
          実例1: 300選挙区の地図を「作り直せ」と言ったら本当に作り直った
        </h2>
        <p>
          選挙サイトの地図で「直線で割るな、市区町村の境に沿わせろ」と指示したとき、
          エージェントは
          <strong>
            「市区町村×選挙区」のオープンデータを探し出し、投影変換のズレを実測し、
            境界に沿った11区を生成するパイプラインを組み、DBの割り当てまで直して
          </strong>
          帰ってきました。人間がやったら丸一日かかる作業です。
        </p>
        <p>
          ポイントは、私が「どうやるか」を一切指定していないこと。ゴール(市区町村境界に沿った区割り)
          と制約(既存データとの整合)だけ伝えて、手段は任せました。
        </p>

        <h2 className="display text-xl sm:text-2xl">
          実例2: 掲示板のリッチ化を丸ごと一任
        </h2>
        <p>
          「掲示板にMarkdown・色・LaTeX・Mermaidを3つの板全部に入れて」と頼んだら、
          Markdownパーサの選定、XSSサニタイズ、既存のAA(アスキーアート)判定との衝突回避、
          ブラウザでの実機テストまで一気にやって、スクリーンショット付きで報告が来ました。
        </p>
        <p>
          こういう「既存の流儀を壊さずに機能を足す」仕事は、文脈さえ伝わっていれば
          エージェントの方が速くて正確だったりします。私はデザインの好み(好き=ピンク、嫌い=紫など)
          を伝えるだけです。
        </p>

        <h2 className="display text-xl sm:text-2xl">実例3: 運用も任せる</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>毎朝のDBバックアップと監視cronの整備</li>
          <li>不正投票の検知パターン設計と、退避→無効化の実装</li>
          <li>検索エンジン向けのサイトマップ整備や、bot向けレンダリングの設計</li>
          <li>アクセス解析を見ての改善提案(「このページが重い」→実測→修正)</li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">失敗しないための3つの作法</h2>
        <p>
          <strong>1. 検証は必ず実物で。</strong>「直した」という報告を信じる前に、
          本番URLを実際に叩いて確認します。エージェントの自己申告は当てにしない、
          というのが最初に覚えた教訓です。
        </p>
        <p>
          <strong>2. ノーと言うべき線を決めておく。</strong>デザインの好み、法的な判断、
          対外的な発信(勝手にSNSへ投稿しない等)は人間側の決定事項として明示します。
          全部任せると、意図と違う方向に最適化されていくことがあります。
        </p>
        <p>
          <strong>3. 大きな変更の前に一度止まる。</strong>解釈が分かれる指示は、
          実装前に確認を挟ませる。「言われた項目だけ変更する」ルールを守らせるだけで、
          余計な被害が激減しました。
        </p>

        <h2 className="display text-xl sm:text-2xl">おわりに</h2>
        <p>
          個人開発のボトルネックは、たいてい「手が足りない」ことです。AIエージェントを
          1人ぶんのチームメンバーとして扱えるようになってから、この規模のサービス群を
          1人で維持できるようになりました。うまく使うコツは、魔法を期待しないこと。
          地道に指示と検証を繰り返す、普通のマネジメントと同じでした。
        </p>
        <p className="text-[13px] text-sub">
          ▼ 関連:{" "}
          <a
            href="/blog/twitter-election-tech"
            className="underline underline-offset-2"
          >
            第1回ツイッタラー衆院選を支えた技術の話
          </a>
          {" / "}
          <a href="/blog/homelab-n100" className="underline underline-offset-2">
            N100の小さなサーバーで個人開発サービスを10本以上動かす話
          </a>
        </p>
      </article>
    </div>
  );
}
