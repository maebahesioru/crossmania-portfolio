import type { Metadata } from "next";
import { LicenseContent } from "@/components/License";

export const metadata: Metadata = {
  title: "ライセンス",
  description: "コードは WTFPL v2。コンテンツは 十字架_mania に帰属します。",
  alternates: { canonical: "/license" },
};

export default function LicensePage() {
  return (
    <>
      <LicenseContent />

      <section className="shell pb-16">
        <div className="mt-10 max-w-3xl space-y-7 text-[13.5px] leading-relaxed">
          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">WTFPL v2 で、実際に何ができるのか</h2>
            <p>
              上のライセンス文は一行でいうと「好きにしろ」です。条文が短いぶん、
              何が許されるのか分かりにくいので、実務で聞かれるところを先に書いておきます。
            </p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>商用利用は可能です。社内ツールでも、有料製品に組み込んでも構いません</li>
              <li>クレジット表記は不要です。書いてもらっても構いませんが、必須ではありません</li>
              <li>改変・削除・再配布は自由です。ライセンス文の同梱も求めていません</li>
              <li>
                代わりに<strong>無保証</strong>です。動かなくても、使った結果何か起きても、責任は負いません
              </li>
            </ul>
            <p>
              ただし、これは<strong>コードについてだけ</strong>の話です。次の節と混ざりやすいので、
              分けて読んでください。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">コードとコンテンツで扱いが違う理由</h2>
            <p>
              このサイトは、コードと文章で扱いを変えています。<strong>コードは再利用してほしい、
              文章は書いた人のもの</strong>という線引きです。ページを組み立てている
              TSX やスタイル、API のルートなどは WTFPL v2 の対象で、持っていって構いません。
            </p>
            <p>
              一方で、ブログの記事本文、イラスト(SVG)、ロゴ、バナーは
              <strong>十字架_mania に帰属</strong>します。引用は歓迎ですが、出典を明記してください。
              バナーは加工せずそのまま使うのが条件です。
            </p>
            <p>
              境界が曖昧なもの(記事の中に埋め込んだ図解など)は、どちらか判断がつきにくいはずです。
              その場合は用途を書いて X の DM で聞いてください。たいていは「どうぞ」と返します。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">引用するときの出典の書き方</h2>
            <p>
              記事を引用・紹介するときは、<strong>サイト名と、引用したページの URL</strong>を
              添えてください。「hikamers.app の記事より」のような形で構いません。
              スクリーンショットを貼るのも問題ありません。
            </p>
            <p>
              逆に、<strong>文章をまるごと転載して自分の書いたものとして公開する</strong>のは
              やめてください。翻訳して別サイトで公開する場合も、出典があれば大丈夫です。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">なぜ使用ライブラリの一覧を載せているのか</h2>
            <p>
              上の一覧は、単なる記録ではなく<strong>ライセンス上の義務を果たすため</strong>のものです。
              Twemoji の絵柄と Open-Meteo の天気データは CC BY 4.0 で、
              <strong>出典表示が条件</strong>になっています。このページに名前とリンクを載せることで
              その条件を満たしています。
            </p>
            <p>
              MIT や CC0 のように表示が不要なものも混ざっていますが、まとめて載せたほうが
              あとから確認しやすいので、この形にしています。フォークして使う場合は、
              自分のサイトのクレジット表記に置き換えてください。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
