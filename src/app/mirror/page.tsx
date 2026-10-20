import type { Metadata } from "next";
import { MirrorContent } from "@/components/Mirror";
import { ONION_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ミラーページ",
  description: "検閲・ドメイン停止に備えたミラー。Onion ミラーも公開しています。",
  alternates: { canonical: "/mirror" },
};

export default function MirrorPage() {
  /* ⚠️ env はサーバー側で読んで props で渡す。Mirror は "use client" なので、
     クライアントコンポーネントから process.env.X(NEXT_PUBLIC_ 以外)を読んでも undefined になる。 */
  return (
    <>
      <MirrorContent clearnet={SITE_URL} onion={ONION_URL} />

      <section className="shell pb-16">
        <div className="mt-10 max-w-3xl space-y-7 text-[13.5px] leading-relaxed">
          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">ミラーを置いている理由</h2>
            <p>
              このサイトは自宅のマシンで動かしています。安く運用できる代わりに、
              <strong>回線・電気・機材のどこか1か所が止まれば、サイト全体が止まる</strong>
              という性質を持っています。ふつうのブログなら数時間落ちても大きな問題には
              なりませんが、イベントの告知や投票の受付を載せている期間は、落ちていること自体が
              困りごとになります。
            </p>
            <p>
              そこで、同じ内容を別の経路からも読めるようにしておくのがミラーの役割です。
              データは1か所で管理し、入り口だけを増やす。同期のずれを作らないため、
              <strong>ミラーは独立したコピーではなく、同じ内容への別ルート</strong>として
              運用しています。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">.onion アドレスとは何か</h2>
            <p>
              <code>.onion</code>で終わるアドレスは、Tor ネットワークの中でだけ名前解決されます。
              DNS のような公開の台帳を通らないため、通常のブラウザで開いても
              「そんなサイトはない」と表示されます。開くには Tor Browser が必要です。
            </p>
            <p>
              向こう側で受け取るのは、このサイトを動かしているサーバーです。
              出口ノードを経由しないので、経路の途中で内容を書き換えられる心配がありません。
              ただし<strong>「暗号化されているから安全」という話ではなく</strong>、
              「別の入り口が用意されている」というだけのことです。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">本物かどうかの見分け方</h2>
            <p>
              ミラーを名乗る偽サイトは必ず出てきます。判断材料は2つだけ覚えておけば足ります。
              1つは<strong>アドレスがこのページに書かれているものと完全に一致するか</strong>。
              もう1つは<strong>本家と内容が同じか</strong>です。ミラーは読み取り用の入り口なので、
              本家にない機能が増えていたら、それは別物だと考えてください。
            </p>
            <p>
              このページに載っていないアドレスは、たとえ見た目が同じでも公式ではありません。
              ブックマークは本家のドメインで取っておくのが一番安全です。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
