# syntax=docker.io/docker/dockerfile:1
#
# hikamers.app の Tor ミラー(.onion 隠しサービス)。
#
# ⚠️ 隠しサービスの秘密鍵は /var/lib/tor/hidden_service に生成される。
#    ここを永続ボリュームにしないと、コンテナを作り直すたびに .onion アドレスが変わる。
#
# ⚠️ 転送先は coolify-proxy (Traefik)。アプリのコンテナ名は
#    `qpwngujsq48pczt7zj47ane3-<毎回変わる数字>` なので直接指定できない
#    (`--network-alias` も Coolify 4.1.2 では効かなかった)。
#    代わりに Traefik 側へ Host(`<onion>.onion`) のルーターを足して受ける。
#    tor は宛先を「接続時」に解決するので、起動時にアプリが居なくても問題ない。

FROM alpine:3.20

RUN apk add --no-cache tor

# HiddenServiceDir は tor を走らせるユーザーが所有していること。
# このイメージは root で tor を動かすので root 所有で作る
# (debian-tor 等にすると "not owned by this user" で起動しない)。
RUN mkdir -p /var/lib/tor/hidden_service && chmod 700 /var/lib/tor/hidden_service

COPY torrc /etc/tor/torrc

EXPOSE 80
CMD ["tor", "-f", "/etc/tor/torrc"]
