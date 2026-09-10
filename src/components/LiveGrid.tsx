"use client";

import { useI18n } from "@/lib/i18n";
import { ClientInfoCard } from "./ClientInfo";
import { GithubActivity } from "./GithubActivity";
import { Reveal, SectionHeading } from "./ui";
import { VisitCounter } from "./VisitCounter";
import { WeatherCard } from "./WeatherCard";

export function LiveGrid() {
  const { t, locale } = useI18n();

  return (
    <section className="shell py-14">
      <Reveal>
        <SectionHeading
          index="08"
          title={locale === "ja" ? "Live" : "Live"}
          sub={locale === "ja" ? "リアルタイム / 実測値" : "real-time / measured"}
          id="info"
        />
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal>
          <WeatherCard />
        </Reveal>
        <Reveal delay={80}>
          <VisitCounter />
        </Reveal>
        <Reveal delay={140}>
          <GithubActivity />
        </Reveal>
        <Reveal delay={200}>
          <ClientInfoCard />
        </Reveal>
      </div>

      <Reveal className="mt-4">
        <p className="text-[11.5px] text-sub">
          {locale === "ja"
            ? "天気は open-meteo、GitHubは公開API、アクセス解析は自前のJSONカウンター(外部トラッカーなし)を使っています。"
            : "Weather from open-meteo, GitHub from the public API, analytics from a self-hosted JSON counter — no third-party trackers."}
        </p>
      </Reveal>
      <span className="hidden">{t("sec.links")}</span>
    </section>
  );
}
