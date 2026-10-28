import type { Metadata } from "next";
import { DonateContent } from "@/components/Donate";

export const metadata: Metadata = {
  title: "寄付",
  description:
    "十字架_mania への投げ銭。Monero (XMR)・Bitcoin・Litecoin・OFUSE(カード)で受け取っています。いただいた分はすべてサーバー代になります。",
  alternates: { canonical: "/donate" },
  // 寄付ページはサイトの読み物ではないので検索には出さない
  robots: { index: false, follow: true },
};

export default function DonatePage() {
  return (
    <>
      <DonateContent />

      <section className="shell pb-16">
        <div className="mt-10 max-w-3xl space-y-7 text-[13.5px] leading-relaxed">
          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">いただいたお金の使い道</h2>
            <p>
              このサイトは、自宅にある小さなマシンで動かしています。毎月かかるのは
              <strong>電気代、ドメインの更新料、開発に使うツールのライセンス</strong>の3つで、
              広告収入と合わせて、だいたいその範囲に収まるようにしています。
            </p>
            <p>
              いただいた分を何に使ったかは、金額ベースでは公開していません。
              ただ<strong>「サイトの維持以外には使いません」</strong>という一点だけは
              はっきり書いておきます。サーバーを増やす、バックアップを取る、
              壊れた部品を替える — 使途はそのあたりに限られます。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">なぜ手段をいくつも並べているのか</h2>
            <p>
              カード決済だけで十分では、という意見はもっともです。それでも複数の手段を
              置いているのは、<strong>「カードを持っていない」「名前を出したくない」</strong>
              という2つの理由で送れない人がいるからです。前者は年齢の事情だったり、
              後者は単純に、この活動を匿名でやっていることと整合させるためです。
            </p>
            <p>
              仮想通貨のアドレスは公開情報なので、秘密にする必要はありません。
              ただし<strong>送金先のネットワークを間違えると、送った資産は戻りません</strong>。
              Bitcoin のアドレスに Litecoin を送る、といった事故が実際に起きます。
              送る前に、通貨名とアドレスの先頭文字をもう一度見比べてください。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg sm:text-xl">送る前に知っておいてほしいこと</h2>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>送金は取り消せません。返金の仕組みもありません</li>
              <li>対価として何かをお渡しするものではありません(物品・サービス・権利の購入ではありません)</li>
              <li>金額の大小で、サイト上での扱いが変わることは一切ありません</li>
              <li>無理のない範囲で。生活に影響が出る金額なら、送らないでください</li>
            </ul>
            <p>
              感想や要望を送りたいだけなら、寄付よりも
              <a className="link" href="/bbs">
                BBS
              </a>
              や X の DM のほうが確実に届きます。お金を受け取ることより、
              使ってもらって反応が返ってくるほうが、次の改善につながります。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
