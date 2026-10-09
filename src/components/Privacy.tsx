"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "./ui";

/**
 * 本文内のインラインリンク記法: `[[表示名|URL]]`
 * 記法を1つだけ用意して、条項ごとに自由にリンクを埋め込めるようにする（Terms.tsx と同方式）。
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

const PRIVACY: Block[] = [
  {
    h: { ja: "第1条 基本方針", en: "1. Overview" },
    body: {
      ja: [
        {
          p: "本ポリシーは、十字架_mania(以下「当方」)が運営する本サイト(以下「当サイト」)における、利用者情報の取り扱いを定めるものです。",
        },
      ],
      en: [
        {
          p: "This policy explains how user information is handled on this site (the “Site”), operated by 十字架_mania (“we”).",
        },
      ],
    },
  },
  {
    h: { ja: "第2条 収集する情報", en: "2. Information we collect" },
    body: {
      ja: [
        {
          p: "当サイトの閲覧にあたり、氏名・住所・電話番号などの個人情報の入力を求めることはありません。",
        },
        {
          p: "当サイトは Cloudflare の提供する、Cookie を使用しない匿名のアクセス解析を利用しています。閲覧状況に関する匿名の統計情報が記録される場合があります。",
        },
        {
          p: "BBS・コメント欄に投稿された内容は公開されます。個人情報の記載はお控えください。",
        },
      ],
      en: [
        {
          p: "Browsing the Site does not require you to enter personal information such as your name, address, or phone number.",
        },
        {
          p: "The Site uses Cloudflare's cookieless, anonymous analytics. Anonymous statistics about visits may be recorded.",
        },
        {
          p: "Anything posted in the BBS / comments is public. Please do not post personal information there.",
        },
      ],
    },
  },
  {
    h: { ja: "第3条 広告の配信(Google AdSense)", en: "3. Advertising (Google AdSense)" },
    body: {
      ja: [
        { p: "当サイトは、Google AdSense による広告を掲載しています。" },
        {
          p: "Google をはじめとする第三者配信事業者は、利用者の興味に応じた広告を表示するため、Cookie(DoubleClick Cookie など)を使用することがあります。",
        },
        {
          p: "パーソナライズ広告は [[広告設定|https://www.google.com/settings/ads]] で無効にできます。また、[[aboutads.info|https://www.aboutads.info/choices/]] では第三者配信事業者の Cookie をまとめて無効にできます。",
        },
        {
          p: "Google による広告 Cookie の取り扱いの詳細は、[[Google のポリシーと規約|https://policies.google.com/technologies/ads?hl=ja]] をご確認ください。",
        },
      ],
      en: [
        { p: "The Site displays ads through Google AdSense." },
        {
          p: "Google and other third-party ad vendors may use cookies (such as the DoubleClick cookie) to serve ads based on your interests.",
        },
        {
          p: "You can disable personalized advertising at [[Ad Settings|https://www.google.com/settings/ads]], and opt out of third-party vendor cookies at [[aboutads.info|https://www.aboutads.info/choices/]].",
        },
        {
          p: "For details on how Google uses advertising cookies, see [[Google's policies|https://policies.google.com/technologies/ads?hl=en]].",
        },
      ],
    },
  },
  {
    h: { ja: "第4条 Cookie の管理", en: "4. Managing cookies" },
    body: {
      ja: [
        {
          p: "広告に関する Cookie は、欧州経済領域(EEA)などの利用者に対しては、クッキーバナーで同意が選択された場合にのみ有効になります(Google Consent Mode v2)。",
        },
        {
          p: "当サイトでは、テーマなどの表示設定の保存にブラウザの localStorage を使用しています(Cookie ではありません)。",
        },
        { p: "Cookie はブラウザの設定から削除・無効化できます。" },
      ],
      en: [
        {
          p: "For users in the EEA and similar regions, advertising cookies are enabled only after you choose “Accept” in the cookie banner (Google Consent Mode v2).",
        },
        {
          p: "Display settings such as the theme are stored in your browser's localStorage (not cookies).",
        },
        { p: "You can delete or block cookies in your browser settings." },
      ],
    },
  },
  {
    h: { ja: "第5条 第三者への提供", en: "5. Sharing with third parties" },
    body: {
      ja: [
        {
          p: "当方が取得した情報を、法令に基づく場合を除き、第三者へ提供・販売することはありません。",
        },
      ],
      en: [
        {
          p: "We do not provide or sell collected information to third parties, except as required by law.",
        },
      ],
    },
  },
  {
    h: { ja: "第6条 お問い合わせ", en: "6. Contact" },
    body: {
      ja: [
        {
          p: "本ポリシーに関するお問い合わせは、[[X(@maebahesioru2)|https://x.com/maebahesioru2]] の DM までお願いします。",
        },
      ],
      en: [
        {
          p: "For questions about this policy, please DM us on [[X (@maebahesioru2)|https://x.com/maebahesioru2]].",
        },
      ],
    },
  },
  {
    h: { ja: "第7条 改定", en: "7. Changes" },
    body: {
      ja: [
        {
          p: "本ポリシーは、必要に応じて予告なく改定されることがあります。改定後の内容は、本ページに掲載した時点から適用されます。",
        },
      ],
      en: [
        {
          p: "This policy may be revised as needed without prior notice. Revisions take effect when posted on this page.",
        },
      ],
    },
  },
];

export function PrivacyContent() {
  const { locale, t } = useI18n();

  return (
    <div className="shell pt-10">
      <p className="label">Legal</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{t("privacy.title")}</h1>
      <p className="mt-3 font-mono text-[11.5px] text-sub">
        {locale === "ja"
          ? "制定日: 2026年10月9日 / 最終改定: 2026年10月9日"
          : "Established 2026-10-09 / Last updated 2026-10-09"}
      </p>

      <div className="mt-8 flex max-w-4xl flex-col gap-4">
        {PRIVACY.map((b, i) => (
          <Reveal key={b.h.ja} delay={Math.min(i * 40, 240)} className="panel p-5">
            <h2 className="text-[15px] font-bold text-fg">{b.h[locale]}</h2>
            <div className="mt-2 flex flex-col gap-2">
              {b.body[locale].map((item, j) =>
                "list" in item ? (
                  <ul key={j} className="flex flex-col gap-1.5">
                    {item.list.map((li, k) => (
                      <li key={k} className="flex gap-2.5 text-[13.5px] leading-[1.9] text-sub">
                        <span className="shrink-0 font-mono text-accent">{`(${k + 1})`}</span>
                        <span>{renderInline(li, `p${i}-l${k}`)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={j} className="text-[13.5px] leading-[1.9] text-sub">
                    {renderInline(item.p, `p${i}-p${j}`)}
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
