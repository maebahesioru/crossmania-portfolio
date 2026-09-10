import { NextResponse } from "next/server";
import { clientIp, hashId, jstString, readJson, withLock, writeJson } from "@/lib/store";

export const dynamic = "force-dynamic";

type Visits = {
  total: number;
  days: Record<string, number>;
  visitors: Record<string, number>; // hash → 訪問者番号(seq)
  seq: number;
  first: string | null;
  last: string | null;
};

const FILE = "visits.json";
const EMPTY: Visits = { total: 0, days: {}, visitors: {}, seq: 0, first: null, last: null };
const COOKIE = "cm_vid";
const DEDUPE_MS = 4_000;

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export async function GET(req: Request) {
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") || "";
  const vid = readCookie(req, COOKIE);
  const idHash = vid || hashId(`${ip}|${ua}|${jstString().slice(0, 10)}`);

  const result = await withLock(FILE, async () => {
    const data = await readJson<Visits>(FILE, { ...EMPTY });
    // 旧フォーマット(visitors が配列)からの移行
    if (Array.isArray((data as unknown as { visitors: unknown }).visitors)) {
      data.visitors = {};
    }
    data.days ??= {};
    data.visitors ??= {};

    const now = Date.now();
    const lastAt = (data as Visits & { _lastAt?: Record<string, number> })._lastAt ?? {};
    const key = hashId(idHash);
    const shouldCount = !lastAt[key] || now - lastAt[key] > DEDUPE_MS;

    let isNewVisitor = false;
    if (!data.visitors[key]) {
      data.seq += 1;
      data.visitors[key] = data.seq;
      isNewVisitor = true;
    }

    if (shouldCount) {
      data.total += 1;
      const day = jstString().slice(0, 10);
      data.days[day] = (data.days[day] ?? 0) + 1;
      lastAt[key] = now;
      data.first ??= new Date().toISOString();
      data.last = new Date().toISOString();
    }

    // 訪問者台帳が肥大化しないよう上限を設ける(古い順に間引く)
    const ids = Object.keys(data.visitors);
    if (ids.length > 20_000) {
      for (const k of ids.slice(0, ids.length - 20_000)) delete data.visitors[k];
    }

    await writeJson(FILE, { ...data, _lastAt: lastAt });
    return {
      total: data.total,
      today: data.days[jstString().slice(0, 10)] ?? 0,
      yours: data.visitors[key] ?? null,
      uniqueCount: data.seq,
      isNewVisitor,
      first: data.first,
      last: data.last,
    };
  });

  const mod = result.total % 1000;
  const res = NextResponse.json(
    {
      ...result,
      kiri: result.total > 0 && mod === 0,
      near: mod === 0 ? 1000 : 1000 - mod,
      jst: jstString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
  if (!vid) {
    res.cookies.set(COOKIE, idHash, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2,
      path: "/",
    });
  }
  return res;
}
