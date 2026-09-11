export const SITE_URL = process.env.SITE_URL || "https://hikamers.app";

/**
 * Tor ミラー(.onion)のアドレス。
 *
 * ⚠️ ハードコードしない。隠しサービスのアドレスは鍵から決まるので、
 *    実体(onion コンテナ)を作るまで確定しないし、鍵を作り直すと変わる。
 *    Coolify 側の環境変数 `NEXT_PUBLIC_ONION_URL` で渡す。
 *    未設定ならミラーページは「準備中」を出す。
 */
export const ONION_URL = (process.env.NEXT_PUBLIC_ONION_URL || "").trim();

export const SITE = {
  url: SITE_URL,
  name: "十字架_mania",
  title: "十字架_mania — Portfolio",
  tagline: "Hikamer / 雰囲気デベロッパー / 北海道",
  description:
    "十字架_mania のポートフォリオ。北海道在住の学生・L/ACC。個人開発(なれあいったー / Hikabooru / TwiGacha など)とブラウザ拡張、書き物をまとめています。",
  descriptionEn:
    "Portfolio of 十字架_mania — a student developer from Hokkaido, Japan. Web apps, browser extensions, bots and writing.",
  ogImage: "/og.png",
} as const;

export const GITHUB_USER = "maebahesioru";
/** 自宅サーバー(サブPC)の座標: 北海道・千歳 */
export const WEATHER_SPOT = {
  name: "北海道 (千歳)",
  lat: 42.8215,
  lon: 141.6516,
} as const;

export const HAS_SINCE = "2025-04-10T19:28:19+09:00";
