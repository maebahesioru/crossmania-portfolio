"use client";

import Link from "next/link";
import { MACHINES, PROFILE } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./ui";

export function RigSection() {
  const { t, pick, locale } = useI18n();

  return (
    <section className="shell py-14">
      <Reveal>
        <SectionHeading index="07" title={t("sec.rig")} sub={locale === "ja" ? "自宅ラボ構成" : "home lab setup"} id="rig" />
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {MACHINES.map((m, i) => (
          <Reveal key={m.name.ja} delay={i * 80}>
            <div className="panel flex h-full flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div>
                  <p className="text-sm font-bold">{pick(m.name)}</p>
                  <p className="mt-0.5 text-[11.5px] text-sub">{pick(m.role)}</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 font-mono text-[11.5px]">
                  {["PC", "SRV", "📱"][i] ?? "■"}
                </span>
              </div>
              <dl className="flex flex-1 flex-col divide-y divide-line">
                {m.spec.map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 px-4 py-2.5 text-[12.5px]">
                    <dt className="w-16 shrink-0 font-mono text-[11.5px] text-sub">{k}</dt>
                    <dd className="min-w-0 flex-1 break-words">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="panel p-5">
          <p className="label">{t("sec.server")}</p>
          <p className="mt-2 text-[14.5px] leading-relaxed">{pick(PROFILE.server)}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            <li className="chip">Debian 13</li>
            <li className="chip">Intel N100</li>
            <li className="chip">32 GB RAM</li>
            <li className="chip">Coolify</li>
            <li className="chip">Cloudflare Tunnel</li>
            <li className="chip">M.2 SSD 512GB</li>
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-sub">
            {locale === "ja"
              ? "このポートフォリオも含め、公開しているサイトのほぼ全部がこの1台の上で動いています。電気代と相談しながらの運営です。"
              : "Nearly every site I publish — this portfolio included — runs on that single box. Balanced against the electricity bill."}
          </p>
        </Reveal>

        <Reveal className="panel flex flex-col p-5" delay={80}>
          <div className="flex items-center justify-between">
            <p className="label">{t("sec.mirror")}</p>
            <span className="rounded-full border border-line px-2 py-0.5 text-[11.5px] text-sub line-through">{t("mirror.wip")}</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-sub">{t("mirror.body")}</p>
          <div className="mt-3 rounded-lg border border-dashed border-line bg-panel2 px-3 py-2 font-mono text-[11.5px] text-sub line-through">
            http://••••••••••••••••.onion/
          </div>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="chip">🧅 {t("mirror.tor")}</span>
            <Link href="/mirror" className="link text-[12px]">
              {t("nav.mirror")} →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
