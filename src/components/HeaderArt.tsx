/**
 * ヘッダーアート: 名前 + 煙緋(原神)モチーフのオリジナルSVGイラスト。
 * インラインSVGなので CSS 変数(var(--fg) 等)でテーマに追従する。
 */
export function HeaderArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 470" className={className} role="img" aria-label="十字架_mania — header with Yanfei illustration">
      <defs>
        <linearGradient id="ha-name" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--fg)" />
          <stop offset="62%" stopColor="var(--fg)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <linearGradient id="ha-hair" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fff0f4" />
          <stop offset="55%" stopColor="#ffd0dd" />
          <stop offset="100%" stopColor="#ff9fba" />
        </linearGradient>
        <linearGradient id="ha-hat" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="60%" stopColor="#d81b3f" />
          <stop offset="100%" stopColor="#8d0f28" />
        </linearGradient>
        <linearGradient id="ha-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e01e46" />
          <stop offset="100%" stopColor="#7c0c22" />
        </linearGradient>
        <linearGradient id="ha-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="50%" stopColor="#ffc84d" />
          <stop offset="100%" stopColor="#c98a17" />
        </linearGradient>
        <linearGradient id="ha-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="55%" stopColor="var(--accent-2)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <radialGradient id="ha-halo" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.30" />
          <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ha-scrim" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#0b1526" />
          <stop offset="100%" stopColor="#03060d" />
        </radialGradient>
        <clipPath id="ha-clip">
          <circle cx="900" cy="235" r="188" />
        </clipPath>
      </defs>

      {/* ---- テキストブロック ---- */}
      <g>
        <rect x="42" y="86" width="150" height="4" rx="2" fill="var(--accent)" />
        <text x="42" y="212" fill="url(#ha-name)" fontFamily="'Yu Mincho','Hiragino Mincho ProN','Noto Serif JP',serif" fontWeight="800" fontSize="104"><tspan>十字架</tspan><tspan x="358" fontFamily="'Geist Mono',ui-monospace,Menlo,Consolas,monospace" fontSize="78" fontWeight="700" fill="var(--accent)">_mania</tspan></text>
        <text x="42" y="270" fill="var(--sub)" className="ha-hide-sm" fontFamily="'Geist Mono',ui-monospace,Menlo,Consolas,monospace" fontSize="20" letterSpacing="6">
          HOKKAIDO / STUDENT / L/ACC
        </text>
        <g transform="translate(42,300)" className="ha-hide-sm">
          <rect x="0" y="0" width="356" height="36" rx="18" fill="none" stroke="var(--line)" />
          <text x="18" y="24" fill="var(--sub)" fontFamily="'Geist Mono',ui-monospace,monospace" fontSize="16" letterSpacing="1.2">
            雰囲気デベロッパー · Hikamer
          </text>
        </g>
        <g transform="translate(42,366)" className="ha-hide-sm">
          <circle cx="8" cy="8" r="6" fill="var(--accent-2)" />
          <circle cx="32" cy="8" r="6" fill="var(--accent)" />
          <circle cx="56" cy="8" r="6" fill="var(--gold,#ffc84d)" />
        </g>
        <text x="112" y="380" fill="var(--sub)" className="ha-hide-sm" fontFamily="'Geist Mono',ui-monospace,monospace" fontSize="17">
          INFP-T / self-hosted / Next.js
        </text>
      </g>

      {/* ---- 煙緋モチーフ・エンブレム ---- */}
      <g>
        <circle cx="900" cy="235" r="215" fill="url(#ha-halo)" />
        <circle cx="900" cy="235" r="206" fill="none" stroke="var(--sub)" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="4 10" />
        <circle cx="900" cy="235" r="188" fill="url(#ha-scrim)" />
        <g clipPath="url(#ha-clip)">
          {/* 後ろ髪 */}
          <ellipse cx="900" cy="215" rx="150" ry="170" fill="url(#ha-hair)" opacity="0.92" />
          {/* 肩・衣装 */}
          <path d="M760 470 C 764 350 812 316 900 316 C 988 316 1036 350 1040 470 Z" fill="url(#ha-robe)" />
          <path d="M862 322 L 900 400 L 938 322 L 920 312 L 880 312 Z" fill="#fff3e8" />
          <path d="M880 312 L 900 372 L 920 312 L 900 306 Z" fill="var(--gold,#ffc84d)" opacity="0.9" />
          <path d="M812 470 C 818 390 840 352 878 330" fill="none" stroke="#00000030" strokeWidth="6" />
          <path d="M988 470 C 982 390 960 352 922 330" fill="none" stroke="#00000030" strokeWidth="6" />
          {/* 首 */}
          <path d="M876 276 L 924 276 L 924 320 C 924 336 876 336 876 320 Z" fill="#f6d3c4" />
          {/* 顔 */}
          <ellipse cx="900" cy="212" rx="72" ry="82" fill="#ffeadf" />
          <ellipse cx="900" cy="228" rx="72" ry="66" fill="#ffe0d2" />
          {/* 前髪 */}
          <path d="M820 190 C 826 128 862 104 900 104 C 938 104 974 128 980 190 C 962 160 946 148 922 156 C 910 160 902 172 898 182 C 892 160 872 146 850 150 C 836 152 828 168 820 190 Z" fill="url(#ha-hair)" />
          <path d="M844 190 C 850 158 868 142 890 142" fill="none" stroke="#ff9fba" strokeWidth="4" strokeLinecap="round" />
          <path d="M956 190 C 950 158 932 142 910 142" fill="none" stroke="#ff9fba" strokeWidth="4" strokeLinecap="round" />
          {/* 帽子(官帽風) */}
          <path d="M834 128 L 966 128 L 952 76 L 848 76 Z" fill="url(#ha-hat)" />
          <rect x="838" y="118" width="124" height="14" rx="4" fill="url(#ha-gold)" />
          <path d="M776 128 C 812 106 988 106 1024 128 C 1000 146 800 146 776 128 Z" fill="url(#ha-hat)" />
          <path d="M776 128 C 800 112 858 108 900 108 C 942 108 1000 112 1024 128" fill="none" stroke="url(#ha-gold)" strokeWidth="4" />
          <path d="M776 128 L 748 112 L 762 140 Z" fill="url(#ha-gold)" />
          <path d="M1024 128 L 1052 112 L 1038 140 Z" fill="url(#ha-gold)" />
          <path d="M900 66 L 916 88 L 900 108 L 884 88 Z" fill="url(#ha-gold)" />
          <circle cx="900" cy="60" r="9" fill="url(#ha-gold)" />
          {/* 目 */}
          <ellipse cx="872" cy="206" rx="15" ry="18" fill="#2f9e97" />
          <ellipse cx="928" cy="206" rx="15" ry="18" fill="#2f9e97" />
          <ellipse cx="872" cy="212" rx="9" ry="10" fill="#12494d" />
          <ellipse cx="928" cy="212" rx="9" ry="10" fill="#12494d" />
          <circle cx="866" cy="199" r="5" fill="#ffffff" opacity="0.95" />
          <circle cx="922" cy="199" r="5" fill="#ffffff" opacity="0.95" />
          <circle cx="878" cy="218" r="2.6" fill="#ffffff" opacity="0.7" />
          <circle cx="934" cy="218" r="2.6" fill="#ffffff" opacity="0.7" />
          <path d="M854 188 C 862 178 882 176 890 182" fill="none" stroke="#3a2a2a" strokeWidth="5" strokeLinecap="round" />
          <path d="M946 188 C 938 178 918 176 910 182" fill="none" stroke="#3a2a2a" strokeWidth="5" strokeLinecap="round" />
          {/* ほっぺ */}
          <ellipse cx="856" cy="236" rx="16" ry="8" fill="#ff8fab" opacity="0.55" />
          <ellipse cx="944" cy="236" rx="16" ry="8" fill="#ff8fab" opacity="0.55" />
          {/* 口 */}
          <path d="M892 252 C 897 260 903 260 908 252" fill="none" stroke="#b8566e" strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="900" cy="235" r="188" fill="none" stroke="url(#ha-ring)" strokeWidth="3" />
        {/* 装飾スパーク — エンブレム周囲に左右対称配置 */}
        <g opacity="0.85">
          <path d="M756 59 Q 758 70 769 72 Q 758 74 756 85 Q 754 74 743 72 Q 754 70 756 59 Z" fill="var(--accent)" />
          <path d="M1044 59 Q 1046 70 1057 72 Q 1046 74 1044 85 Q 1042 74 1031 72 Q 1042 70 1044 59 Z" fill="var(--accent)" />
          <path d="M756 387 Q 757.6 396.4 767 398 Q 757.6 399.6 756 409 Q 754.4 399.6 745 398 Q 754.4 396.4 756 387 Z" fill="var(--accent-2)" opacity="0.75" />
          <path d="M1044 387 Q 1045.6 396.4 1055 398 Q 1045.6 399.6 1044 409 Q 1042.4 399.6 1033 398 Q 1042.4 396.4 1044 387 Z" fill="var(--accent-2)" opacity="0.75" />
        </g>
      </g>
    </svg>
  );
}

/** 相互リンク用バナー(インライン表示用) */
export function BannerArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 40" width="200" height="40" className={className} role="img" aria-label="十字架_mania banner">
      <defs>
        <linearGradient id="bn-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1020" />
          <stop offset="100%" stopColor="#1b0b1c" />
        </linearGradient>
        <linearGradient id="bn-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff2d55" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="199" height="39" rx="4" fill="url(#bn-bg)" stroke="url(#bn-edge)" />
      <g transform="translate(9,9)">
        <rect x="0" y="0" width="22" height="22" rx="5" fill="url(#bn-edge)" />
        <path d="M11 4 L11 18 M5.5 9.5 L16.5 9.5" stroke="#0b1020" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <text x="39" y="20" fill="#f2f6ff" fontFamily="Meiryo,'Yu Gothic','Hiragino Sans',sans-serif" fontSize="12.5" fontWeight="700">
        十字架_mania
      </text>
      <text x="39" y="32" fill="#8fa4c8" fontFamily="ui-monospace,Consolas,monospace" fontSize="8">
        hikamers.app
      </text>
      <circle cx="186" cy="20" r="7" fill="none" stroke="#ff2d55" strokeWidth="1.4" />
      <circle cx="186" cy="20" r="2.4" fill="#38bdf8" />
    </svg>
  );
}
