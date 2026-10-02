/**
 * エージェント向けの公開ドキュメント(llms.txt / auth.md / agent-skills の SKILL.md)。
 *
 * ⚠️ 実体の無いものを書かないこと。ここに書いた URL はエージェントが実際に叩く。
 *    「OAuth で認証できる」等、存在しない機能を書くと、エージェント側から見て
 *    壊れたサイトになる(このサイトに認証は無く、公開APIは誰でも読める)。
 */
import { BLOG, CONTACTS, DONATIONS, PROFILE, PROJECTS, SKILLS } from "./profile";
import { SITE, SITE_URL } from "./site";

/** 公開している読み取りAPI。OpenAPI とカタログの両方がこれを参照する */
export const PUBLIC_API: { path: string; summary: string; params?: string }[] = [
  { path: "/api/blog", summary: "note / Qiita / Zenn / 野獣ノート / X の記事一覧(自動収集・30分キャッシュ)" },
  { path: "/api/bbs", summary: "BBSの投稿一覧。POST は HIKAPTCHA(ロボット確認)が必須", params: "id, key (DELETE)" },
  { path: "/api/visits", summary: "訪問者カウンター(のべ・ユニーク)" },
  { path: "/api/weather", summary: "北海道千歳の今日・明日の天気(Open-Meteo)" },
  { path: "/api/github", summary: "GitHub の最近のアクティビティ" },
  { path: "/api/client-info", summary: "リクエスト元のクライアント情報(IPはマスク)" },
  { path: "/api/x-accounts", summary: "X(Twitter)アカウントのライブ情報(fxtwitter 経由)" },
];

/** エージェントが読むべき主要ページ */
const PAGES: { path: string; title: string; desc: string }[] = [
  { path: "/", title: "ホーム", desc: "プロフィール・Skills・Projects・布陣・リンク・BBS" },
  { path: "/blog", title: "Blog", desc: "note / Qiita / Zenn / 野獣ノート / X の記事一覧と検索" },
  { path: "/bbs", title: "BBS", desc: "匿名の掲示板。ロボット確認あり" },
  { path: "/donate", title: "寄付", desc: "Monero / Bitcoin / Litecoin / OFUSE" },
  { path: "/mirror", title: "ミラー", desc: "Clearnet と Tor(.onion) のエンドポイント" },
  { path: "/terms", title: "利用規約", desc: "" },
  { path: "/license", title: "ライセンス", desc: "コードは WTFPL v2" },
];

/** llms.txt — LLM/エージェント向けのサイト索引(https://llmstxt.org の形式) */
export function llmsTxt(): string {
  const lines: string[] = [];
  lines.push(`# ${SITE.name} — Portfolio`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(
    `${PROFILE.name}(${PROFILE.nameEn} / @${PROFILE.handle})は北海道の学生開発者。` +
      `個人開発のWebアプリ・ブラウザ拡張・書き物をまとめている。`,
  );
  lines.push("");
  lines.push("## Pages");
  for (const p of PAGES) {
    lines.push(`- [${p.title}](${SITE_URL}${p.path})${p.desc ? `: ${p.desc}` : ""}`);
  }
  lines.push("");
  lines.push("## Public API");
  for (const a of PUBLIC_API) {
    lines.push(`- [${a.path}](${SITE_URL}${a.path}): ${a.summary}`);
  }
  lines.push("");
  lines.push("## Projects");
  for (const p of PROJECTS) {
    lines.push(`- [${p.name}](${p.url}): ${p.desc.ja}`);
  }
  lines.push("");
  lines.push("## Agent-facing documents");
  lines.push(`- [API catalog](${SITE_URL}/.well-known/api-catalog): 機械可読な API 索引(RFC 9727)`);
  lines.push(`- [OpenAPI](${SITE_URL}/openapi.json): 公開APIの仕様`);
  lines.push(`- [auth.md](${SITE_URL}/auth.md): 認証の扱い(このサイトは認証不要)`);
  lines.push(`- [Agent skills](${SITE_URL}/.well-known/agent-skills/index.json): エージェント向けスキル索引`);
  lines.push("");
  lines.push("## Notes");
  lines.push("- 公開APIは認証不要・読み取り自由。レート制限は緩いが常識的な範囲で。");
  lines.push("- 記事一覧は30分キャッシュ。出典は各プラットフォーム(note / Qiita / Zenn / 野獣ノート / X)。");
  lines.push("- コードは WTFPL v2。文章・イラストは © 十字架_mania。");
  lines.push("");
  return lines.join("\n");
}

/**
 * auth.md — エージェントに「このサイトの認証はどうなっているか」を説明する。
 * 認証が無いサイトでも、**自己完結した形で**それを明示するのが正しい
 * (存在しない OAuth メタデータを出すよりエージェントに親切)。
 */
export function authMd(): string {
  return `# auth.md

このサイト(\`${SITE_URL}\`)の公開APIは**認証不要**です。エージェントは登録なしで読み取れます。

## Audience

- AI エージェント / LLM クローラ / 検索エンジン
- 人間のブラウザ

## Registration

**登録はありません。** アカウント・APIキー・OAuthクライアントの払い出しは行っていません。

## Supported methods

| 操作 | 方法 |
|---|---|
| ページの閲覧 | 認証なし。\`Accept: text/markdown\` を付けると Markdown で返します |
| 公開APIの読み取り (GET) | 認証なし |
| BBSへの書き込み (POST) | 認証の代わりに **HIKAPTCHA**(画像によるロボット確認)が必要 |

- HIKAPTCHA: \`https://hikaptcha.hikamers.app\` のウィジェットで解いた \`token\` と \`ticket\` を
  \`POST /api/bbs\` の本文に含めます。サーバー側が \`/api/consume\` で検証します。
  これは「人間かどうか」の確認であり、エージェントの識別・認可ではありません。
- 書き込み系は BBS のみです。それ以外のエンドポイントは読み取り専用です。

## Credentials

発行している認証情報はありません。したがって:

- 送るべきトークン・クライアントシークレットは存在しません。
- \`Authorization\` ヘッダは不要です(付けても無視されます)。
- OAuth / OIDC のメタデータ(\`/.well-known/oauth-*\`)は**公開していません**。
  認可サーバーが無いためです。

## Contact

- X: [@${PROFILE.handle}](https://x.com/${PROFILE.handle})
- サイト: [${SITE_URL}](${SITE_URL})
`;
}

/** Agent Skills Discovery で配布する SKILL.md の中身 */
export function agentSkillMd(): string {
  return `---
name: hikamers-portfolio
description: 十字架_mania のポートフォリオ(hikamers.app)から、プロフィール・記事一覧・BBS・公開APIを読むためのスキル。
---

# hikamers.app を読む

北海道の学生開発者 十字架_mania のポートフォリオ。個人開発のWebアプリ、ブラウザ拡張、書き物をまとめている。

## いつ使うか

- この人物のプロフィール・作品・連絡先を知りたいとき
- note / Qiita / Zenn / 野獣ノート / X に書いた記事の一覧が欲しいとき
- サイトの公開APIからデータを取りたいとき

## ページを Markdown で取る

ブラウザ向けの HTML のほかに、\`Accept: text/markdown\` を付けると Markdown が返る。

\`\`\`bash
curl -H 'Accept: text/markdown' ${SITE_URL}/
curl -H 'Accept: text/markdown' ${SITE_URL}/blog
\`\`\`

対象パス: ${PAGES.map((p) => `\`${p.path}\``).join(", ")}

## 公開API(認証不要)

\`\`\`bash
curl ${SITE_URL}/api/blog      # 記事一覧(自動収集・30分キャッシュ)
curl ${SITE_URL}/api/visits    # 訪問者カウンター
curl ${SITE_URL}/api/weather   # 北海道千歳の天気
curl ${SITE_URL}/api/github    # GitHub アクティビティ
\`\`\`

- 仕様: [${SITE_URL}/openapi.json](${SITE_URL}/openapi.json)
- 索引: [${SITE_URL}/.well-known/api-catalog](${SITE_URL}/.well-known/api-catalog)
- 認証: 不要([${SITE_URL}/auth.md](${SITE_URL}/auth.md))

## 注意

- 記事の本文は各プラットフォーム(note / Qiita / Zenn / 野獣ノート / X)側にある。ここは一覧とリンクのみ。
- BBS への書き込みは HIKAPTCHA(画像認証)が必要。自動投稿は想定していない。
- 引用するときは出典として ${SITE_URL} を添えること。
`;
}

/** この人物の概要(Markdown 生成の共通部分) */
export function profileMarkdown(): string {
  const out: string[] = [];
  out.push(`# ${PROFILE.name} (${PROFILE.nameEn})`);
  out.push("");
  out.push(`- 読み: ${PROFILE.kana}`);
  out.push(`- 立場: ${PROFILE.roles.map((r) => r.ja).join(" / ")}`);
  out.push(`- 肩書き: ${PROFILE.badge.ja}`);
  out.push(`- MBTI: ${PROFILE.mbti}`);
  out.push(`- 場所: ${PROFILE.location.ja}`);
  out.push(`- 誕生日: ${PROFILE.birthday.ja}`);
  out.push(`- X: [@${PROFILE.handle}](https://x.com/${PROFILE.handle})`);
  out.push("");
  out.push("## 自己紹介");
  out.push("");
  for (const p of PROFILE.intro) out.push(p.ja);
  out.push("");
  out.push("## Skills(人前スケール 0.0〜1.0)");
  out.push("");
  for (const s of SKILLS) out.push(`- ${s.name}: ${s.level.toFixed(1)}人前`);
  out.push("");
  out.push("## Projects");
  out.push("");
  for (const p of PROJECTS) out.push(`- [${p.name}](${p.url}) — ${p.desc.ja}`);
  out.push("");
  out.push("## 連絡先");
  out.push("");
  for (const c of CONTACTS) out.push(`- ${c.label}: ${c.handle}${c.url ? ` (${c.url})` : ""}`);
  out.push("");
  out.push("## 寄付");
  out.push("");
  for (const d of DONATIONS) {
    out.push(`- ${d.label}${d.address ? `: \`${d.address}\`` : d.url ? `: ${d.url}` : ""}`);
  }
  out.push("");
  out.push(`サイト: [${SITE_URL}](${SITE_URL})`);
  out.push("");
  return out.join("\n");
}

/** BLOG の静的リスト(Markdown 用。ライブ収集は /api/blog 側) */
export function blogMarkdown(): string {
  const out: string[] = [];
  out.push("# Blog");
  out.push("");
  out.push("note / Qiita / Zenn / 野獣ノート / X に書いた記事の一覧。");
  out.push("最新の一覧(自動収集)は [/api/blog](" + SITE_URL + "/api/blog) で取れる。");
  out.push("");
  const sorted = [...BLOG].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  for (const p of sorted) {
    out.push(`- ${p.date ? `${p.date} ` : ""}[${p.title}](${p.url}) — ${p.source}`);
  }
  out.push("");
  return out.join("\n");
}
