"use client";

import { useState } from "react";
import { CONTACTS, DONATIONS, type IconName } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { relativeTime, useXAccounts } from "./useXAccounts";
import { CopyAddress, CopyButton, Reveal, SectionHeading } from "./ui";
import {
  BitcoinIcon,
  BlueskyIcon,
  GithubIcon,
  InstagramIcon,
  LitecoinIcon,
  MoneroIcon,
  NiconicoIcon,
  QiitaIcon,
  RedditIcon,
  SessionIcon,
  SignalIcon,
  TelegramIcon,
  TiktokIcon,
  TwitchIcon,
  XIcon,
  YoutubeIcon,
} from "./icons";

function NoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4 3h11l5 5v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm10 1.5V9h4.5L14 4.5ZM7 12v2h10v-2H7Zm0 4v2h7v-2H7Z" />
    </svg>
  );
}
function NorthIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 10 10l-1.5 5.5L14 14l1.5-5.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function OfuseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6 15h5" />
    </svg>
  );
}

const ICONS: Record<IconName, (p: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  x: XIcon,
  bluesky: BlueskyIcon,
  github: GithubIcon,
  note: NoteIcon,
  qiita: QiitaIcon,
  youtube: YoutubeIcon,
  niconico: NiconicoIcon,
  instagram: InstagramIcon,
  twitch: TwitchIcon,
  tiktok: TiktokIcon,
  reddit: RedditIcon,
  signal: SignalIcon,
  session: SessionIcon,
  telegram: TelegramIcon,
  north: NorthIcon,
};

const BRAND: Record<IconName, string> = {
  x: "#1d9bf0",
  bluesky: "#0285ff",
  github: "#8b949e",
  note: "#2cb696",
  qiita: "#55c500",
  youtube: "#ff0033",
  niconico: "#f5f5f5",
  instagram: "#e1306c",
  twitch: "#9146ff",
  tiktok: "#ff0050",
  reddit: "#ff4500",
  signal: "#3a76f0",
  session: "#00c853",
  telegram: "#26a5e4",
  north: "#e879f9",
};

export function LinksSection() {
  const { t, pick, locale } = useI18n();
  const [copied, setCopied] = useState(false);
  const { accounts, fetchedAt } = useXAccounts();

  // サイドバー(最狭360px)でも語中で折り返さないよう、1行44文字以内に整形しておく
  const snippet = [
    `<a href="${SITE_URL}/"`,
    `   target="_blank" rel="noopener">`,
    `  <img src="${SITE_URL}/banner.svg"`,
    `       width="200" height="40"`,
    `       alt="十字架_mania"></a>`,
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("HTML", snippet);
    }
  };

  return (
    <section className="shell py-14">
      <Reveal>
        <SectionHeading
          index="08"
          title={t("sec.links")}
          sub={`${CONTACTS.length} links`}
          id="links"
        />
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(380px,30%)]">
        <Reveal className="panel p-4">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
            {CONTACTS.map((c) => {
              const Icon = ICONS[c.icon];
              const live = c.xAccount ? accounts?.[c.xAccount] : undefined;
              const liveOk = live?.ok === true;
              // X は取得できた実データ(アイコン/表示名/FF数)を優先し、失敗時は静的表示にフォールバック
              const inner = (
                <>
                  {liveOk && live?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={live.avatar}
                      alt=""
                      width={36}
                      height={36}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 shrink-0 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-panel2"
                      style={{ color: BRAND[c.icon] }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    {/* 1行目: 自分で付けたラベル(どの垢か) — ライブ取得でも必ず出す */}
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-semibold">{c.label}</span>
                      {liveOk && live?.protected ? (
                        <span className="shrink-0 text-[11px]" title={locale === "ja" ? "鍵アカウント" : "locked"}>
                          🔒
                        </span>
                      ) : null}
                      {liveOk && live?.verified ? (
                        <span className="shrink-0 text-[10px] text-accent2" title="verified">
                          ✔
                        </span>
                      ) : null}
                    </span>
                    {/* 2行目: ID(コピー対象) または ハンドル + FF数(ライブ時) */}
                    {c.secret ? (
                      <span className="mt-0.5 block font-mono text-[11.5px] leading-relaxed break-all text-sub">
                        {c.secret}
                      </span>
                    ) : (
                      <span className="block truncate font-mono text-[11.5px] text-sub">
                        {liveOk && live?.followers !== undefined
                          ? `${c.handle} · ${locale === "ja" ? "FF" : "Followers"} ${live.followers.toLocaleString(locale === "ja" ? "ja-JP" : "en-US")}`
                          : c.handle}
                      </span>
                    )}
                    {/* 3行目: 現在の表示名(ライブ時のみ・変わっても追従) */}
                    {liveOk && live?.name ? (
                      <span className="mt-0.5 block truncate text-[11px] text-sub" title={live.name}>
                        {live.name}
                      </span>
                    ) : null}
                  </span>
                </>
              );
              return (
                <li key={c.label}>
                  {c.secret ? (
                    <div className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5">
                      {inner}
                      <CopyButton value={c.secret} label={`${c.label} をコピー`} />
                    </div>
                  ) : (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 transition hover:border-accent hover:bg-panel2/50"
                    >
                      {inner}
                      <span className="shrink-0 text-sub">↗</span>
                    </a>
                  )}
                  {c.note && !(c.noteReplacedByLive && c.xAccount && accounts?.[c.xAccount]?.ok) ? (
                    <p className="mt-1 pl-1 text-[11.5px] text-sub">{pick(c.note)}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-3 text-[11.5px] text-sub">
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${accounts ? "bg-emerald-400" : "bg-amber-400"} blink`} />
              {locale === "ja"
                ? "Xの情報は fxtwitter からリアルタイム取得しています"
                : "X account info is fetched live from fxtwitter"}
            </span>
            {fetchedAt ? (
              <>
                <span className="opacity-60">·</span>
                <a href="https://github.com/FixTweet/FxTwitter" target="_blank" rel="noopener noreferrer" className="link">
                  fxtwitter
                </a>
                <span className="opacity-60">·</span>
                <span>
                  {locale === "ja" ? "更新" : "updated"}: {relativeTime(fetchedAt, locale)}
                </span>
              </>
            ) : null}
          </p>
        </Reveal>

        <div className="flex flex-col gap-4">
          {/* My Banner */}
          <Reveal className="panel p-4">
            <p className="label">{t("sec.banner")}</p>
            <div className="mt-3 rounded-lg border border-dashed border-line bg-panel2/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/banner.svg" alt="十字架_mania banner" width={200} height={40} className="h-auto w-full max-w-[420px]" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                className="rounded-full border border-line px-3 py-1.5 text-xs transition hover:border-accent hover:text-fg"
              >
                {copied ? t("banner.copied") : t("banner.copy")}
              </button>
              <a
                href="/banner.svg"
                download="crossmania-banner.svg"
                className="rounded-full border border-line px-3 py-1.5 text-xs transition hover:border-accent hover:text-fg"
              >
                {t("banner.download")}
              </a>
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-line bg-panel2 p-2.5 font-mono text-[9.5px] leading-relaxed break-all whitespace-pre-wrap text-sub">
              {snippet}
            </pre>
          </Reveal>

          {/* 相互リンク */}
          <Reveal className="panel p-4" delay={80}>
            <p className="label">{t("sec.mutual")}</p>
            <p className="mt-2 text-[13px] leading-relaxed">{t("banner.hint")}</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-sub">{t("banner.hint2")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://x.com/maebahesioru2"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-3 py-1.5 text-xs transition hover:border-accent"
              >
                X (@maebahesioru2)
              </a>
              <a
                href="https://signal.me/#eu/lEf_4yKtbxSZamGfLjyf_UchVyQFgpLelak8oiTCpx31jgVgc3JFaKCwZzBjr1ym"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-3 py-1.5 text-xs transition hover:border-accent"
              >
                Signal
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Donate */}
      <Reveal className="mt-10">
        <SectionHeading index="09" title={t("sec.donate")} sub={locale === "ja" ? "投げ銭はすべてサーバー代になります" : "every tip goes to server costs"} id="donate" />
      </Reveal>

      <div id="donate-list" className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {DONATIONS.map((d, i) => {
          const Icon =
            d.icon === "monero" ? MoneroIcon : d.icon === "bitcoin" ? BitcoinIcon : d.icon === "litecoin" ? LitecoinIcon : OfuseIcon;
          const color = d.icon === "monero" ? "#ff6600" : d.icon === "bitcoin" ? "#f7931a" : d.icon === "litecoin" ? "#a6a9aa" : "#ff2d55";
          return (
            <Reveal key={d.label} delay={i * 60}>
              <div className="panel p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-panel2" style={{ color }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[13.5px] font-bold">{d.label}</span>
                  {d.recommended ? (
                    <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11.5px] font-bold text-white">
                      ⭐ {locale === "ja" ? "推奨" : "recommended"}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3">
                  {d.address ? (
                    <CopyAddress value={d.address} />
                  ) : (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="link font-mono text-[12px]">
                      {d.url} ↗
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-3 text-[11.5px] text-sub">
        {locale === "ja"
          ? "送金用アドレスは全文を載せています。コピーしてお使いください。"
          : "Donation addresses are shown in full — use the copy button."}
      </p>
    </section>
  );
}
