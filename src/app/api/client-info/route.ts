import { NextResponse } from "next/server";
import { clientIp } from "@/lib/store";

export const dynamic = "force-dynamic";

function parseUa(ua: string) {
  const browser =
    /Edg\/([\d.]+)/.exec(ua)?.[0].replace("/", " ") ??
    /OPR\/([\d.]+)/.exec(ua)?.[0].replace("/", " ") ??
    /Chrome\/([\d.]+)/.exec(ua)?.[0].replace("/", " ") ??
    /Firefox\/([\d.]+)/.exec(ua)?.[0].replace("/", " ") ??
    /Version\/([\d.]+).*Safari/.exec(ua)?.[0].replace("Version/", "Safari ") ??
    "Unknown";

  let os = "Unknown";
  if (/Windows NT 10\.0/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(ua)) os = "Windows 8.1";
  else if (/Android ([\d.]+)/.test(ua)) os = ua.match(/Android ([\d.]+)/)?.[0] ?? "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS / iPadOS";
  else if (/Mac OS X ([\d_]+)/.test(ua)) os = (ua.match(/Mac OS X ([\d_]+)/)?.[0] ?? "macOS").replace(/_/g, ".");
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";

  const engine = /Gecko\/\d+/.test(ua) && /Firefox/.test(ua) ? "Gecko" : /AppleWebKit/.test(ua) ? "Blink/WebKit" : "Unknown";

  return { browser, os, engine };
}

export async function GET(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const parsed = parseUa(ua);
  return NextResponse.json(
    {
      ip: clientIp(req),
      ua,
      ...parsed,
      acceptLanguage: req.headers.get("accept-language") || "",
      secChUa: req.headers.get("sec-ch-ua") || "",
      secChUaPlatform: req.headers.get("sec-ch-ua-platform") || "",
      dnt: req.headers.get("dnt") || "",
      serverTime: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
