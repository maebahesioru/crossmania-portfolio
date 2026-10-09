import type { Metadata } from "next";
import { PrivacyContent } from "@/components/Privacy";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "十字架_mania ポートフォリオのプライバシーポリシー。広告(Google AdSense)・Cookie・アクセス解析の取り扱いについて。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
