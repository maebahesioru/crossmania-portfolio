import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/**
 * A2A Agent Card。
 * https://a2a-protocol.org/latest/specification/#5-agent-discovery-the-agent-card
 *
 * 実際に動いている A2A エンドポイント (/a2a) の能力を広告する。
 * streaming / pushNotifications は実装していないので false。
 */
export async function GET() {
  return Response.json(
    {
      name: "hikamers.app portfolio agent",
      version: "1.0.0",
      description:
        "十字架_mania (Hikamer / 北海道の学生) のポートフォリオサイト hikamers.app について答えるエージェント。"
        + "プロフィール・プロジェクト・記事・BBS・寄付先を日本語で返す。読み取り専用。",
      supportedInterfaces: [
        { url: `${SITE.url}/a2a`, transport: "JSONRPC" },
      ],
      provider: {
        organization: "hikamers.app",
        url: SITE.url,
      },
      documentationUrl: `${SITE.url}/llms.txt`,
      capabilities: {
        streaming: false,
        pushNotifications: false,
        stateTransitionHistory: false,
      },
      defaultInputModes: ["text/plain"],
      defaultOutputModes: ["text/plain"],
      skills: [
        {
          id: "profile",
          name: "プロフィール",
          description: "十字架_mania の自己紹介・肩書き・スキル(人前)を返す。",
          tags: ["profile", "about", "self-introduction"],
          examples: ["十字架_maniaって誰?", "自己紹介して"],
        },
        {
          id: "projects",
          name: "プロジェクト一覧",
          description: "公開しているWebサービス・ブラウザ拡張・Botの一覧を返す。",
          tags: ["projects", "apps", "portfolio"],
          examples: ["どんなもの作ってるの?", "プロジェクト一覧"],
        },
        {
          id: "blog",
          name: "記事一覧",
          description: "note / Qiita / Zenn / 野獣ノート / X に書いた記事の一覧を返す。",
          tags: ["blog", "articles", "posts"],
          examples: ["書いた記事を見せて", "ブログ一覧"],
        },
        {
          id: "bbs",
          name: "BBS",
          description: "サイトの掲示板の最近の投稿を返す。",
          tags: ["bbs", "comments", "board"],
          examples: ["最近のBBSの投稿は?", "掲示板のコメント"],
        },
        {
          id: "donate",
          name: "支援方法",
          description: "寄付・支援の方法(Monero / Bitcoin / Litecoin / OFUSE)を返す。",
          tags: ["donate", "support", "crypto"],
          examples: ["支援するには?", "寄付先を教えて"],
        },
        {
          id: "contacts",
          name: "連絡先",
          description: "X / GitHub / Zenn などの連絡先・アカウント一覧を返す。",
          tags: ["contact", "sns", "links"],
          examples: ["連絡先は?", "SNSのアカウント"],
        },
      ],
    },
    { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=3600" } },
  );
}
