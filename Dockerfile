# syntax=docker.io/docker/dockerfile:1
#
# hikamers.app (十字架_mania ポートフォリオ) の本番イメージ。
#
# - 依存インストールとビルドは bun (このリポジトリの packageManager が bun)
# - 実行は node。standalone 出力の server.js を動かすだけなので軽い
#
# ⚠️ /app/data は**永続ボリュームのマウント先**(訪問者カウンター / BBS / blog キャッシュ)。
#    イメージ内に置いたままだとコンテナを作り直すたびに消える。
#    named volume は「イメージ側に既にあるディレクトリ」を所有者ごとコピーして初期化するので、
#    先に作って nextjs 所有にしておくこと(でないと実行ユーザーが書けず500になる)。

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM node:23-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# standalone には public と .next/static が含まれないので手でコピーする
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
