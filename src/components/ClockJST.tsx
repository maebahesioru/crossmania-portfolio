"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { HAS_SINCE } from "@/lib/site";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** JST の現在時刻 */
export function ClockJST({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now ?? new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const time = now
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--:--";

  if (compact) {
    return (
      <span className="font-mono text-xs tabular-nums text-sub">
        {get("year")}/{get("month")}/{get("day")} {time} JST
      </span>
    );
  }

  return (
    <div className="panel flex items-center gap-4 px-4 py-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line font-mono text-[11.5px] text-sub">
        JST
      </span>
      <div className="min-w-0">
        <div className="font-mono text-2xl leading-none tabular-nums sm:text-3xl">{time}</div>
        <div className="mt-1.5 truncate text-[12.5px] text-sub">
          {get("year")}/{get("month")}/{get("day")} ({get("weekday")}) — {t("hero.now")}
        </div>
      </div>
      <span className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 pulse" />
    </div>
  );
}

/** �aカマー界隈に存在し始めた日からの経過(日数カウント) */
export function SinceCounter() {
  const { t, locale } = useI18n();
  const [elapsed, setElapsed] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const since = new Date(HAS_SINCE).getTime();
    const tick = () => {
      const diff = Date.now() - since;
      setElapsed({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor(diff / 3_600_000) % 24,
        m: Math.floor(diff / 60_000) % 60,
        s: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(HAS_SINCE);
  const startLabel = `${start.getFullYear()}/${pad(start.getMonth() + 1)}/${pad(start.getDate())} ${pad(start.getHours())}:${pad(
    start.getMinutes(),
  )}:${pad(start.getSeconds())}`;

  return (
    <div className="panel px-4 py-3.5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl leading-none tabular-nums text-accent sm:text-3xl">
          {elapsed ? elapsed.d.toLocaleString() : "—"}
        </span>
        <span className="text-sm text-sub">{t("hero.days")}</span>
        <span className="ml-auto font-mono text-[12px] tabular-nums text-sub">
          {elapsed ? `${pad(elapsed.h)}:${pad(elapsed.m)}:${pad(elapsed.s)}` : "--:--:--"}
        </span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-sub">
        <span className="font-mono">{startLabel}</span> {t("hero.since")}
        <span className="ml-1 opacity-80">({locale === "ja" ? "ヒカマー歴" : "Hikamer life"})</span>
      </p>
    </div>
  );
}
