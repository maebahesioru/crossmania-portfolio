import type { Metadata } from "next";
import { MirrorContent } from "@/components/Mirror";
import { ONION_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ミラーページ",
  description: "検閲・ドメイン停止に備えたミラー。Onion ミラーも公開しています。",
  alternates: { canonical: "/mirror" },
};

export default function MirrorPage() {
  /* ⚠️ env はサーバー側で読んで props で渡す。Mirror は "use client" なので、
     クライアントコンポーネントから process.env.X(NEXT_PUBLIC_ 以外)を読んでも undefined になる。 */
  return <MirrorContent clearnet={SITE_URL} onion={ONION_URL} />;
}
