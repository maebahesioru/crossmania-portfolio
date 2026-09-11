"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { CopyButton, Reveal } from "./ui";

/** ミラーページ(Onion) — 未公開なので「準備中」を明示する */
export function MirrorContent({ clearnet, onion }: { clearnet: string; onion: string }) {
  const { locale, t } = useI18n();

  /* ⚠️ .onion はここに直書きしない。アドレスは隠しサービスの鍵から決まるので、
     実体を作るまで確定しない(環境変数 NEXT_PUBLIC_ONION_URL から受け取る)。 */
  const clearnetLabel = clearnet.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const rows = [
    {
      label: "Clearnet",
      value: clearnetLabel,
      href: clearnet,
      live: true,
      copy: false,
    },
    {
      label: ".onion",
      value: onion || "••••••••••••••••••••••••••••••••.onion",
      href: onion ? `http://${onion}` : null,
      live: Boolean(onion),
      copy: Boolean(onion),
    },
  ];

  return (
    <div className="shell pt-10">
      <p className="label">Mirror</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{t("mirror.title")}</h1>
      <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-sub">{t("mirror.lead")}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Reveal className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="label">Endpoints</span>
            <span className="font-mono text-[11.5px] text-sub">{new Date().getFullYear()}</span>
          </div>
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-3 px-4 py-3.5">
                <span className="w-20 shrink-0 font-mono text-[11.5px] text-sub">{r.label}</span>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-link hover:underline"
                  >
                    {r.value}
                  </a>
                ) : (
                  <code
                    className={`min-w-0 flex-1 truncate font-mono text-[12.5px] ${r.live ? "text-link" : "text-sub line-through"}`}
                  >
                    {r.value}
                  </code>
                )}
                {r.copy ? <CopyButton value={r.value} label={r.value} /> : null}
                {r.live ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11.5px] text-emerald-400">
                    LIVE
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 font-mono text-[11.5px] text-sub">
                    {t("mirror.wip")}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-line bg-panel2/50 px-4 py-3">
            <p className="text-[12.5px] leading-relaxed text-sub">{t("mirror.body")}</p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal className="panel p-5" delay={80}>
            <p className="label">{locale === "ja" ? "なぜミラーを作るのか" : "Why a mirror?"}</p>
            <ul className="mt-3 flex flex-col gap-2 text-[12.5px] leading-relaxed text-sub">
              <li>・{locale === "ja" ? "ドメイン停止・検閲への備え" : "Resilience against domain takedowns and censorship"}</li>
              <li>・{locale === "ja" ? "自宅回線が落ちても別経路で読めるように" : "A second path when the home line goes down"}</li>
              <li>・{locale === "ja" ? "Tor ユーザーでもアクセスできるように" : "So Tor users can reach the site too"}</li>
            </ul>
          </Reveal>

          <Reveal className="panel p-5" delay={140}>
            <p className="label">{t("mirror.tor")}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-sub">
              {locale === "ja"
                ? ".onion アドレスは Tor ネットワーク内でのみ解決されます。通常のブラウザでは開けません。"
                : ".onion addresses resolve only inside the Tor network — a normal browser cannot open them."}
            </p>
            <a
              href="https://www.torproject.org/ja/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full border border-line px-4 py-2 text-xs transition hover:border-accent"
            >
              Tor Browser ↗
            </a>
          </Reveal>

          <Reveal className="panel p-5" delay={200}>
            <p className="label">{locale === "ja" ? "本家" : "Canonical"}</p>
            <p className="mt-2 font-mono text-[12px] break-all text-link">https://hikamers.app</p>
            <Link href="/" className="link mt-3 inline-block text-[12px]">
              ← {t("nav.home")}
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
