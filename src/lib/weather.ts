/** WMO weather code → ラベル / 絵文字 (client・server 共用・Node API 非依存) */
export type WCode = { emoji: string; ja: string; en: string };

const MAP: Record<number, WCode> = {
  0: { emoji: "☀️", ja: "快晴", en: "Clear" },
  1: { emoji: "🌤️", ja: "おおむね晴れ", en: "Mainly clear" },
  2: { emoji: "⛅", ja: "一部曇り", en: "Partly cloudy" },
  3: { emoji: "☁️", ja: "曇り", en: "Overcast" },
  45: { emoji: "🌫️", ja: "霧", en: "Fog" },
  48: { emoji: "🌫️", ja: "霧氷", en: "Depositing rime fog" },
  51: { emoji: "🌦️", ja: "弱い霧雨", en: "Light drizzle" },
  53: { emoji: "🌦️", ja: "霧雨", en: "Drizzle" },
  55: { emoji: "🌧️", ja: "強い霧雨", en: "Dense drizzle" },
  56: { emoji: "🌧️", ja: "着氷性霧雨", en: "Freezing drizzle" },
  57: { emoji: "🌧️", ja: "着氷性霧雨(強)", en: "Dense freezing drizzle" },
  61: { emoji: "🌦️", ja: "弱い雨", en: "Slight rain" },
  63: { emoji: "🌧️", ja: "雨", en: "Rain" },
  65: { emoji: "🌧️", ja: "強い雨", en: "Heavy rain" },
  66: { emoji: "🌧️", ja: "着氷性の雨", en: "Freezing rain" },
  67: { emoji: "🌧️", ja: "着氷性の雨(強)", en: "Heavy freezing rain" },
  71: { emoji: "🌨️", ja: "弱い雪", en: "Slight snow" },
  73: { emoji: "🌨️", ja: "雪", en: "Snow" },
  75: { emoji: "❄️", ja: "強い雪", en: "Heavy snow" },
  77: { emoji: "❄️", ja: "雪粒", en: "Snow grains" },
  80: { emoji: "🌦️", ja: "にわか雨", en: "Rain showers" },
  81: { emoji: "🌧️", ja: "にわか雨(強)", en: "Moderate rain showers" },
  82: { emoji: "⛈️", ja: "激しいにわか雨", en: "Violent rain showers" },
  85: { emoji: "🌨️", ja: "にわか雪", en: "Snow showers" },
  86: { emoji: "❄️", ja: "にわか雪(強)", en: "Heavy snow showers" },
  95: { emoji: "⛈️", ja: "雷雨", en: "Thunderstorm" },
  96: { emoji: "⛈️", ja: "雷雨(雹)", en: "Thunderstorm with hail" },
  99: { emoji: "⛈️", ja: "雷雨(激しい雹)", en: "Thunderstorm with heavy hail" },
};

export function wmo(code: number): WCode {
  return MAP[code] ?? { emoji: "❓", ja: `不明 (${code})`, en: `Unknown (${code})` };
}
