import type { Metadata } from "next";
import { TermsContent } from "@/components/Terms";

export const metadata: Metadata = {
  title: "利用規約",
  description: "十字架_mania ポートフォリオの利用規約。禁止事項・Cookie・免責・著作権について。",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsContent />;
}
