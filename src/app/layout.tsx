import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RouteTransition } from "@/components/RouteTransition";
import { CookieConsent } from "@/components/CookieConsent";
import { PwaRegister } from "@/components/PwaRegister";
import { KeepAndroidBanner } from "@/components/KeepAndroid";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: `https://x.com/maebahesioru2` }],
  creator: SITE.name,
  keywords: [
    "十字架_mania",
    "ヒカマー",
    "Hikamer",
    "ポートフォリオ",
    "portfolio",
    "個人開発",
    "北海道",
    "Next.js",
    "Hikakin_Mania",
    "ヒカマニ",
  ],
  alternates: {
    canonical: "/",
    languages: { ja: "/", "ja-JP": "/", en: "/" },
    types: { "application/rss+xml": `${SITE.url}/feed.xml` },
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: "ja_JP",
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.descriptionEn,
    images: [SITE.ogImage],
    creator: "@maebahesioru2",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  category: "technology",
  // Google AdSense のサイト確認用。ads.txt と合わせて設置する
  other: { "google-adsense-account": "ca-pub-9868361167191737" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f7" },
    { media: "(prefers-color-scheme: dark)", color: "#060a15" },
  ],
  colorScheme: "dark light",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  alternateName: "maebahesioru2",
  url: SITE.url,
  jobTitle: "Student / Indie developer",
  address: { "@type": "PostalAddress", addressRegion: "Hokkaido", addressCountry: "JP" },
  sameAs: [
    "https://x.com/maebahesioru2",
    "https://github.com/maebahesioru",
    "https://bsky.app/profile/maebahesioru.bsky.social",
    "https://note.com/zyuuzika",
    "https://qiita.com/maebahesioru",
  ],
  knowsAbout: ["Next.js", "TypeScript", "Python", "Web development", "HoI4 modding"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="darkblue" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col" id="top">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {/* Google Consent Mode v2。広告Cookieは**既定で拒否**にしておき、
            クッキーバナーで「同意する」が選ばれたときだけ許可する。
            この既定値は AdSense のスクリプトより先に実行される必要があるので
            beforeInteractive で置く。 */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});`}
        </Script>
        {/* Google AdSense。async なので描画はブロックしない。
            SRI(integrity) は付けない: Google が随時更新する配信スクリプトで、
            ハッシュを固定するとある日広告が読み込めなくなる(公式の設置方法に従う)。 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9868361167191737"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        {/* LCP は keepandroidopen のバナー(公式スクリプトが挿入する DIV)なので、
            そのオリジンへの接続を HTML 解析中に始めておく。
            Cloudflare Insights は CF が自動注入するビーコン。 */}
        <link rel="preconnect" href="https://keepandroidopen.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://keepandroidopen.org" />
        <link rel="preconnect" href="https://static.cloudflareinsights.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        {/* ARD(Agentic Resource Discovery)の能力マニフェストへの導線。
            React が head に巻き上げる。robots.txt の Agentmap と同じものを指す。 */}
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" />

        <div className="bg-field" aria-hidden>
          <div className="aurora aurora-a" />
          <div className="aurora aurora-b" />
          <div className="aurora aurora-c" />
        </div>

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-panel focus:px-4 focus:py-2"
        >
          コンテンツへスキップ
        </a>

        <Providers>
          <KeepAndroidBanner />
          <Nav />
          <main id="main" className="flex-1">
            <RouteTransition>{children}</RouteTransition>
          </main>
          <Footer />
          <CookieConsent />
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}
