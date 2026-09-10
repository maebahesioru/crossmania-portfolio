/* 十字架_mania — Portfolio Service Worker (PWA)
   方針:
     - ナビゲーション: ネットワーク優先 → キャッシュ → オフラインページ
     - 静的アセット: キャッシュ優先 → ネットワーク(失敗時は504を返す)
     - RSC(Nextのクライアント遷移ペイロード): ネットワークのみ(失敗時は504)
     - API: 一切キャッシュしない
   ⚠️ respondWith に渡す Promise は必ず Response を解決すること。
      例外を投げる / undefined を返すと
      "Failed to convert value to 'Response'" でネットワークエラーになる。 */
const CACHE = "crossmania-v3";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [
  "/",
  "/blog",
  "/bbs",
  "/terms",
  "/license",
  "/mirror",
  "/banner.svg",
  "/icon.svg",
  OFFLINE_URL,
];

/* オフライン画面がキャッシュに無くても必ず表示できるよう HTML を内蔵しておく */
const OFFLINE_HTML = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>オフライン — 十字架_mania</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#060a15;color:#e9eefb;
font-family:"Yu Gothic UI",Meiryo,system-ui,sans-serif;text-align:center;padding:2rem}
.c{border:1px solid #1d2c4a;background:#0c1425;border-radius:16px;padding:2.5rem 2rem;max-width:30rem}
h1{margin:0 0 .5rem;font-size:1.5rem}p{color:#a3b3ce;line-height:1.8;margin:.5rem 0 0;font-size:.9rem}
a{color:#7dd3fc}.x{font-size:2.5rem}
</style></head>
<body><div class="c"><div class="x">✚</div><h1>オフラインです</h1>
<p>ネットワークに接続できませんでした。自宅鯖がお休みしているか、回線が落ちているかもしれません。</p>
<p>接続が戻ったら <a href="/">トップページ</a> を再読み込みしてください。</p></div></body></html>`;

function offlineResponse() {
  return new Response(OFFLINE_HTML, {
    status: 503,
    statusText: "Offline",
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** 失敗しても例外を投げないキャッシュ参照(undefined を返さない) */
async function cacheMatch(req) {
  try {
    return (await caches.match(req)) || null;
  } catch {
    return null;
  }
}

async function cachePut(req, res) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(req, res);
  } catch {
    /* キャッシュ不可(容量・Vary等)は無視 */
  }
}

function isCacheableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|otf)$/i.test(url.pathname)
  );
}

/** Next.js のクライアント遷移ペイロードか */
function isRsc(req, url) {
  return req.headers.get("RSC") === "1" || url.searchParams.has("_rsc");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // 1件失敗してもプリキャッシュ全体を失敗させない
      await Promise.allSettled(PRECACHE.map((u) => cache.add(new Request(u, { cache: "reload" }))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // API は常にネットワーク

  // --- RSC(クライアント遷移): ネットワークのみ。落ちていても必ず Response を返す ---
  if (isRsc(req, url)) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          return new Response(null, { status: 504, statusText: "Offline" });
        }
      })(),
    );
    return;
  }

  // --- ナビゲーション(HTML) ---
  const isNavigate =
    req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isNavigate) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res && res.ok) cachePut(req, res.clone());
          return res;
        } catch {
          return (await cacheMatch(req)) || (await cacheMatch(OFFLINE_URL)) || offlineResponse();
        }
      })(),
    );
    return;
  }

  // --- 静的アセット: キャッシュ優先 ---
  event.respondWith(
    (async () => {
      const hit = await cacheMatch(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok && isCacheableAsset(url)) cachePut(req, res.clone());
        return res;
      } catch {
        // 取得失敗時も「空の504」を返す(undefined を返さない)
        return new Response(null, { status: 504, statusText: "Offline" });
      }
    })(),
  );
});
