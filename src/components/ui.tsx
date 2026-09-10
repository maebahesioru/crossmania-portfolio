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
