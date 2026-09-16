"use client";

import { useEffect, useRef, useState } from "react";
import { HIKAPTCHA_URL } from "@/lib/site";

/**
 * HIKAPTCHA(画像選択型CAPTCHA)のウィジェット。
 *
 * 自前でUIを描かず、配布されている `captcha.js` に描画を任せる
 * (Shadow DOM の中で完結するので、こちらのCSSと干渉しない)。
 *
 * ⚠️ ここで受け取る token/ticket は**まだ未検証**。ウィジェットが「解けた」と
 *    言っただけでは人間と判定してはいけない。必ずサーバー側で `/api/consume` に
 *    投げて成功した時点で認証成立とする(トークンは5分で失効・ワンタイム)。
 */

type HikaptchaGlobal = {
  render: (
    mount: HTMLElement,
    opts: { apiBase: string; onSolved: (token: string, ticket: string) => void },
  ) => void;
};

declare global {
  interface Window {
    Hikaptcha?: HikaptchaGlobal;
    HikamaniCaptcha?: HikaptchaGlobal;
  }
}

export type CaptchaAnswer = { token: string; ticket: string } | null;

let scriptPromise: Promise<boolean> | null = null;

/** captcha.js を1度だけ読み込む(複数箇所で使っても二重ロードしない) */
function loadScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Hikaptcha) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const s = document.createElement("script");
    s.src = `${HIKAPTCHA_URL}/captcha.js`;
    s.async = true;
    s.dataset.hikaptcha = "1";
    s.onload = () => resolve(Boolean(window.Hikaptcha));
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function Hikaptcha({
  onSolved,
  resetKey = 0,
  label,
}: {
  onSolved: (a: CaptchaAnswer) => void;
  /** この値が変わるたびにウィジェットを作り直す(トークンはワンタイムなので投稿後に必須) */
  resetKey?: number;
  label?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  // 親の再描画で onSolved が作り直されても widget を再生成しないように参照で持つ
  const solvedRef = useRef(onSolved);
  solvedRef.current = onSolved;

  useEffect(() => {
    let alive = true;
    loadScript().then((ok) => {
      if (alive) setState(ok ? "ready" : "failed");
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const api = window.Hikaptcha;
    if (state !== "ready" || !host || !api) return;

    /**
     * ⚠️ captcha.js は mount に attachShadow() する。同じ要素に2回目を呼ぶと
     *    「shadow root が既にある」で例外になるので、毎回要素ごと作り直す。
     */
    const mount = document.createElement("div");
    host.replaceChildren(mount);
    try {
      api.render(mount, {
        apiBase: HIKAPTCHA_URL,
        onSolved: (token, ticket) => solvedRef.current({ token, ticket }),
      });
    } catch {
      /* 描画に失敗してもフォームは出す(サーバー側で弾かれる) */
    }
    return () => {
      host.replaceChildren();
    };
  }, [state, resetKey]);

  return (
    <div>
      {label ? <p className="label mb-2">{label}</p> : null}
      {state === "failed" ? (
        <p className="rounded-lg border border-line bg-panel2 px-3 py-2.5 text-[12px] text-sub">
          ロボット確認を読み込めませんでした。ページを再読み込みしてください。
        </p>
      ) : (
        <div ref={hostRef} data-hikaptcha-host />
      )}
    </div>
  );
}
