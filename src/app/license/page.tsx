import type { Metadata } from "next";
import { LicenseContent } from "@/components/License";

export const metadata: Metadata = {
  title: "ライセンス",
  description: "コードは WTFPL v2。コンテンツは 十字架_mania に帰属します。",
  alternates: { canonical: "/license" },
};

export default function LicensePage() {
  return <LicenseContent />;
}
