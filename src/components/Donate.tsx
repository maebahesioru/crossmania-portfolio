"use client";

import { DONATIONS } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";
import { BitcoinIcon, LitecoinIcon, MoneroIcon } from "./icons";
import { CopyAddress, Reveal } from "./ui";

/** OFUSE(カード決済)はブランドSVGを持っていないのでここで描く */
function OfuseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6 15h5" />
    </svg>
  );
}

const COLORS: Record<string, string> = {
  monero: "#ff6600",
  bitcoin: "#f7931a",
  litecoin: "#a6a9aa",
  ofuse: "#ff2d55",
};

/**
 * 送金先の一覧。
 * ⚠️ ホームのセクションと /donate ページの両方から使う。片方に書き写すと
 *    アドレスを足したときに必ず食い違う(2026-09 のミラー表記で実際に起きた)。
 */
export function DonateList() {
  const { locale } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {DONATIONS.map((d, i) => {
        const Icon =
          d.icon === "monero"
            ? MoneroIcon
            : d.icon === "bitcoin"
              ? BitcoinIcon
              : d.icon === "litecoin"
                ? LitecoinIcon
                : OfuseIcon;
        return (
          <Reveal key={d.label} delay={i * 60}>
            <div className="panel flex h-full flex-col p-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-panel2"
                  style={{ color: COLORS[d.icon] }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[13.5px] font-bold">{d.label}</span>
                {d.recommended ? (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11.5px] font-bold whitespace-nowrap text-white">
                    ⭐ {locale === "ja" ? "推奨" : "recommended"}
                  </span>
                ) : null}
              </div>
              <div className="mt-3">
                {d.address ? (
                  <CopyAddress value={d.address} />
                ) : (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link font-mono text-[12px]"
                  >
                    {d.url} ↗
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/** /donate ページの中身 */
export function DonateContent() {
  const { locale, t } = useI18n();

  const ja = locale === "ja";

  return (
    <div className="shell pt-10">
      <p className="label">Support</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{t("nav.donate")}</h1>
      <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-sub">{t("donate.lead")}</p>

      <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="label">{ja ? "送金先" : "Addresses"}</span>
              <span className="font-mono text-[11.5px] text-sub">{DONATIONS.length}</span>
            </div>
            <div className="p-4">
              <DonateList />
            </div>
            <div className="border-t border-line bg-panel2/50 px-4 py-3">
              <p className="text-[12.5px] leading-relaxed text-sub">{t("donate.copyNote")}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Reveal className="panel p-5" delay={80}>
            <p className="label">{t("donate.where")}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-sub">{t("donate.whereBody")}</p>
          </Reveal>

          <Reveal className="panel p-5" delay={140}>
            <p className="label">{t("donate.whyCrypto")}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-sub">{t("donate.whyCryptoBody")}</p>
          </Reveal>

          <Reveal className="panel p-5" delay={200}>
            <p className="label">{t("donate.notes")}</p>
            <ul className="mt-3 flex flex-col gap-2 text-[12.5px] leading-relaxed text-sub">
              <li>・{t("donate.note1")}</li>
              <li>・{t("donate.note2")}</li>
              <li>・{t("donate.note3")}</li>
            </ul>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
