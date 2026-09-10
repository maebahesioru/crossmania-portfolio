"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "./ui";

/**
 * 本文内のインラインリンク記法: `[[表示名|URL]]`
 * 記法を1つだけ用意して、条項ごとに自由にリンクを埋め込めるようにする。
 */
const INLINE_LINK = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_LINK.lastIndex = 0;
  while ((m = INLINE_LINK.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, label, href] = m;
    nodes.push(
      href.startsWith("/") ? (
        <Link key={`${keyPrefix}-${m.index}`} href={href} className="link">
          {label}
        </Link>
      ) : (
        <a
          key={`${keyPrefix}-${m.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          {label}
        </a>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Item = { p: string } | { list: string[] };
type Block = { h: { ja: string; en: string }; body: { ja: Item[]; en: Item[] } };

const TERMS: Block[] = [
  {
    h: { ja: "第1条 適用", en: "1. Scope" },
    body: {
      ja: [
        {
          p: "本規約は、十字架_mania(以下「当方」)が運営する本サイト(以下「当サイト」)の利用条件を定めるものです。利用者は本サイトを利用した時点で本規約に同意したものとみなします。",
        },
      ],
      en: [
        {
          p: "These terms define the conditions for using this site (the “Site”), operated by 十字架_mania (“we”). By using the Site you agree to these terms.",
        },
      ],
    },
  },
  {
    h: { ja: "第2条 禁止事項", en: "2. Prohibited conduct" },
    body: {
      ja: [
        { p: "当サイトでは次の行為を禁止します。" },
        {
          list: [
            "特定の個人・団体への誹謗中傷、脅迫、差別的表現",
            "本人の同意のない個人情報(本名・住所・連絡先・顔写真など)の投稿",
            "スパム、広告、同一内容の連投、Bot による自動投稿",
            "当サイトまたは第三者への不正アクセス、脆弱性の悪用、過度な負荷をかける行為",
            "法令または公序良俗に反する行為",
            "その他、当方が不適切と判断する行為",
          ],
        },
      ],
      en: [
        { p: "The following conduct is prohibited on the Site." },
        {
          list: [
            "Defamation, threats or discriminatory expression toward any person or group",
            "Posting personal information (real name, address, contact details, face photos, etc.) without consent",
            "Spam, advertising, repeated identical posts, or automated bot posting",
            "Unauthorized access, exploitation of vulnerabilities, or excessive load against the Site or third parties",
            "Anything unlawful or contrary to public order and morals",
            "Anything else we deem inappropriate",
          ],
        },
      ],
    },
  },
  {
    h: { ja: "第3条 掲示板・コメント", en: "3. BBS / comments" },
    body: {
      ja: [
        {
          p: "投稿の内容については投稿者自身が責任を負います。当方は、事前の通知なく投稿を削除する権限を有します。削除キーを設定した投稿は投稿者自身で削除できますが、削除キーを失った場合は復旧できません。",
        },
        {
          p: "荒らし対策として、IPアドレス・User-Agent から生成したハッシュ値と最終投稿時刻を一時的に記録します。IPアドレスそのものは保存しません。",
        },
      ],
      en: [
        {
          p: "Authors are responsible for their own posts. We may delete any post without prior notice. Posts with a delete key can be removed by their author; a lost delete key cannot be recovered.",
        },
        {
          p: "For anti-abuse purposes we temporarily record a hash derived from your IP address and User-Agent, plus the timestamp of your last post. We do not store the raw IP address.",
        },
      ],
    },
  },
  {
    h: { ja: "第4条 Cookie・アクセス解析", en: "4. Cookies & analytics" },
    body: {
      ja: [
        {
          p: "当サイトは、訪問者数のカウント、言語・テーマ設定の保存、荒らし対策のために Cookie および localStorage を最小限使用します。広告配信・第三者トラッキング(Google Analytics 等)は一切使用していません。",
        },
        {
          p: "訪問者カウンターは当方が自前で運営しています。集計結果は当方のサーバー内にのみ保存され、外部サービスへ送信されることはありません。",
        },
      ],
      en: [
        {
          p: "We use a minimal amount of cookies and localStorage for the visitor counter, for remembering language/theme, and for anti-abuse. We use no advertising and no third-party tracking (no Google Analytics).",
        },
        {
          p: "The visitor counter is self-hosted. All counts stay on our own server and are never sent to external services.",
        },
      ],
    },
  },
  {
    h: { ja: "第5条 免責事項", en: "5. Disclaimer" },
    body: {
      ja: [
        { p: "当サイトの内容の正確性・完全性・有用性について、当方はいかなる保証も行いません。当サイトの利用により生じた損害について、当方は責任を負いません。" },
        { p: "当サイトからリンクする外部サイトの内容について、当方は責任を負いません。" },
      ],
      en: [
        {
          p: "We make no warranty as to the accuracy, completeness or usefulness of the content. We accept no liability for damages arising from use of the Site.",
        },
        { p: "We are not responsible for the content of external sites we link to." },
      ],
    },
  },
  {
    h: { ja: "第6条 著作権", en: "6. Copyright" },
    body: {
      ja: [
        {
          p: "当サイトのソースコードは WTFPL(Do What The Fuck You Want To Public License)に基づき公開しています。詳細は[[ライセンスページ|/license]]をご覧ください。",
        },
        { p: "文章・イラスト・デザインなどのコンテンツは当方に帰属します。引用の際は出典を明記してください。" },
        {
          p: "当サイトに登場するゲーム・企業等の名称、キャラクターは各権利者に帰属します。当サイトは各社と無関係のファン活動です。",
        },
      ],
      en: [
        {
          p: "The source code of this site is released under the WTFPL (Do What The Fuck You Want To Public License). See the [[license page|/license]].",
        },
        { p: "Written content, illustrations and design belong to us. Please credit the source when quoting." },
        {
          p: "Names and characters belonging to games and companies remain the property of their respective owners. This is unofficial fan activity, unaffiliated with any of them.",
        },
      ],
    },
  },
  {
    h: { ja: "第7条 リンク", en: "7. Linking" },
    body: {
      ja: [
        {
          p: "当サイトへのリンクは原則自由です。相互リンクを希望する場合は [[X (@maebahesioru2)|https://x.com/maebahesioru2]] または [[Signal (@maebahesioru.63)|https://signal.me/#eu/lEf_4yKtbxSZamGfLjyf_UchVyQFgpLelak8oiTCpx31jgVgc3JFaKCwZzBjr1ym]] までご連絡ください。",
        },
        {
          p: "バナー画像は[[My Banner|/#links]]のSVGをそのままご利用いただけます。",
        },
      ],
      en: [
        {
          p: "Linking to this site is generally free and unrestricted. For a mutual link, contact me on [[X (@maebahesioru2)|https://x.com/maebahesioru2]] or [[Signal (@maebahesioru.63)|https://signal.me/#eu/lEf_4yKtbxSZamGfLjyf_UchVyQFgpLelak8oiTCpx31jgVgc3JFaKCwZzBjr1ym]].",
        },
        { p: "You may use the SVG from the [[My Banner|/#links]] section as-is." },
      ],
    },
  },
  {
    h: { ja: "第8条 規約の変更", en: "8. Changes" },
    body: {
      ja: [{ p: "当方は、必要と判断した場合に本規約を予告なく変更できます。変更後の規約は当サイトに掲載した時点から効力を生じます。" }],
      en: [
        { p: "We may change these terms without notice when necessary. Revised terms take effect when posted on the Site." },
      ],
    },
  },
  {
    h: { ja: "第9条 準拠法", en: "9. Governing law" },
    body: {
      ja: [
        {
          p: "本規約は日本法を準拠法とし、当サイトに関する紛争は当方の所在地を管轄する裁判所を第一審の専属的合意管轄とします。",
        },
      ],
      en: [
        {
          p: "These terms are governed by Japanese law. Disputes concerning the Site shall be subject to the exclusive jurisdiction of the court having jurisdiction over our location.",
        },
      ],
    },
  },
];

export function TermsContent() {
  const { locale, t } = useI18n();

  return (
    <div className="shell pt-10">
      <p className="label">Legal</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{t("nav.terms")}</h1>
      <p className="mt-3 font-mono text-[11.5px] text-sub">
        {locale === "ja" ? "制定日: 2026年9月10日 / 最終改定: 2026年9月10日" : "Established 2026-09-10 / Last updated 2026-09-10"}
      </p>

      <div className="mt-8 flex max-w-4xl flex-col gap-4">
        {TERMS.map((b, i) => (
          <Reveal key={b.h.ja} delay={Math.min(i * 40, 240)} className="panel p-5">
            <h2 className="text-[15px] font-bold text-fg">{b.h[locale]}</h2>
            <div className="mt-2 flex flex-col gap-2">
              {b.body[locale].map((item, j) =>
                "list" in item ? (
                  <ul key={j} className="flex flex-col gap-1.5">
                    {item.list.map((li, k) => (
                      <li key={k} className="flex gap-2.5 text-[13.5px] leading-[1.9] text-sub">
                        <span className="shrink-0 font-mono text-accent">{`(${k + 1})`}</span>
                        <span>{renderInline(li, `t${i}-l${k}`)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={j} className="text-[13.5px] leading-[1.9] text-sub">
                    {renderInline(item.p, `t${i}-p${j}`)}
                  </p>
                ),
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
