import { PUBLIC_API } from "@/lib/agentDocs";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/** 公開APIの OpenAPI 3.1 記述。API カタログ(RFC 9727)の service-desc が指す先。 */
export async function GET() {
  const paths: Record<string, unknown> = {};
  for (const a of PUBLIC_API) {
    const get: Record<string, unknown> = {
      summary: a.summary,
      responses: {
        "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } },
      },
    };
    const op: Record<string, unknown> = { get };
    if (a.path === "/api/bbs") {
      op.post = {
        summary: "BBSに投稿する。HIKAPTCHA(ロボット確認)の token と ticket が必須",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["body", "captchaToken", "captchaTicket"],
                properties: {
                  name: { type: "string", maxLength: 24 },
                  body: { type: "string", maxLength: 1500 },
                  delKey: { type: "string", minLength: 4, maxLength: 16 },
                  parentId: { type: ["string", "null"] },
                  captchaToken: { type: "string" },
                  captchaTicket: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "作成された" },
          "400": { description: "ロボット確認に失敗 / 入力不正" },
          "429": { description: "連投防止中" },
        },
      };
      op.delete = {
        summary: "自分の投稿を削除する(削除キーが必要)",
        parameters: [
          { name: "id", in: "query", required: true, schema: { type: "string" } },
          { name: "key", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "削除した" }, "403": { description: "削除キーが違う" } },
      };
    }
    paths[a.path] = op;
  }

  return Response.json(
    {
      openapi: "3.1.0",
      info: {
        title: `${SITE.name} public API`,
        version: "1.0.0",
        description:
          "十字架_mania のポートフォリオが公開している読み取りAPI。認証は不要。書き込みは BBS のみで HIKAPTCHA が必要。",
        contact: { url: SITE.url },
        license: { name: "WTFPL", url: `${SITE.url}/license` },
      },
      servers: [{ url: SITE.url }],
      paths,
    },
    { headers: { "cache-control": "public, max-age=3600" } },
  );
}
