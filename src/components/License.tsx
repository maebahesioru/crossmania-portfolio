"use client";

import { useI18n } from "@/lib/i18n";
import { Reveal } from "./ui";

const WTFPL = `        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.`;

export function LicenseContent() {
  const { locale, t } = useI18n();

  const deps = [
    { name: "Next.js / React / Tailwind CSS", license: "MIT", url: "https://nextjs.org/" },
    { name: "Geist / Geist Mono (next/font)", license: "SIL Open Font License 1.1", url: "https://vercel.com/font" },
    { name: "simple-icons (ブランドアイコン)", license: "CC0 1.0 Universal", url: "https://simpleicons.org/" },
    { name: "Open-Meteo (天気データ)", license: "CC BY 4.0 (attribution)", url: "https://open-meteo.com/" },
    { name: "国旗絵文字 / 絵文字フォント", license: "各プラットフォームのライセンス", url: "" },
  ];

  return (
    <div className="shell pt-10">
      <p className="label">Legal</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{t("nav.license")}</h1>
      <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-sub">
        {locale === "ja"
          ? "コードは一番自由なやつ(WTFPL v2)で公開しています。何をしてもいいし、何もしなくてもいい。"
          : "The code is released under the freest one going — WTFPL v2. Do whatever you want; doing nothing is also fine."}
      </p>

      <Reveal className="panel mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="label">Source code license</span>
          <span className="chip">WTFPL-2.0</span>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-relaxed whitespace-pre text-fg">{WTFPL}</pre>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal className="panel p-5">
          <p className="label">{locale === "ja" ? "コンテンツ" : "Content"}</p>
          <ul className="mt-3 flex flex-col gap-2 text-[13px] leading-relaxed text-sub">
            <li>・{locale === "ja" ? "文章・イラスト(SVG)・デザインの著作権は 十字架_mania に帰属します。" : "Text, SVG illustrations and design © 十字架_mania."}</li>
            <li>・{locale === "ja" ? "引用は出典を明記してください(リンク大歓迎)。" : "When quoting, credit the source (links welcome)."}</li>
            <li>・{locale === "ja" ? "バナー(SVG)は加工・改変せずそのまま使ってください。" : "Please use the banner SVG as-is, without modification."}</li>
            <li>・{locale === "ja" ? "煙緋をはじめとするゲームキャラクターは各権利者に帰属します。本サイトは非公式のファン活動です。" : "Game characters (Yanfei and others) belong to their respective rights holders. This is unofficial fan activity."}</li>
          </ul>
        </Reveal>

        <Reveal className="panel p-5" delay={80}>
          <p className="label">{locale === "ja" ? "使用しているもの" : "Credits"}</p>
          <ul className="mt-3 flex flex-col divide-y divide-line text-[12.5px]">
            {deps.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="link">
                      {d.name}
                    </a>
                  ) : (
                    <span>{d.name}</span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-[11.5px] text-sub">{d.license}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="panel mt-4 p-5">
        <p className="label">GitHub</p>
        <p className="mt-2 text-[13px] leading-relaxed text-sub">
          {locale === "ja"
            ? "ソースは GitHub の maebahesioru で公開しています。転載・改変・再配布は自由ですが、このサイトの文章を自分の書いたものとして公開するのはやめてください。"
            : "Source is published on GitHub as maebahesioru. Copy, modify and redistribute freely — just don't republish this site's writing as your own."}
        </p>
        <a
          href="https://github.com/maebahesioru"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-full border border-line px-4 py-2 text-xs transition hover:border-accent"
        >
          github.com/maebahesioru ↗
        </a>
      </Reveal>
    </div>
  );
}
