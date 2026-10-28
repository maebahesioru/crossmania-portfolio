import type { Metadata } from "next";
import { BBS } from "@/components/BBS";

export const metadata: Metadata = {
  title: "BBS / コメント",
  description: "十字架_mania の掲示板。匿名で書き込めます。キリ番報告・相互リンク・雑談など。",
  // 投稿が集まるまでの間は検索インデックスに載せない（本文が実質ゼロのページを
  // サイトの一部として数えられないようにする）。ナビからの導線は残す。
  robots: { index: false, follow: true },
};

export default function BbsPage() {
  return (
    <div className="shell pt-10">
      <p className="label">BBS</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">BBS / Comments</h1>
      <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-sub">
        誰でも匿名で書き込めます。誹謗中傷・個人情報の晒し・スパムは削除します。
      </p>
      <div className="mt-4 max-w-3xl space-y-2 text-[13px] leading-relaxed text-sub">
        <p>
          キリ番報告・相互リンクの申し込み・サイトへの感想・雑談などにどうぞ。
          アカウント登録は不要で、書き込みは匿名です。なお荒らし対策として、
          同じ内容の連投や同一ページへの短時間の連続投稿は自動でブロックされることがあります。
        </p>
        <p>
          プロフィールやブログへのご意見・ご依頼は、X(@maebahesioru2)のDMなどでも受け付けています。
          いただいた感想は開発の励みになります。
        </p>
      </div>
      <section className="mt-10 max-w-3xl space-y-7 text-[13.5px] leading-relaxed">
        <div className="space-y-3">
          <h2 className="display text-lg sm:text-xl">書き込む前に決めておく2つのこと</h2>
          <p>
            <strong>名前欄は空欄でも構いません。</strong>空欄のまま送ると「名無しヒカマー」として
            扱われます。固定のハンドルで書き続けたい場合だけ、名前を入れてください。
            サイト側でアカウントを作る必要はありません。
          </p>
          <p>
            <strong>削除キーは、自分の投稿をあとから消すための文字列です。</strong>
            入力しておくとブラウザにも控えが残り、同じキーで削除できます。
            入れずに投稿した場合は、削除は運営への依頼になります。
            長めの文章や、あとで直したくなるかもしれない内容は、入れておくのが無難です。
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="display text-lg sm:text-xl">荒らし対策として実際にやっていること</h2>
          <p>
            匿名で誰でも書き込める場所は、放っておくと数日でスパムだらけになります。
            そこで次の2つを自動で効かせています。1つは<strong>投稿前のロボット確認</strong>。
            もう1つは<strong>同一内容の連投と、同一ページへの短時間の連続投稿のブロック</strong>です。
          </p>
          <p>
            ブロックは「エラーを出して弾く」のではなく、静かに受け付けないことがあります。
            送信したのに表示されない場合は、まず荒らし対策に引っかかった可能性を疑ってください。
            少し時間を置いてから、内容を変えて送り直すのが早いです。
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="display text-lg sm:text-xl">削除の方針</h2>
          <p>次のいずれかに当たる書き込みは、予告なく削除します。</p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>特定の個人や団体への誹謗中傷、侮辱</li>
            <li>本人の同意がない個人情報(本名・住所・連絡先・アカウントの紐付けなど)の掲載</li>
            <li>スパム、宣伝だけを目的とした投稿、無関係なURLの羅列</li>
            <li>法令に違反する内容、または違反を助長する内容</li>
          </ul>
          <p>
            判断は運営が行います。削除の基準はこの4項目ですが、
            「読んだ人が不快になるかどうか」ではなく「公開の場に置いてよい内容か」で
            見ています。異議がある場合や、自分の投稿を消してほしい場合は、
            X(
            <a className="link" href="https://x.com/maebahesioru2" target="_blank" rel="noopener noreferrer">
              @maebahesioru2
            </a>
            )のDMへ連絡してください。
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="display text-lg sm:text-xl">なぜ掲示板を置いているのか</h2>
          <p>
            このサイトは、作ったものを並べるだけのポートフォリオでは終わらせたくないと思って
            作りました。<strong>「使ってみた感想」を受け取れる場所がひとつあるだけで、
            次の改善の方向が決まります。</strong>キリ番の報告や相互リンクの申し込みも、
            メールより気軽に送れるぶん、実際に届く率が高いです。
          </p>
          <p>
            書き込みはすべて公開されます。個人情報を書かないことだけ守ってもらえれば、
            内容は雑談でも構いません。
          </p>
        </div>
      </section>

      <div className="mt-8">
        <BBS standalone />
      </div>
    </div>
  );
}
