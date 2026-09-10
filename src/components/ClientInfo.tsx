"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type ServerInfo = {
  ip: string;
  ua: string;
  browser: string;
  os: string;
  engine: string;
  acceptLanguage: string;
  secChUa?: string;
  secChUaPlatform?: string;
  dnt?: string;
  serverTime: string;
};

type ClientInfoData = {
  tz: string;
  lang: string;
  langs: string;
  screen: string;
  viewport: string;
  cores: string;
  mem: string;
  gpu: string;
  touch: boolean;
  conn: string;
  dpr: string;
  cookies: boolean;
  ls: boolean;
  reducedMotion: boolean;
};

export function ClientInfoCard() {
  const { t, locale } = useI18n();
  const [srv, setSrv] = useState<ServerInfo | null>(null);
  const [cli, setCli] = useState<ClientInfoData | null>(null);
  const [showIp, setShowIp] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/client-info", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: ServerInfo) => alive && setSrv(j))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let gpu = t("client.unknown");
    try {
      const c = document.createElement("canvas");
      const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) gpu = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL));
        else gpu = String(gl.getParameter(gl.RENDERER));
      }
    } catch {
      /* ignore */
    }

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string; downlink?: number };
      userAgentData?: { platform?: string };
    };

    setCli({
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lang: navigator.language,
      langs: (navigator.languages || []).slice(0, 4).join(", "),
      screen: `${window.screen.width}×${window.screen.height} (avail ${window.screen.availWidth}×${window.screen.availHeight})`,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      cores: nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : "—",
      mem: nav.deviceMemory ? `${nav.deviceMemory} GB` : "—",
      gpu: gpu.length > 64 ? `${gpu.slice(0, 64)}…` : gpu,
      touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      conn: nav.connection?.effectiveType ? `${nav.connection.effectiveType}${nav.connection.downlink ? ` · ${nav.connection.downlink}Mb/s` : ""}` : "—",
      dpr: String(window.devicePixelRatio),
      cookies: navigator.cookieEnabled,
      ls: (() => {
        try {
          localStorage.setItem("__t", "1");
          localStorage.removeItem("__t");
          return true;
        } catch {
          return false;
        }
      })(),
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, [t]);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="label">{t("sec.client")}</span>
        <button
          type="button"
          onClick={() => setShowIp((s) => !s)}
          className="rounded-md border border-line px-2 py-1 text-[11.5px] text-sub transition hover:border-accent hover:text-fg"
        >
          {showIp ? t("client.hide") : t("client.reveal")} IP
        </button>
      </div>
      <dl className="divide-y divide-line text-[12.5px]">
        {[
          [t("client.browser"), srv ? `${srv.browser} (${srv.engine})` : "…"],
          [t("client.os"), srv?.os ?? "…"],
          [t("client.ip"), srv ? (showIp ? srv.ip : `${"•".repeat(16)}`) : "…"],
          [t("client.lang"), cli ? `${cli.lang} — ${cli.langs}` : "…"],
          [t("client.tz"), cli?.tz ?? "…"],
          [t("client.screen"), cli?.screen ?? "…"],
          [t("client.viewport"), cli ? `${cli.viewport} @ DPR ${cli.dpr}` : "…"],
          [t("client.cores"), cli?.cores ?? "…"],
          [t("client.mem"), cli?.mem ?? "…"],
          [t("client.gpu"), cli?.gpu ?? "…"],
          [t("client.touch"), cli ? (cli.touch ? t("client.yes") : t("client.no")) : "…"],
          [t("client.conn"), cli?.conn ?? "…"],
        ].map(([k, v]) => (
          <div key={k as string} className="flex items-start gap-3 px-4 py-2">
            <dt className="w-28 shrink-0 text-sub">{k}</dt>
            <dd className="min-w-0 flex-1 break-all font-mono text-[11.5px]">{v as string}</dd>
          </div>
        ))}
        {srv ? (
          <div className="flex items-start gap-3 px-4 py-2">
            <dt className="w-28 shrink-0 text-sub">{t("client.ua")}</dt>
            <dd className="min-w-0 flex-1 break-all font-mono text-[11.5px] text-sub">{srv.ua || "—"}</dd>
          </div>
        ) : null}
        {cli ? (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <dt className="w-28 shrink-0 text-sub">Cookie / Storage</dt>
            <dd className="min-w-0 flex-1 font-mono text-[11.5px]">
              cookie:{cli.cookies ? "on" : "off"} · localStorage:{cli.ls ? "on" : "off"} · reduced-motion:
              {cli.reducedMotion ? "on" : "off"}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="border-t border-line px-4 py-2 font-mono text-[11.5px] text-sub">
        {locale === "ja"
          ? "IPは既定でマスクされます。ブラウザ判定はサーバー側UA解析 + クライアントAPIの実測値。"
          : "IP is masked by default. Browser info = server-side UA parsing + live client APIs."}
      </p>
    </div>
  );
}
