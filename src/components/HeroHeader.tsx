"use client";

import { PROFILE } from "@/lib/profile";
import { useI18n } from "@/lib/i18n";

/**
 * ヒーローのヘッダー。左に名前とプロフィール、右にキャラクター画像。
 * 画像は透過PNG(public/hero-character.png)をそのまま重ねる。
 */
export function HeroHeader() {
  const { t } = useI18n();

  return (
    <div className="panel relative overflow-hidden">
      {/* 画像の後ろに敷くハロー(テーマ色に追従) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(560px circle at 82% 42%, var(--glow), transparent 62%), radial-gradient(420px circle at 8% 96%, var(--glow-2), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden />

      <div className="relative flex flex-col-reverse items-center gap-4 px-6 pt-11 sm:px-8 md:flex-row md:items-end md:gap-6 md:pt-20 md:pb-0">
        {/* ---- テキスト ---- */}
        <div className="min-w-0 flex-1 md:pb-9">
          <span className="block h-1 w-24 rounded-full bg-accent sm:w-36" />

          <h1 className="display mt-4 text-[40px] leading-[1.05] sm:text-6xl lg:text-7xl">
            十字架
            <span className="font-mono text-[0.68em] font-bold tracking-tight text-accent">_mania</span>
          </h1>

          <p className="mt-4 font-mono text-[13px] tracking-[0.22em] text-sub sm:text-[15px]">HOKKAIDO / STUDENT / L/ACC</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip">MBTI {PROFILE.mbti}</span>
            <span className="chip">{t("hero.server")}</span>
            <span className="chip">self-hosted / Next.js</span>
          </div>

          <div className="mt-5 flex items-center gap-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent2" />
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#ffc84d]" />
            <span className="ml-1 font-mono text-[12.5px] whitespace-nowrap text-sub">{PROFILE.badge.ja}</span>
          </div>
        </div>

        {/* ---- キャラクター画像(カード下端まで伸ばして切る) ---- */}
        <div className="relative z-10 shrink-0 self-center md:self-end md:-mb-24 lg:-mb-28 xl:-mb-32">
          {/* 背後にうっすらアクセントの円を敷いて、明るいテーマでも輪郭が沈まないようにする */}
          <span
            className="pointer-events-none absolute top-[42%] left-1/2 h-[94%] w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 30%, transparent), transparent 78%)",
            }}
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <picture className="block">
            <source srcSet="/hero-character.webp" type="image/webp" />
            <img
              src="/hero-character.png"
              alt="十字架_mania のキャラクター"
              width={1240}
              height={1597}
              className="hero-char relative h-72 w-auto drop-shadow-[0_16px_34px_rgba(0,0,0,0.5)] sm:h-80 md:h-[480px] lg:h-[560px] xl:h-[640px]"
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
