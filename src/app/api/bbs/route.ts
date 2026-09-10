import { NextResponse } from "next/server";
import { clientIp, hashId, readJson, withLock, writeJson } from "@/lib/store";

export const dynamic = "force-dynamic";

export type BbsPost = {
  id: string;
  name: string;
  body: string;
  at: string;
  parentId: string | null;
  keyHash: string | null;
  ua: string;
};

type Bbs = { posts: BbsPost[] };

const FILE = "bbs.json";
const EMPTY: Bbs = { posts: [] };
const COOLDOWN_MS = 15_000;
const lastPost = new Map<string, number>();

function publicPost(p: BbsPost) {
  return { id: p.id, name: p.name, body: p.body, at: p.at, parentId: p.parentId };
}

function sanitize(s: string): string {
  return s.replace(/\r\n/g, "\n").trim();
}

export async function GET() {
  const data = await readJson<Bbs>(FILE, EMPTY);
  return NextResponse.json(
    { posts: [...data.posts].sort((a, b) => b.at.localeCompare(a.at)).map(publicPost) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  let payload: { name?: string; body?: string; delKey?: string; parentId?: string | null };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const name = sanitize(String(payload.name ?? "")).slice(0, 24) || "名無しヒカマー";
  const body = sanitize(String(payload.body ?? ""));
  const delKey = sanitize(String(payload.delKey ?? "")).slice(0, 32);
  const parentId = payload.parentId ? String(payload.parentId) : null;

  if (!body) return NextResponse.json({ error: "本文を入力してください" }, { status: 400 });
  if (body.length > 1500) return NextResponse.json({ error: "本文は1500文字までです" }, { status: 400 });
  if (delKey && (delKey.length < 4 || delKey.length > 16)) {
    return NextResponse.json({ error: "削除キーは4〜16文字にしてください" }, { status: 400 });
  }

  const ipHash = hashId(clientIp(req));
  const now = Date.now();
  const prev = lastPost.get(ipHash) ?? 0;
  if (now - prev < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - prev)) / 1000);
    return NextResponse.json({ error: `連投防止中です。あと${wait}秒お待ちください。` }, { status: 429 });
  }

  const data = await withLock(FILE, async () => {
    const cur = await readJson<Bbs>(FILE, { posts: [] });
    if (parentId && !cur.posts.some((p) => p.id === parentId)) {
      throw new Error("PARENT_NOT_FOUND");
    }
    const post: BbsPost = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      body,
      at: new Date().toISOString(),
      parentId,
      keyHash: delKey ? hashId(`bbs:${delKey}`) : null,
      ua: (req.headers.get("user-agent") || "").slice(0, 180),
    };
    cur.posts.push(post);
    if (cur.posts.length > 5000) cur.posts = cur.posts.slice(-5000);
    await writeJson(FILE, cur);
    return post;
  }).catch((e: Error) => {
    if (e.message === "PARENT_NOT_FOUND") return null;
    throw e;
  });

  if (!data) return NextResponse.json({ error: "返信先が見つかりません" }, { status: 404 });
  lastPost.set(ipHash, now);
  return NextResponse.json({ post: publicPost(data) }, { status: 201 });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const key = url.searchParams.get("key") || "";
  if (!id) return NextResponse.json({ error: "idが必要です" }, { status: 400 });

  const ok = await withLock(FILE, async () => {
    const cur = await readJson<Bbs>(FILE, { posts: [] });
    const target = cur.posts.find((p) => p.id === id);
    if (!target) return false;
    if (!target.keyHash || target.keyHash !== hashId(`bbs:${key}`)) return false;
    cur.posts = cur.posts.filter((p) => p.id !== id && p.parentId !== id);
    await writeJson(FILE, cur);
    return true;
  });

  if (!ok) return NextResponse.json({ error: "削除キーが違います" }, { status: 403 });
  return NextResponse.json({ ok: true });
}
