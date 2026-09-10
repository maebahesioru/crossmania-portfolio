"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName = "light" | "darkblue" | "black";
export const THEMES: ThemeName[] = ["light", "darkblue", "black"];
export const THEME_KEY = "crossmania-theme";
export const DEFAULT_THEME: ThemeName = "darkblue";

type Ctx = { theme: ThemeName; setTheme: (t: ThemeName) => void; cycle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

function apply(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    let next: ThemeName = DEFAULT_THEME;
    try {
      const stored = localStorage.getItem(THEME_KEY) as ThemeName | null;
      if (stored && THEMES.includes(stored)) next = stored;
    } catch {
      /* ignore */
    }
    setThemeState(next);
    apply(next);
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    apply(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const cycle = useCallback(() => {
    setThemeState((cur) => {
      const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
      apply(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, setTheme, cycle }), [theme, setTheme, cycle]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/** FOUC 防止用のインラインスクリプト文字列(layout で beforeInteractive 実行)。
 *  既定はダークブルー固定(端末の prefers-color-scheme には追従しない)。 */
export const THEME_INIT_SCRIPT = `(function(){try{
var t=localStorage.getItem("${THEME_KEY}");
if(t!=="light"&&t!=="darkblue"&&t!=="black"){t="${DEFAULT_THEME}";}
document.documentElement.dataset.theme=t;
var l=localStorage.getItem("crossmania-locale");if(l==="en"||l==="ja"){document.documentElement.lang=l;}
}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}";}})();`;
