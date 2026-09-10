import { NextResponse } from "next/server";
import { WEATHER_SPOT } from "@/lib/site";

export const dynamic = "force-dynamic";

type Payload = {
  spot: string;
  current: { temp: number; code: number; feels: number; wind: number; isDay: boolean; time: string };
  days: { date: string; code: number; max: number; min: number; rain: number }[];
  fetchedAt: string;
  cached: boolean;
};

const TTL_MS = 20 * 60 * 1000;

let cache: { at: number; data: Payload } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ ...cache.data, cached: true });
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_SPOT.lat}&longitude=${WEATHER_SPOT.lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Asia%2FTokyo&forecast_days=3`;

  try {
    const res = await fetch(url, { cache: "no-store", headers: { "User-Agent": "crossmania-portfolio/1.0" } });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const j = (await res.json()) as {
      current: { time: string; temperature_2m: number; apparent_temperature: number; weather_code: number; is_day: number; wind_speed_10m: number };
      daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: (number | null)[] };
    };

    const data: Payload = {
      spot: WEATHER_SPOT.name,
      current: {
        temp: Math.round(j.current.temperature_2m * 10) / 10,
        feels: Math.round(j.current.apparent_temperature * 10) / 10,
        code: j.current.weather_code,
        wind: Math.round(j.current.wind_speed_10m * 10) / 10,
        isDay: j.current.is_day === 1,
        time: j.current.time,
      },
      days: j.daily.time.slice(0, 3).map((date, i) => ({
        date,
        code: j.daily.weather_code[i],
        max: Math.round(j.daily.temperature_2m_max[i] * 10) / 10,
        min: Math.round(j.daily.temperature_2m_min[i] * 10) / 10,
        rain: j.daily.precipitation_probability_max[i] ?? 0,
      })),
      fetchedAt: new Date().toISOString(),
      cached: false,
    };
    cache = { at: Date.now(), data };
    return NextResponse.json(data);
  } catch (e) {
    if (cache) return NextResponse.json({ ...cache.data, cached: true, stale: true });
    return NextResponse.json({ error: `天気を取得できませんでした: ${(e as Error).message}` }, { status: 502 });
  }
}
