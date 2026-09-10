"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { X_ACCOUNTS } from "@/lib/profile";

export type XAccount = {
  handle: string;
  ok: boolean;
  name?: string;
  followers?: number;
  following?: number;
  tweets?: number;
  avatar?: string;
  banner?: string;
  description?: string;
  protected?: boolean;
  verified?: boolean;
  joined?: string;
  error?: string;
};

type Payload = { accounts: Record<string, XAccount>; fetchedAt: string; cached?: boolean };

let memo: { at: number; data: Record<string, XAccount>; fetchedAt: string } | null = null;
const MEMO_MS = 60_000;

/**
 * fxtwitter から X アカウントの実データ(表示名/フォロワー/アイコン)を取得する。
 * 失敗時は null を返し、呼び出し側は静的な表示にフォールバックする。
 */
export function useXAccounts() {
  const [data, setData] = useState<Record<string, XAccount> | null>(memo ? memo.data : null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(memo ? memo.fetchedAt : null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (memo && Date.now() - memo.at < MEMO_MS) return;
    let alive = true;
    fetch("/api/x-accounts", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: Payload) => {
        if (!alive || !j.accounts) throw new Error("bad payload");
        memo = { at: Date.now(), data: j.accounts, fetchedAt: j.fetchedAt };
        setData(j.accounts);
        setFetchedAt(j.fetchedAt);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  return { accounts: data, fetchedAt, error };
}

export function formatCount(n: number | undefined, locale: string): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString(locale === "ja" ? "ja-JP" : "en-US");
}

export function relativeTime(iso: string | null, locale: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return locale === "ja" ? "たった今" : "just now";
  if (m < 60) return locale === "ja" ? `${m}分前` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return locale === "ja" ? `${h}時間前` : `${h}h ago`;
  return locale === "ja" ? `${Math.floor(h / 24)}日前` : `${Math.floor(h / 24)}d ago`;
}

export { X_ACCOUNTS };
