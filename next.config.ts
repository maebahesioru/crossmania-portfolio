import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Docker コンテナ用の出力。`.next/standalone` に server.js と必要最小限の
   * node_modules だけを吐くので、実行イメージに node_modules 全部を入れずに済む。
   * ⚠️ これを外すと Dockerfile の `COPY .next/standalone` が失敗する。
   */
  output: "standalone",

  /**
   * ホームの応答に Link ヘッダを足す(エージェント向けの発見可能性)。
   * RFC 8288 の Link ヘッダ + RFC 9727 の api-catalog。
   *
   * ⚠️ ここに書く URL は実在させること。エージェントがそのまま辿る。
   */
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</openapi.json>; rel="service-desc"',
              '</llms.txt>; rel="service-doc"',
              '</auth.md>; rel="describedby"',
              '</.well-known/agent-skills/index.json>; rel="describedby"',
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
