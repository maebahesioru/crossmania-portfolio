# 十字架_mania — Portfolio

北海道の学生 / Hikamer、**十字架_mania** のポートフォリオサイト。
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 / ビルドは **bun**。

> 公開予定URL: https://crossmania.hikamers.app (環境変数 `SITE_URL` で上書き可)

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
| keepandroidopen ヘッダー | `src/components/KeepAndroid.tsx` |
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
```

## デプロイ

```bash
SITE_URL=https://crossmania.hikamers.app bun run build
SITE_URL=https://crossmania.hikamers.app bun start -p 3700
```

canonical / OGP / sitemap / RSS はすべて `SITE_URL` を参照するので、本番ドメインを必ず設定する。

## ライセンス

- コード: **WTFPL v2**(`/license`)
- 文章・イラスト・デザイン: © 十字架_mania
- ブランドアイコン: simple-icons (CC0 1.0) / 天気: Open-Meteo (CC BY 4.0) / フォント: Geist (SIL OFL 1.1)
- 煙緋などゲームキャラクターの権利は各社に帰属(非公式のファン活動)
