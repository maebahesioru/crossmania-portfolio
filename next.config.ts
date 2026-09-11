import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Docker コンテナ用の出力。`.next/standalone` に server.js と必要最小限の
   * node_modules だけを吐くので、実行イメージに node_modules 全部を入れずに済む。
   * ⚠️ これを外すと Dockerfile の `COPY .next/standalone` が失敗する。
   */
  output: "standalone",
};

export default nextConfig;
