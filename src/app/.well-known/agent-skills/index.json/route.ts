import { createHash } from "node:crypto";
import { agentSkillMd } from "@/lib/agentDocs";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const NAME = "hikamers-portfolio";

/**
 * Agent Skills Discovery の索引(agent-skills-discovery-rfc v0.2.0)。
 *
 * ⚠️ digest は配布する SKILL.md の中身と**必ず一致**させること。
 *    ここで同じ関数から生成しているのでズレようがない(手書きするとすぐズレる)。
 */
export async function GET() {
  const md = agentSkillMd();
  const digest = "sha256:" + createHash("sha256").update(md, "utf8").digest("hex");

  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name: NAME,
          type: "skill-md",
          description:
            "十字架_mania のポートフォリオ(hikamers.app)から、プロフィール・記事一覧・BBS・公開APIを読むためのスキル。",
          url: `${SITE.url}/.well-known/agent-skills/${NAME}/SKILL.md`,
          digest,
        },
      ],
    },
    { headers: { "cache-control": "public, max-age=3600" } },
  );
}
