import { NextResponse } from "next/server";
import {
  agentSkillMd,
  blogMarkdown,
  llmsTxt,
  profileMarkdown,
} from "@/lib/agentDocs";
import { DONATIONS } from "@/lib/profile";
import { ONION_URL, SITE, SITE_URL } from "@/lib/site";
import { readJson } from "@/lib/store";

export const dynamic = "force-dynamic";

type Bbs = { posts: { name: string; body: string; at: string }[] };

/**
 * ページの Markdown 表現(Markdown for Agents)。
 *
 * ミドルウェアが `Accept: text/markdown` を見てここへ rewrite する。
 * HTML を変換するのではなく、**元データから組み立てる**ので表記が崩れない。
 *
 * ⚠️ ここに無いパスは 404 を返す(HTML をそのまま返すと「markdown を名乗る HTML」になり、
 *    エージェント側のパーサが混乱する)。
 */
export async function GET(req: Request) {
  // ミドルウェアはヘッダで渡す(rewrite はクエリを落とすことがある)。
  // 直接叩くときのために ?path= も受ける。
  const path =
    req.headers.get("x-md-path") || new URL(req.url).searchParams.get("path") || "/";
  const md = await render(path);
  if (md === null) {
    return NextResponse.json({ error: "markdown 未対応のパスです", path }, { status: 404 });
  }
  return new Response(md, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=600",
      "vary": "Accept",
    },
  });
}

async function render(path: string): Promise<string | null> {
  switch (path) {
    case "/":
      return profileMarkdown() + "\n---\n\n" + llmsTxt();

    case "/blog":
      return blogMarkdown();

    case "/bbs": {
      const data = await readJson<Bbs>("bbs.json", { posts: [] });
      const out = [
        "# BBS / コメント",
        "",
        "誰でも匿名で書き込める掲示板。**投稿にはロボット確認(HIKAPTCHA)が必要。**",
        "エージェントによる自動投稿は想定していない。",
        "",
        `投稿数: ${data.posts.length}`,
        "",
      ];
      for (const p of data.posts.slice(-30).reverse()) {
        out.push(`## ${p.name} — ${p.at}`);
        out.push("");
        out.push(p.body);
        out.push("");
      }
      return out.join("\n");
    }

    case "/donate": {
      const out = [
        "# 寄付",
        "",
        "投げ銭はすべてサーバー代になります。無理のない範囲で、気持ちだけでも嬉しいです。",
        "",
      ];
      for (const d of DONATIONS) {
        out.push(`## ${d.label}${d.recommended ? " (推奨)" : ""}`);
        out.push("");
        out.push(d.address ? `\`\`\`\n${d.address}\n\`\`\`` : d.url ? d.url : "");
        out.push("");
      }
      out.push("アドレスは公開情報です。金額の決まりはありません。");
      out.push("");
      return out.join("\n");
    }

    case "/mirror":
      return [
        "# ミラーページ",
        "",
        "検閲・ドメイン停止に備えたミラー。",
        "",
        "| エンドポイント | URL | 状態 |",
        "|---|---|---|",
        `| Clearnet | ${SITE.url} | LIVE |`,
        `| Tor (.onion) | ${ONION_URL ? `http://${ONION_URL}/` : "—"} | ${ONION_URL ? "LIVE" : "準備中"} |`,
        "",
        ".onion は Tor ネットワーク内でのみ解決されます。通常のブラウザでは開けません。",
        "",
      ].join("\n");

    case "/terms":
      return [
        "# 利用規約",
        "",
        `全文は ${SITE_URL}/terms にあります(HTML)。`,
        "",
        "要点:",
        "- 誹謗中傷・個人情報の投稿は禁止",
        "- 投稿の削除は投稿者自身の削除キーで行う",
        "- ロボット確認(HIKAPTCHA)を通過した投稿のみ受け付ける",
        "",
      ].join("\n");

    case "/license":
      return [
        "# ライセンス",
        "",
        "- コード: **WTFPL v2**(何をしてもよい)",
        "- 文章・イラスト・デザイン: © 十字架_mania",
        "- 同梱物: Twemoji (CC BY 4.0) / simple-icons (CC0) / Geist (SIL OFL 1.1)",
        "",
        `全文は ${SITE_URL}/license にあります。`,
        "",
      ].join("\n");

    case "/.well-known/agent-skills/hikamers-portfolio/SKILL.md":
      return agentSkillMd();

    default:
      return null;
  }
}
