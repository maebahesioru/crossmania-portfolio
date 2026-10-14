import type { Metadata } from "next";
import { BBS } from "@/components/BBS";

export const metadata: Metadata = {
  title: "BBS / コメント",
  description: "十字架_mania の掲示板。匿名で書き込めます。キリ番報告・相互リンク・雑談など。",
  robots: { index: true, follow: true },
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
      <div className="mt-8">
        <BBS standalone />
      </div>
    </div>
  );
}
