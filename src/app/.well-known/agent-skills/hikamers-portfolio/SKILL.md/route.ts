import { agentSkillMd } from "@/lib/agentDocs";

export const dynamic = "force-static";

/** 配布する SKILL.md 本体。digest は index.json 側で同じ文字列から計算している。 */
export async function GET() {
  return new Response(agentSkillMd(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
