import type { Metadata } from "next";
import { DonateContent } from "@/components/Donate";

export const metadata: Metadata = {
  title: "寄付",
  description:
    "十字架_mania への投げ銭。Monero (XMR)・Bitcoin・Litecoin・OFUSE(カード)で受け取っています。いただいた分はすべてサーバー代になります。",
  alternates: { canonical: "/donate" },
};

export default function DonatePage() {
  return <DonateContent />;
}
