"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** スクロールで出現するアニメーション */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** セクション見出し: 番号 + ラベル + 罫線 */
export function SectionHeading({
  index,
  title,
  sub,
  id,
}: {
  index: string;
  title: string;
  sub?: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-end gap-3">
        <span className="label">{index}</span>
        <span className="h-px flex-1 translate-y-[-6px] bg-line" />
      </div>
      <h2 className="display mt-2 text-3xl sm:text-4xl">
        {title}
        {sub ? <span className="ml-3 font-sans text-sm font-normal tracking-wide text-sub">{sub}</span> : null}
      </h2>
    </div>
  );
}

/** マウス位置を CSS 変数に渡してカードに光を追わせる */
export function GlowCard({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card p-5 ${className}`}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** 機密値(ウォレットアドレス等): 完全マスクがデフォルト + 👁 トグル */
export function SecretValue({ value, label }: { value: string; label?: string }) {
  const [shown, setShown] = useState(false);
  const masked = "•".repeat(Math.min(46, Math.max(18, value.length)));
  return (
    <div className="flex min-w-0 items-center gap-2">
      <code
        className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12.5px] text-fg"
        title={shown ? value : undefined}
      >
        {shown ? value : masked}
      </code>
      <button
        type="button"
        aria-label={shown ? "hide" : "reveal"}
        onClick={() => setShown((s) => !s)}
        className="shrink-0 rounded-md border border-line px-2 py-1 text-xs text-sub transition hover:border-accent hover:text-fg"
      >
        {shown ? "🙈" : "👁"}
      </button>
      {label ? <span className="hidden shrink-0 text-xs text-sub sm:inline">{label}</span> : null}
    </div>
  );
}

export function Chip({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span className="chip" title={title}>
      {children}
    </span>
  );
}

/**
 * 現在は未使用。マスク表示が必要になった時のために残してある
 * (公開前提の情報は CopyAddress / CopyButton で常時表示する方針)。
 *
 * 送金用アドレス(公開前提の情報)用の表示。
 * コピーできないと意味がないので、常に全文表示 + ワンクリックでコピー。
 * 秘密にする必要のある識別子には SecretValue を使う。
 */
export function CopyAddress({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // クリップボードAPIが使えない環境(非HTTPS等)は選択して手動コピー
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-w-0">
      <code className="block font-mono text-[11.5px] leading-relaxed break-all text-fg">{value}</code>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-md border border-line px-2.5 py-1 text-[11.5px] transition hover:border-accent hover:text-fg"
        >
          {copied ? "✓ コピーしました" : "コピー"}
        </button>
        {label ? <span className="text-[11.5px] text-sub">{label}</span> : null}
      </div>
    </div>
  );
}

/** リンクカードの ↗ と同じ位置に置く小さなコピーボタン */
export function CopyButton({
  value,
  label,
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const title = copied ? "コピーしました" : (label ?? "コピー");

  return (
    <button
      type="button"
      onClick={copy}
      title={title}
      aria-label={title}
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line text-sub transition hover:border-accent hover:text-fg ${className}`}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12.5 9.5 18 20 6.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="9" y="9" width="11" height="11" rx="2.2" />
          <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A2.5 2.5 0 0 0 4 5.5v6A2.5 2.5 0 0 0 6.5 14" />
        </svg>
      )}
    </button>
  );
}
