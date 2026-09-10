import type { Metadata } from "next";
import { MirrorContent } from "@/components/Mirror";

export const metadata: Metadata = {
  title: "ミラーページ",
  description: "検閲・ドメイン停止に備えたミラー。Onion ミラーは準備中です。",
  alternates: { canonical: "/mirror" },
};

export default function MirrorPage() {
  return <MirrorContent />;
}
