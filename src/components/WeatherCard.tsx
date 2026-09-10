"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { wmo } from "@/lib/weather";

type Weather = {
  spot: string;
  current: { temp: number; feels: number; code: number; wind: number; isDay: boolean; time: string };
  days: { date: string; code: number; max: number; min: number; rain: number }[];
  fetchedAt: string;
  cached?: boolean;
  stale?: boolean;
};

export function WeatherCard() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<Weather | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/weather", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.error) setErr(j.error);
        else setData(j);
      })
      .catch(() => alive && setErr(t("weather.error")));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = data?.days[0];
  const w = data ? wmo(data.current.code) : null;

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="label">{t("sec.weather")}</span>
        <span className="font-mono text-[11.5px] text-sub">{data?.spot ?? "—"}</span>
      </div>

      {err ? (
        <p className="p-5 text-sm text-sub">{err}</p>
      ) : !data ? (
        <div className="p-5">
          <div className="h-16 rounded-lg shimmer bg-panel2" />
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl leading-none">{w?.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl tabular-nums">{data.current.temp.toFixed(1)}</span>
                <span className="text-sm text-sub">°C</span>
                <span className="ml-1 truncate text-sm">{locale === "ja" ? w?.ja : w?.en}</span>
              </div>
              <div className="mt-1 font-mono text-[11.5px] text-sub">
                {locale === "ja" ? "体感" : "feels"} {data.current.feels.toFixed(1)}°C · {locale === "ja" ? "風" : "wind"}{" "}
                {data.current.wind}m/s
              </div>
            </div>
            {today ? (
              <div className="shrink-0 border-l border-line pl-4 text-right">
                <div className="font-mono text-[11.5px] text-sub">{t("weather.today")}</div>
                <div className="font-mono text-sm">
                  <span className="text-accent">{today.max.toFixed(0)}°</span>
                  <span className="mx-1 text-sub">/</span>
                  <span className="text-accent2">{today.min.toFixed(0)}°</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {data.days.slice(0, 2).map((d, i) => {
              const dd = wmo(d.code);
              const [, m, day] = d.date.split("-");
              return (
                <div key={d.date} className="rounded-lg border border-line bg-panel2 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11.5px] text-sub">
                      {i === 0 ? t("weather.today") : t("weather.tomorrow")} {Number(m)}/{Number(day)}
                    </span>
                    <span className="text-lg leading-none">{dd.emoji}</span>
                  </div>
                  <div className="mt-1 truncate text-[12px]">{locale === "ja" ? dd.ja : dd.en}</div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[11.5px]">
                    <span>
                      <span className="text-accent">{d.max.toFixed(0)}°</span>
                      <span className="text-sub">/{d.min.toFixed(0)}°</span>
                    </span>
                    <span className="text-accent2">☔{d.rain}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 flex items-center justify-between font-mono text-[11.5px] text-sub">
            <span>
              {t("weather.updated")}: {data.current.time.replace("T", " ")} JST
            </span>
            <span className="flex items-center gap-1.5">
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="link">
                open-meteo
              </a>
              {data.cached ? <span className="rounded bg-panel2 px-1.5">cache</span> : null}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
