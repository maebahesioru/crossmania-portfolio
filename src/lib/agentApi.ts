import { BLOG, CONTACTS, DONATIONS, PROFILE, PROJECTS, SKILLS, SOURCES } from "@/lib/profile";
import { readJson } from "@/lib/store";
import { SITE } from "@/lib/site";

/**
 * エージェント(MCP / A2A)に返すデータの共通層。
 * サイトの表示と同じ元データを使う。HTML をスクレイプさせないための入り口。
 */

export type BbsPost = { id: string; name: string; body: string; at: string };

const bbsFile = () => `${process.cwd()}/data/bbs.json`;

export async function recentBbs(limit = 20): Promise<BbsPost[]> {
  const d = await readJson<{ posts: BbsPost[] }>(bbsFile(), { posts: [] });
  return (d.posts || []).slice(-limit).reverse();
}

export function profileText(): string {
  const p = PROFILE;
  const skills = SKILLS.map((s) => `${s.name} ${s.level}人前`).join(" / ");
  return [
    `${p.name} (${p.nameEn}) — ${p.handle ? "@" + p.handle : ""}`,
    `読み: ${p.kana}`,
    `肩書き: ${p.roles.map((r) => r.ja).join(" / ")}`,
    `一言: ${p.badge.ja}`,
    `MBTI: ${p.mbti}`,
    `場所: ${p.location.ja}`,
    `誕生日: ${p.birthday.ja}`,
    `ヒカマー歴の起点: ${p.since}`,
    "",
    "自己紹介:",
    ...p.intro.map((t) => `- ${t.ja}`),
    "",
    `スキル: ${skills}`,
    `サイト: ${SITE.url}`,
  ].join("\n");
}

export function projectsText(): string {
  return PROJECTS.map((x) => `- ${x.name} (${x.tag.ja}) — ${x.desc.ja}\n  ${x.url}`).join("\n");
}

export function blogText(limit = 50): string {
  return BLOG.slice(0, limit)
    .map((b) => `- [${SOURCES[b.source].label}] ${b.title}${b.date ? ` (${b.date})` : ""}\n  ${b.url}`)
    .join("\n");
}

export async function bbsText(limit = 20): Promise<string> {
  const posts = await recentBbs(limit);
  if (!posts.length) return "まだ投稿がありません。";
  return posts.map((p) => `- ${p.at} ${p.name}: ${p.body}`).join("\n");
}

export function donateText(): string {
  return DONATIONS.map((d) =>
    d.address ? `- ${d.label}: ${d.address}` : `- ${d.label}: ${d.url}`,
  ).join("\n");
}

export function contactsText(): string {
  return CONTACTS.map((c) => `- ${c.label} ${c.handle}${c.url ? ` — ${c.url}` : ""}`).join("\n");
}

/** A2A のスキルルーティング。質問文からどのデータを返すか決める。 */
export async function answer(question: string): Promise<string> {
  const q = question.toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => q.includes(w));

  if (has("自己紹介", "誰", "プロフィール", "profile", "who", "about")) return profileText();
  if (has("プロジェクト", "作った", "開発した", "project", "apps")) return projectsText();
  if (has("記事", "ブログ", "blog", "posts", "書いた")) return blogText();
  if (has("bbs", "掲示板", "コメント", "board")) return await bbsText();
  if (has("寄付", "donate", "支援", "支援方法")) return donateText();
  if (has("連絡", "contact", "sns", "アカウント")) return contactsText();

  return [
    "このエージェントが答えられるのは hikamers.app (十字架_mania のポートフォリオ) についてです。",
    "",
    "聞けること:",
    "- 自己紹介・プロフィール",
    "- 作ったプロジェクト一覧",
    "- ブログ記事一覧",
    "- BBS の最近の投稿",
    "- 寄付・支援の方法",
    "- 連絡先・SNS",
    "",
    `詳細: ${SITE.url}/llms.txt`,
  ].join("\n");
}

export const MCP_TOOLS = [
  { name: "get_profile", description: "十字架_mania のプロフィール(自己紹介・スキル・肩書き)を返す", keys: ["profile"] },
  { name: "list_projects", description: "公開しているプロジェクトの一覧を返す", keys: ["projects"] },
  { name: "list_blog_posts", description: "書いた記事(note / Qiita / Zenn / 野獣ノート / X)の一覧を返す", keys: ["blog"] },
  { name: "list_bbs_posts", description: "BBS の最近の投稿を返す", keys: ["bbs"] },
  { name: "get_donate_info", description: "寄付・支援の方法(暗号通貨アドレス等)を返す", keys: ["donate"] },
  { name: "get_contacts", description: "連絡先・SNS アカウントの一覧を返す", keys: ["contacts"] },
] as const;

export async function callTool(name: string): Promise<string> {
  switch (name) {
    case "get_profile": return profileText();
    case "list_projects": return projectsText();
    case "list_blog_posts": return blogText();
    case "list_bbs_posts": return await bbsText();
    case "get_donate_info": return donateText();
    case "get_contacts": return contactsText();
    default: throw new Error(`unknown tool: ${name}`);
  }
}

/** MCP の resource として公開するページ(markdown 版が実在するものだけ) */
export const MCP_RESOURCES = [
  { uri: "hikamers://page/home", name: "ホーム", path: "/" },
  { uri: "hikamers://page/blog", name: "ブログ", path: "/blog" },
  { uri: "hikamers://page/bbs", name: "BBS", path: "/bbs" },
  { uri: "hikamers://page/donate", name: "寄付", path: "/donate" },
  { uri: "hikamers://page/mirror", name: "ミラー", path: "/mirror" },
  { uri: "hikamers://page/terms", name: "利用規約", path: "/terms" },
  { uri: "hikamers://page/license", name: "ライセンス", path: "/license" },
] as const;
