/**
 * ブログ記事の自動収集。
 *
 * note / Qiita / ビーストノート に新しい記事を投稿したら、サイト側が勝手に拾って
 * 一覧を更新する。手で `profile.ts` を編集しなくてよい。
 *
 * ソースごとの取得手段(すべて実測で確認した):
 *   - note           … 公式 RSS `https://note.com/<user>/rss`(RSS 2.0)
 *   - Qiita          … 公式 Atom `https://qiita.com/<user>/feed`
 *   - ビーストノート … 公開一覧 `https://beast-note.yajuvideo.st/notes?page=N` を著者で絞る
 *                      (フィードは無い。`/text_contents` は要ログインだが `/notes` は公開)
 *   - X              … **手動運用**(新規検知はしない)。既知 URL の日付だけ fxtwitter で最新化。
 *
 * ⚠️ 取得できた一覧をそのまま置き換えてはいけない。**必ず既知の一覧と「和集合」を取る**。
 *    note の RSS は最新 10 件しか返さないので、置き換えると古い記事が一覧から消える。
 */

import { readJson, writeJson } from "./store";
import { BLOG, type BlogPost, type SourceKey } from "./profile";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const NOTE_USER = "zyuuzika";
export const QIITA_USER = "maebahesioru";
export const BEASTNOTE_AUTHOR = "maebahesioru";
const X_NOTE =
  "X は新規投稿を自動検知しません(手動運用)。載せるときは profile.ts の BLOG に URL を1行足してください。";

export type SourceStatus = {
  ok: boolean;
  count: number;
  /** 取得できた最後の日付(新しい順の先頭) */
  latest?: string;
  error?: string;
  /** 今回の取得に失敗し、前回の結果を使い回している */
  stale?: boolean;
};

export type BlogFeed = {
  posts: BlogPost[];
  counts: Record<string, number>;
  status: Record<SourceKey, SourceStatus>;
  fetchedAt: string;
  /** 自動更新できないソースの説明(UI に出す) */
  notes: string[];
};

/** ソースごとの「最後に取れた一覧」。取得失敗時にここから補う */
type SourceCache = Partial<Record<SourceKey, { posts: BlogPost[]; at: string }>>;

const CACHE_FILE = "blog-cache.json";

/* ------------------------------------------------------------------ helpers */

async function http(url: string, ms = 9000): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    cache: "no-store",
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** RSS(2.0)の <item> を雑に取り出す。フィード用途なので厳密な XML 解釈は不要 */
function parseRss(xml: string): { title: string; url: string; date?: string }[] {
  const out: { title: string; url: string; date?: string }[] = [];
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const b = m[1];
    const title = pick(b, /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const link = pick(b, /<link>([\s\S]*?)<\/link>/i) || pick(b, /<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const date = pick(b, /<pubDate>([\s\S]*?)<\/pubDate>/i);
    if (title && link) out.push({ title, url: link, date: isoOrUndefined(date) });
  }
  return out;
}

/** Atom の <entry> を取り出す */
function parseAtom(xml: string): { title: string; url: string; date?: string }[] {
  const out: { title: string; url: string; date?: string }[] = [];
  for (const m of xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
    const b = m[1];
    const title = pick(b, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const link = pick(b, /<link[^>]*\bhref="([^"]+)"/i);
    const date = pick(b, /<(?:published|updated)>([\s\S]*?)<\//i);
    if (title && link) out.push({ title, url: link, date: isoOrUndefined(date) });
  }
  return out;
}

function pick(s: string, re: RegExp): string {
  const m = s.match(re);
  if (!m) return "";
  return decodeEntities(m[1].replace(/<[^>]+>/g, "").trim());
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** 日付らしき文字列を ISO(YYYY-MM-DD)に寄せる。読めなければ undefined */
export function isoOrUndefined(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const s = raw.trim();
  // 2026/08/13 形式
  const slash = s.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (slash) {
    return `${slash[1]}-${slash[2].padStart(2, "0")}-${slash[3].padStart(2, "0")}`;
  }
  return isoFromDate(new Date(s));
}

/**
 * ⚠️ UTC のまま日付を切ると 1 日ずれる。実測: Qiita の「2026-08-03T08:48:08+09:00」は
 *    UTC では 2026-08-02T23:48 になり、8/2 と表示された。**必ず JST に直してから**切る。
 */
function isoFromDate(d: Date): string | undefined {
  if (Number.isNaN(d.getTime())) return undefined;
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** URL の同一性判定(クエリ・ハッシュ・末尾スラッシュを無視) */
function key(url: string): string {
  try {
    const u = new URL(url);
    return (u.host + u.pathname).replace(/\/+$/, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/* ------------------------------------------------------------------ sources */

async function fetchNote(): Promise<BlogPost[]> {
  const xml = await http(`https://note.com/${NOTE_USER}/rss`);
  return parseRss(xml).map((x) => ({ ...x, source: "note" as const }));
}

async function fetchQiita(): Promise<BlogPost[]> {
  const xml = await http(`https://qiita.com/${QIITA_USER}/feed`);
  return parseAtom(xml).map((x) => ({ ...x, source: "qiita" as const }));
}

/**
 * ビーストノートの公開一覧 `/notes?page=N` を辿り、著者一致の記事を集める。
 *
 * ⚠️ 以前は「フィードも一覧ページも無い(`/text_contents` は要ログイン)」と書いてあったが**誤り**。
 *    `/notes` は**ログイン不要の公開一覧**(20件/ページ、`?page=N` でページング)で、
 *    各カードにタイトル・著者・更新日が入っている。記事ページの「関連ノート」を辿る方式は
 *    「新規記事が他の記事の関連カードに載らないと取りこぼす」という取りこぼしがあった。
 *
 * 一覧は更新日の降順なので、既知の最古より古いページに着いたら以降は新規なしと判断して止める
 * (新規投稿は必ず1ページ目の先頭側に出るので、途中で止めても検知は落ちない)。
 */
async function fetchBeastNoteListing(
  knownOldest: string,
  maxPages = 12
): Promise<BlogPost[]> {
  const out: BlogPost[] = [];
  for (let page = 1; page <= maxPages; page++) {
    let html: string;
    try {
      html = await http(`https://beast-note.yajuvideo.st/notes?page=${page}`, 12000);
    } catch {
      break;
    }
    const cards = [
      ...html.matchAll(
        /<a class="list-group-item list-group-item-action" href="(\/text_contents\/[0-9a-f-]{36})">([\s\S]*?)<\/a>/gi
      ),
    ];
    if (!cards.length) break;

    let oldestOnPage = "9999-99-99";
    for (const m of cards) {
      const body = m[2];
      const title = pick(body, /class="fw-semibold">([\s\S]*?)<\/div>/i);
      const author = body.match(/@([A-Za-z0-9_]+)\s*\//);
      const date = isoOrUndefined((body.match(/(\d{4}\/\d{2}\/\d{2})/) ?? [])[1]);
      if (date && date < oldestOnPage) oldestOnPage = date;
      if (!title || !author || author[1] !== BEASTNOTE_AUTHOR) continue;
      out.push({
        title,
        url: `https://beast-note.yajuvideo.st${m[1]}`,
        source: "beastnote",
        date,
      });
    }
    if (knownOldest && oldestOnPage < knownOldest) break;
    // 次ページが無ければ終端
    if (!new RegExp(`/notes\\?page=${page + 1}`).test(html)) break;
  }
  return out;
}

/**
 * 記事ページ下部の「関連ノート」カードから著者一致のものを拾う(保険)。
 * 一覧 `/notes` が取れなかったときだけ使う。
 */
async function fetchBeastNoteRelated(seeds: string[], maxSeeds = 5): Promise<BlogPost[]> {
  const found = new Map<string, BlogPost>();
  let used = 0;
  for (const seed of seeds) {
    if (used >= maxSeeds) break;
    used++;
    let html: string;
    try {
      html = await http(seed, 12000);
    } catch {
      continue;
    }
    const before = found.size;
    for (const m of html.matchAll(
      /<a\b[^>]*class="[^"]*archive-related-card[^"]*"[^>]*href="([^"]+)"([\s\S]*?)<\/a>/gi
    )) {
      const href = m[1];
      const body = m[2];
      const title = pick(body, /class="[^"]*archive-related-title[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      const meta = body.match(/@([A-Za-z0-9_]+)\s*\/\s*([\d/]+)/);
      if (!title || !meta) continue;
      if (meta[1] !== BEASTNOTE_AUTHOR) continue;
      const url = href.startsWith("http") ? href : `https://beast-note.yajuvideo.st${href}`;
      if (found.has(key(url))) continue;
      found.set(key(url), { title, url, source: "beastnote", date: isoOrUndefined(meta[2]) });
    }
    // このシードで新しい記事が増えなければ、これ以上辿っても収穫は無いと判断する
    if (found.size === before && used >= 2) break;
  }
  return [...found.values()];
}

/**
 * ビーストノートの記事を集める。公開一覧を優先し、取れなければ関連カードで保険をかける。
 */
async function fetchBeastNote(seeds: string[]): Promise<BlogPost[]> {
  const knownOldest = BLOG.filter((p) => p.source === "beastnote" && p.date)
    .map((p) => p.date as string)
    .sort()[0];
  const listed = await fetchBeastNoteListing(knownOldest ?? "");
  if (listed.length) return listed;
  return fetchBeastNoteRelated(seeds);
}

/**
 * X は**手動運用**。新規投稿の自動検知はしない(ユーザー判断で取りやめ)。
 *
 * ⚠️ 技術的には `https://syndication.twitter.com/srv/timeline-profile/screen-name/<user>` から
 *    認証不要でタイムラインが取れる(HTTP/2 でないと Cloudflare に 429 を返されるので
 *    `node:http2` が必要)。ただし X の「記事(Article)」はその一覧に含まれず自動検知できない。
 *    経緯と手段は README と skill `nextjs-site-scaffolding` の
 *    references/blog-auto-sync.md に残してある。
 *
 * ここでは既知の投稿 URL(profile.ts の BLOG)の日付とタイトルだけ fxtwitter で最新化する。
 * 新しい投稿を載せるときは profile.ts の BLOG に URL を1行足す。
 */
async function fetchX(urls: string[]): Promise<BlogPost[]> {
  const out: BlogPost[] = [];
  await Promise.all(
    urls.slice(0, 20).map(async (url) => {
      const m = url.match(/status\/(\d+)/);
      if (!m) return;
      try {
        const txt = await http(`https://api.fxtwitter.com/i/status/${m[1]}`, 9000);
        const j = JSON.parse(txt) as {
          tweet?: { created_at?: string; created_timestamp?: number; text?: string };
        };
        const t = j.tweet;
        if (!t) return;
        const date = t.created_timestamp
          ? isoFromDate(new Date(t.created_timestamp * 1000))
          : isoOrUndefined(t.created_at);
        // 本文が URL だけ(X の長文記事)の場合はタイトルにしない
        const body = (t.text ?? "").trim();
        const title = /^https?:\/\/\S+$/.test(body) ? undefined : body.split("\n")[0].slice(0, 120);
        out.push({ title: title || "", url, source: "x", date });
      } catch {
        /* 1件失敗しても他は活かす */
      }
    })
  );
  return out;
}

/* -------------------------------------------------------------------- merge */

export async function collectBlog(): Promise<BlogFeed> {
  const status = {} as Record<SourceKey, SourceStatus>;
  const notes: string[] = [];

  const xSeeds = BLOG.filter((p) => p.source === "x").map((p) => p.url);
  const bnSeeds = BLOG.filter((p) => p.source === "beastnote").map((p) => p.url);

  const [note, qiita, beast, x] = await Promise.all([
    fetchNote().catch((e) => {
      status.note = { ok: false, count: 0, error: String(e).slice(0, 80) };
      return [] as BlogPost[];
    }),
    fetchQiita().catch((e) => {
      status.qiita = { ok: false, count: 0, error: String(e).slice(0, 80) };
      return [] as BlogPost[];
    }),
    fetchBeastNote(bnSeeds).catch((e) => {
      status.beastnote = { ok: false, count: 0, error: String(e).slice(0, 80) };
      return [] as BlogPost[];
    }),
    fetchX(xSeeds),
  ]);

  const live: Record<string, BlogPost[]> = { note, qiita, beastnote: beast, x };

  /**
   * ⚠️ 失敗したソースをそのまま空で通すと、自動検知で載っていた投稿が一覧から消える。
   *    特に X のタイムラインは IP 単位のレート制限(30回/15分)があり、429 を食らうと
   *    その回だけ空になる。→ **前回の結果と「和集合」を取って埋める**。
   *    置き換えではなく足し算なので、今回取れなかった分が消えない。
   *    ファイルにも書くのでサーバー再起動をまたいでも残る。
   */
  const cached = await readJson<SourceCache>(CACHE_FILE, {});
  const next: SourceCache = { ...cached };
  const SOURCES: SourceKey[] = ["note", "qiita", "beastnote", "x"];

  for (const s of SOURCES) {
    const base = live[s] ?? [];
    const prev = cached[s]?.posts ?? [];
    const seen = new Set(base.map((p) => key(p.url)));
    const add = prev.filter((p) => !seen.has(key(p.url)));
    live[s] = [...base, ...add];

    const dates = live[s].map((p) => p.date).filter(Boolean).sort();
    status[s] = {
      ok: true,
      count: live[s].length,
      latest: dates[dates.length - 1],
      error: status[s]?.error,
      // 前回の結果で補った = 古い内容が混ざっている
      ...(add.length ? { stale: true } : {}),
    };
    if (live[s].length) next[s] = { posts: live[s], at: new Date().toISOString() };
  }
  await writeJson(CACHE_FILE, next).catch(() => {
    /* キャッシュが書けなくても一覧は返す */
  });
  if (status.x.stale) notes.push(X_NOTE);

  // 既知の一覧を土台にし、ライブ取得分で「日付とタイトルを補い、未知の URL を足す」
  const byKey = new Map<string, BlogPost>();
  for (const p of BLOG) byKey.set(key(p.url), { ...p });
  for (const list of Object.values(live)) {
    for (const p of list) {
      if (!p.url) continue;
      const k = key(p.url);
      const cur = byKey.get(k);
      if (cur) {
        // 日付はライブ側を優先(投稿後に編集されても追従できる)。タイトルは手元のものを残す
        if (p.date) cur.date = p.date;
        if (!cur.title && p.title) cur.title = p.title;
      } else {
        byKey.set(k, { ...p, title: p.title || p.url });
      }
    }
  }

  const posts = [...byKey.values()].sort((a, b) => {
    if (a.date && b.date) return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    if (a.date) return -1; // 日付があるものを前に
    if (b.date) return 1;
    return 0;
  });

  const counts: Record<string, number> = { all: posts.length };
  for (const p of posts) counts[p.source] = (counts[p.source] ?? 0) + 1;

  return { posts, counts, status, fetchedAt: new Date().toISOString(), notes };
}

