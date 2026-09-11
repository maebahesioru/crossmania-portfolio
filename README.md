# 十字架_mania — Portfolio

北海道の学生 / Hikamer、**十字架_mania** のポートフォリオサイト。
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 / ビルドは **bun**。

> 公開予定URL: **https://hikamers.app**(ルートドメイン。環境変数 `SITE_URL` で上書き可)

## 開発

```bash
bun install
bun dev            # http://localhost:3000
bun run build      # 型チェック込みの本番ビルド
bun start -p 3700  # 本番モード起動 (MAINPC では :3700 を使用)
```

Windows で再起動する場合、`next start` を kill しても子プロセスがポートを掴むことがある:

```bash
PID=$(netstat -ano | grep ":3700" | grep LISTEN | head -1 | awk '{print $5}')
MSYS_NO_PATHCONV=1 taskkill /F /PID $PID
```

## 実装している機能

| 機能 | 実装場所 |
| --- | --- |
| 名前 + 煙緋(原神)のヘッダーSVG | `src/components/HeaderArt.tsx`(インラインSVG・CSS変数でテーマ追従) |
| 訪問者カウンター(のべ / あなたはN人目 / キリ番判定) | `src/app/api/visits/route.ts` + `src/components/VisitCounter.tsx` |
| ページ移動アニメーション(スイープバー + フェード) | `src/components/RouteTransition.tsx` |
| Skills のローディング風プログレス | `src/components/Skills.tsx`(IntersectionObserver + rAF) |
| Blog検索(タイトル / ソース絞り込み) | `src/components/BlogExplorer.tsx` |
| My Banner SVG / コピー用HTML | `public/banner.svg` + `src/components/LinksSection.tsx` |
| テーマ3種(ライト / ダークブルー / ブラック) | `src/app/globals.css` + `src/lib/theme.tsx` |
| keepandroidopen 公式カウントダウンバナー | `src/components/KeepAndroid.tsx`(公式 `banner.js` を読み込む) |
| PWA(manifest + Service Worker + オフライン画面) | `src/app/manifest.ts` / `public/sw.js` / `public/offline.html` |
| 現在時刻 (JST) / ヒカマー歴カウント | `src/components/ClockJST.tsx` |
| 利用規約 / ライセンス | `/terms` `/license`(`src/components/Terms.tsx` / `License.tsx`) |
| 多言語対応 (日本語 / English) | `src/lib/i18n.tsx`(localStorage 保存) |
| BBS・コメント(匿名 + 削除キー + 返信) | `src/app/api/bbs/route.ts` + `src/components/BBS.tsx` |
| 今日明日の天気 (北海道・千歳) | `src/app/api/weather/route.ts` + `src/components/WeatherCard.tsx` |
| GitHub Activity | `src/app/api/github/route.ts` + `src/components/GithubActivity.tsx` |
| クライアント情報(IPは既定でマスク) | `src/app/api/client-info/route.ts` + `src/components/ClientInfo.tsx` |
| Cookies 同意バナー | `src/components/CookieConsent.tsx` |
| favicon / OGP画像 / apple-touch-icon | `src/app/icon.svg` / `public/og.png` / `public/apple-icon.png` |

## keepandroidopen バナーについて

キャンペーンサイトが配布している **公式のカウントダウンバナー**(`https://keepandroidopen.org/banner.js`)を
そのまま読み込んでいる。自前でデザインしない。

- 文言・配色(赤グラデ)・2027年1月1日へのカウントダウン・閉じるボタン(30日記憶)はすべて公式実装
- 言語は `<html lang>` から自動判定される(`lang` パラメータは渡さない)
- `?id=kao-banner-host` で React 管理外のホスト要素の中に挿入させている
  (body直下に割り込ませると React の子要素と衝突するため)
- SRI は付けない(上流が随時更新する配布スクリプトのため)
- 公式スクリプトが読めない環境ではバナーが出ないだけで、サイト本体には影響しない

## データ保存

`data/` 配下(リポジトリには含めない):

- `visits.json` — 訪問者カウンター(ハッシュ化した訪問者IDのみ。生IPは保存しない)
- `bbs.json` — 掲示板の投稿。削除キーはハッシュ(`sha` 相当の自作ハッシュ)で保存

`data/` は `.gitignore` 済み。アップロードや投稿の実データはサーバー側にのみ残る。

## 言語 / テーマ / Cookie

- テーマ: `localStorage["crossmania-theme"]` = `light` | `darkblue`(既定) | `black`
- 言語: `localStorage["crossmania-locale"]` = `ja`(既定) | `en`
- 同意: `localStorage["crossmania-cookie-consent"]`
- FOUC 防止のため `<html data-theme>` はインラインスクリプト(`THEME_INIT_SCRIPT`)で初期化

## 画像アセットの再生成

```bash
python scripts/gen-assets.py   # public/icon-192/512, apple-icon.png, og.png を再生成 (Pillow 必須)
python scripts/upscale-hero.py <元画像.png>   # ヒーローキャラを4倍超解像 (下記)
```

### ヒーローキャラの高画質化パイプライン

`scripts/upscale-hero.py` は **Real-ESRGAN (ncnn/Vulkan ポータブル版)** を呼んで、
低解像度の素材を表示に耐える解像度まで引き上げる。

1. `realesrgan-x4plus-anime` で4倍超解像 (446×559 → 1784×2236)
2. 明背景切り抜き由来の**白フチ除去** + アルファの帯を締めてゴミを削除
3. 可視領域でトリム
4. 目標幅まで **Lanczos でスーパーサンプリング縮小**(過剰シャープのハローを消しつつ精細さを残す)
5. `hero-character.png`(フォールバック) と `hero-character.webp`(本命) を出力

`.tools/resrgan/realesrgan-ncnn-vulkan.exe` が必要(gitには含めない):

```bash
mkdir -p .tools && cd .tools
curl -sLO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip
python -c "import zipfile;zipfile.ZipFile('resrgan.zip').extractall('resrgan')"
```

配信は `<picture>` で WebP を優先し、PNG にフォールバックする
(1240×1597: PNG 1.4MB / WebP 236KB)。表示は最大 497×640 CSS px なので
Retina でも 2.5倍以上の画素密度になる。

## デプロイ

```bash
SITE_URL=https://hikamers.app bun run build
SITE_URL=https://hikamers.app bun start -p 3700
```

canonical / OGP / sitemap / RSS はすべて `SITE_URL` を参照するので、本番ドメインを必ず設定する。

## Blog の自動更新

`/api/blog` が4ソースを自動で集める(`src/lib/blog.ts`)。記事を投稿すればサイト側が勝手に拾う。

| ソース | 取得方法 | 新規検知 |
|---|---|---|
| note | 公式 RSS `note.com/<user>/rss` | ○ |
| Qiita | 公式 Atom `qiita.com/<user>/feed` | ○ |
| 野獣ノート | 公開一覧 `/notes?page=N` を著者で絞る | ○ |
| X | **手動**(既知 URL の日付だけ fxtwitter で最新化) | × |

- 取得は**30分キャッシュ**(全ソース失敗時は5分)。SW は `/api/` をキャッシュしないので常に最新。
- **`profile.ts` の BLOG は消さない**。note の RSS は最新10件しか返さないので、置き換えると古い記事が消える。取得結果と**和集合**を取る設計。
- 取得に失敗したソースは `data/blog-cache.json` の前回結果で埋める(429等で一覧が縮まない)。

### なぜ X だけ手動なのか

X は**新規投稿の自動検知をやめた**(手動運用)。理由と、やろうとした場合の手段を残しておく:

- タイムライン自体は取れる。`https://syndication.twitter.com/srv/timeline-profile/screen-name/<user>` が認証不要で 99 件分の `full_text` / `created_at` / `permalink` を返す。
- ただし **X の「記事(Article)」はその一覧に含まれない**(記事IDは生HTMLに1回も出ない)。サイトに載せたい長文はまさに記事なので、自動化しても取りこぼす。
- そのうえ **Node の fetch では取れない**。undici は HTTP/1.1 で繋ぐため Cloudflare に**フィンガープリント単位で 429** を返される。同じ瞬間・同じUAで `bun fetch` と `node:http2` は 200、`node fetch` だけ 429。ヘッダをブラウザに寄せても無効(JA3 が鍵)で、`node:http2` が必要。
- レート制限は 30回/15分(IP単位)。

→ 手間に対して得られるものが少ないため手動。再開したい場合の実装は skill `nextjs-site-scaffolding` の `references/blog-auto-sync.md` にある。

### 落とし穴(すべて実測済み)

- **件数を固定値でテストしない**。記事は自動で増えるので、テストは `/api/blog` の `counts` を基準にする(固定値22で書いていたため 29 になった瞬間に3件壊れた)。
- 見出しの件数も**ライブ値**にする(`BlogCount`)。`BLOG.length` を焼き込むと「見出し22 / 一覧29」とズレる。

## ライセンス

- コード: **WTFPL v2**(`/license`)
- 文章・イラスト・デザイン: © 十字架_mania
- ブランドアイコン: simple-icons (CC0 1.0) / 天気: Open-Meteo (CC BY 4.0) / フォント: Geist (SIL OFL 1.1)
- 絵文字: **Twemoji**(CC BY 4.0 / `public/fonts/twemoji.woff2`) + Twemoji Country Flags(MIT / `twemoji-flags.woff2`)
- 煙緋などゲームキャラクターの権利は各社に帰属(非公式のファン活動)

## 絵文字(Twemoji)

OS の絵文字フォント(Windows=Segoe UI Emoji / macOS=Apple Color Emoji / Android=Noto)は
環境ごとに絵柄が違う。X と同じ Twemoji を自前配信して全環境で揃えている。

- `src/app/globals.css` の `@font-face` 2つ(`unicode-range` 付き) + `--font-emoji` で
  本文のフォント鎖の**先頭**に入れる。`unicode-range` があるので通常の文字は次のフォントに流れる。
- **矢印 U+2190-21FF はわざと範囲から外している** — ↗ ← ↑ ↓ → はリンク装飾として
  テキストのまま使っており、Twemoji の矢印(青い四角)になると UI が崩れる。
- **国旗は別ファイルが必須** — Windows は国旗絵文字のグリフを持たず `🇯🇵` が「JP」と
  文字で出る。`TwemojiCountryFlags.woff2` が GSUB リガチャで旗 1 グリフに変換する。
- テーマ切替アイコンは **SVG**(`Nav.tsx` の `THEME_GLYPH`)。`☀`(U+2600) は天気の
  「快晴 ☀️」と同一符号位置なので、絵文字のままだと片方だけ Twemoji になって不揃いになる。

```bash
# 更新するとき
curl -sL -o public/fonts/twemoji.woff2 \
  https://github.com/TCOTC/twemoji-colr/releases/download/v17.0.3/twemoji-colr.woff2
# 国旗: npm の country-flag-emoji-polyfill から TwemojiCountryFlags.woff2 を取り出す
```
