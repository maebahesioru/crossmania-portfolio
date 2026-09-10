"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type VisitData = {
  total: number;
  today: number;
  yours: number | null;
  uniqueCount: number;
  isNewVisitor: boolean;
  kiri: boolean;
  near: number;
  jst: string;
};

export function VisitCounter() {
  const { t } = useI18n();
  const [data, setData] = useState<VisitData | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/visits", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: VisitData) => {
        if (alive) setData(j);
      })
      .catch(() => alive && setErr(true));
    return () => {
      alive = false;
    };
  }, []);

  const digits = data ? String(data.total).padStart(7, "0").split("") : "-------".split("");

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="label">{t("visit.total")}</span>
        <span className="font-mono text-[11.5px] text-sub">{t("visit.today")}: {data ? data.today : "—"}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex gap-1">
          {digits.map((d, i) => (
            <span
              key={i}
              className="grid h-11 w-8 place-items-center rounded-md border border-line bg-panel2 font-mono text-xl tabular-nums text-accent2"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="text-right">
          {err ? (
            <span className="text-xs text-sub">{t("error")}</span>
          ) : data ? (
            <>
              <div className="text-sm">
                {data.yours ? (
                  <>
                    {t("visit.unique")}{" "}
                    <span className="font-mono text-base text-accent">{data.yours.toLocaleString()}</span>
                    {t("visit.uniqueSuffix")}
                  </>
                ) : (
                  t("visit.loading")
                )}
              </div>
              <div className="mt-0.5 font-mono text-[11.5px] text-sub">
                UNIQUE {data.uniqueCount.toLocaleString()}
              </div>
            </>
          ) : (
            <span className="text-xs text-sub shimmer inline-block rounded px-3 py-1">{t("visit.loading")}</span>
          )}
        </div>
      </div>

      {data?.kiri ? (
        <div className="border-t border-line bg-gradient-to-r from-accent/20 to-accent2/10 px-4 py-3 text-sm">
          <b className="text-accent">{t("visit.kiri")}</b>
          <p className="mt-0.5 text-xs text-sub">{t("visit.kiriReport")}</p>
        </div>
      ) : data ? (
        <div className="border-t border-line px-4 py-2.5 text-[11.5px] text-sub">
          {t("visit.near")}
          <span className="mx-1 font-mono text-accent">{data.near}</span>
          {t("visit.nearSuffix")}
        </div>
      ) : null}
    </div>
  );
}
