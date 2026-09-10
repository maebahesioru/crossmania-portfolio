/**
 * プロフィール本体データ。UI から参照する唯一のソース。
 * テキストは { ja, en } の対で持つ(多言語対応)。
 */
export type LText = { ja: string; en: string };
export type IconName =
  | "x"
  | "bluesky"
  | "github"
  | "note"
  | "qiita"
  | "youtube"
  | "niconico"
  | "instagram"
  | "twitch"
  | "tiktok"
  | "reddit"
  | "signal"
  | "session"
  | "telegram"
  | "north";

export const PROFILE = {
  name: "十字架_mania",
  nameEn: "Cross Mania",
  kana: "じゅうじか まにあ",
  handle: "maebahesioru2",
  roles: [
    { ja: "北海道 / Student / L/ACC", en: "Hokkaido, Japan / Student / L/ACC" },
  ],
  badge: { ja: "雰囲気デベロッパー · Hikamer", en: "Vibe Developer · Hikamer" },
  mbti: "INFP-T",
  location: { ja: "北海道・日本", en: "Hokkaido, Japan" },
  birthday: { ja: "9月21日 (安倍晋三と同じ誕生日)", en: "September 21 (same birthday as Shinzo Abe)" },
  since: "2025-04-10T19:28:19+09:00",
  /** ヒカマー界隈に存在し始めた日 */
  sinceNote: { ja: "から年日数カウント", en: "days and counting since I joined the Hikamer scene" },
  intro: [
    {
      ja: "こんにちは！ネット(主にシコッター)で色々やってる高1ヒカマーです！誕生日は9月21日(安倍晋三と誕生日が一緒)です。",
      en: "Hi! I'm a high-school Hikamer (1st year) doing all sorts of things online, mostly on the timeline formerly known as Twitter.",
    },
    {
      ja: "某ピンクみたいな個人開発者もどきで、なんちゃって程度の世界史好きでもあります。",
      en: "A would-be indie developer with the energy of a certain pink-flavoured one, and a decidedly amateur world-history nerd.",
    },
    {
      ja: "ホヨバ関連が好きで、特に煙緋(原神)・山田リョウ(ぼざろ)・杏山カズサ(ブルアカ)・ヒアンシー(崩壊スターレイル)等が推し。女装癖もあります。",
      en: "Huge HoYoverse fan. Oshi: Yanfei (Genshin), Ryo Yamada (Bocchi), Kazusa Kyoyama (Blue Archive), Hyacine (Honkai: Star Rail). Also, I like cross-dressing.",
    },
    {
      ja: "他にも個人的に興味のあるサイトやその内部を除いてみたり、調べ物をするのが好きです。",
      en: "I also like poking around interesting websites — and their internals — and just researching things.",
    },
    {
      ja: "Twitterなどでも気軽にいいねしたり(ファボなしRTしたり)リプで話しかけてください！ヒカマーならしっかりヒカマニ語録で返すことを心がけています。",
      en: "Feel free to like, quote-retweet, or reply to me on X. If you're a Hikamer I'll answer with a proper Hikamani quote.",
    },
    {
      ja: "皆さんこれからもよろしくお願いします！相互リンク募集中です！DMなどで教えてください！",
      en: "Thanks for stopping by! I'm always looking for mutual links — DM me.",
    },
  ] as LText[],

  oshi: [
    { name: "煙緋", romaji: "Yanfei", from: { ja: "原神", en: "Genshin Impact" }, color: "#ff5d3a" },
    { name: "山田リョウ", romaji: "Ryo Yamada", from: { ja: "ぼっち・ざ・ろっく！", en: "Bocchi the Rock!" }, color: "#4f8ef7" },
    { name: "杏山カズサ", romaji: "Kazusa Kyoyama", from: { ja: "ブルーアーカイブ", en: "Blue Archive" }, color: "#7b61ff" },
    { name: "ヒアンシー", romaji: "Hyacine", from: { ja: "崩壊:スターレイル", en: "Honkai: Star Rail" }, color: "#63e6d2" },
  ],

  hobbies: [
    { ja: "サイト開発", en: "Web development" },
    { ja: "ヒカマーWikiの編集", en: "Editing the Hikamer Wiki" },
    { ja: "政治関連", en: "Politics" },
    { ja: "プログラミング", en: "Programming" },
    { ja: "AIにパワハラ()", en: "Power-harassing AI (lol)" },
  ] as LText[],

  games: ["Hearts of Iron IV", "原神 / Genshin Impact", "Cities: Skylines (1 & 2)"],

  server: {
    ja: "この鯖は自宅の鯖で動いています。自宅鯖ってヤツです。",
    en: "This server runs on a machine at home. Yes — a genuine home server.",
  } as LText,
};

export type Skill = { name: string; level: number; note?: LText };
/** 人前スケール(0.0〜1.0) */
export const SKILLS: Skill[] = [
  { name: "HTML", level: 0.7 },
  { name: "JS / TS", level: 0.5, note: { ja: "半人前", en: "half a portion" } },
  { name: "Python", level: 0.4 },
  { name: "Linux", level: 0.3 },
  { name: "CSS", level: 0.2 },
];

export type Project = {
  name: string;
  url: string;
  desc: LText;
  tag: LText;
  extra?: { label: string; url: string }[];
};

export const PROJECTS: Project[] = [
  {
    name: "なれあいったー",
    url: "https://nareaitter.hikamers.app/",
    desc: {
      ja: "おなじみの馴れ合いサークルです！ログイン不要で利用できます。",
      en: "The familiar 馴れ合い (nareai) circle — a cozy SNS you can use without logging in.",
    },
    tag: { ja: "SNS", en: "SNS" },
  },
  {
    name: "Hikabooru",
    url: "https://hikabooru.hikamers.app/",
    desc: {
      ja: "Hikakin_Mania 関連の動画像素材を全てここに保存しています！",
      en: "Every Hikakin_Mania-related image and video asset, archived in one booru.",
    },
    tag: { ja: "アーカイブ", en: "Archive" },
  },
  {
    name: "拓也さんボイス",
    url: "https://takuya-tts.hikamers.app/",
    desc: {
      ja: "APIを改変しないと無料で使えなかった拓也さんボイスをGUIにして読み上げしやすくしています！",
      en: "A GUI on top of the Takuya voice TTS that used to require API surgery to use for free.",
    },
    tag: { ja: "TTS", en: "TTS" },
  },
  {
    name: "マニアスプレッダーのサンサンサンデー特設サイト",
    url: "https://sunsunsunday.hikamers.app/",
    desc: {
      ja: "2026年8月10日、野獣の日に開催したマニアスプレッダーのサンサンサンデー特設サイトです！",
      en: "Special site for Mania Spreader's サンサンサンデー broadcast held on Beast Day, 2026-08-10.",
    },
    tag: { ja: "特設サイト", en: "Event site" },
  },
  {
    name: "ファボなしRTクリッカーゲーム",
    url: "https://retweet-clicker.hikamers.app/",
    desc: {
      ja: "その名の通り、ファボなしRTをクリッカーゲームにしたものです！",
      en: "Literally a clicker game about quote-retweeting without liking.",
    },
    tag: { ja: "ゲーム", en: "Game" },
  },
  {
    name: "イラストさがしったー",
    url: "https://illustsagasitter.hikamers.app/",
    desc: {
      ja: "Twitter(X)にある30日以内に投稿されたイラストを検索できるサイトです！",
      en: "Search illustrations posted on X within the last 30 days.",
    },
    tag: { ja: "検索", en: "Search" },
  },
  {
    name: "TwiGacha",
    url: "https://twigacha.hikamers.app/",
    desc: {
      ja: "SNSのユーザーをカードにしたカードゲームです！",
      en: "A browser card game where SNS users become the cards.",
    },
    tag: { ja: "ゲーム", en: "Game" },
  },
];

export type AppTool = {
  name: string;
  desc: LText;
  links: { label: string; url: string }[];
  kind: LText;
};

export const APP_TOOLS: AppTool[] = [
  {
    name: "hikabooru 素材 & ヒカマーマルコフ連鎖bot",
    desc: {
      ja: "hikabooruにある動画像素材と共に、ヒカマーや例のアレコンテンツの文章を学習したマルコフ連鎖モデルが定期生成して投稿するBotです！",
      en: "A bot that pairs Hikabooru media assets with a Markov-chain model trained on Hikamer and 例のアレ text, posting generated content on a schedule.",
    },
    links: [{ label: "@hikabooru", url: "https://x.com/hikabooru" }],
    kind: { ja: "X Bot", en: "X Bot" },
  },
  {
    name: "Equal Earth Maps — 地図をイコールアース図法に",
    desc: {
      ja: "OpenStreetMapと国土地理院地図のメルカトル表示を、イコールアース(正積)図法に変換して表示する拡張機能です！",
      en: "Browser extension that reprojects OpenStreetMap and GSI Maps from Mercator into the Equal Earth (equal-area) projection.",
    },
    links: [
      {
        label: "Chrome Web Store",
        url: "https://chromewebstore.google.com/detail/equal-earth-maps-%E2%80%94-%E5%9C%B0%E5%9B%B3%E3%82%92%E3%82%A4%E3%82%B3%E3%83%BC/aoapchpgiciompccfooafgkggfkaadgf?authuser=0&hl=ja",
      },
    ],
    kind: { ja: "ブラウザ拡張", en: "Extension" },
  },
  {
    name: "旧字体変換",
    desc: {
      ja: "サイトの漢字などを旧字体に変換する拡張機能です！",
      en: "Converts kanji on web pages into their kyūjitai (traditional) forms.",
    },
    links: [
      {
        label: "Chrome Web Store",
        url: "https://chromewebstore.google.com/detail/%E6%97%A7%E5%AD%97%E4%BD%93%E5%A4%89%E6%8F%9B/fchfakkampebnckpoahkdpiejmpgknkn?authuser=0&hl=ja",
      },
      {
        label: "Firefox Add-ons",
        url: "https://addons.mozilla.org/ja/firefox/addon/%E6%97%A7%E5%AD%97%E4%BD%93%E5%A4%89%E6%8F%9B/",
      },
    ],
    kind: { ja: "ブラウザ拡張", en: "Extension" },
  },
  {
    name: "X Undo",
    desc: {
      ja: "Xにブラウザのような進む・戻るボタンを追加する拡張機能です！",
      en: "Adds browser-style back / forward navigation buttons to X.",
    },
    links: [
      {
        label: "Chrome Web Store",
        url: "https://chromewebstore.google.com/detail/x-undo/mhdbhmkhcddhhijlglmbemgpgphgolib?authuser=0&hl=ja",
      },
      { label: "Firefox Add-ons", url: "https://addons.mozilla.org/ja/firefox/addon/x-undo/" },
    ],
    kind: { ja: "ブラウザ拡張", en: "Extension" },
  },
  {
    name: "サムネスキン (ヒカマーバージョン)",
    desc: {
      ja: "サムネスキンのヒカマーバージョンです！なおほぼはやおとこうちゃんだけな模様。",
      en: "A Hikamer-flavoured take on thumbnail skins — mostly はやお and こうちゃん so far.",
    },
    links: [
      {
        label: "Tampermonkey",
        url: "https://www.tampermonkey.net/script_installation.php#url=https://raw.githubusercontent.com/maebahesioru/kouhei-images/main/mrbeastify.user.js?v=2",
      },
    ],
    kind: { ja: "ユーザースクリプト", en: "Userscript" },
  },
];

export type BlogPost = { title: string; url: string; source: SourceKey };
export type SourceKey = "x" | "note" | "qiita" | "beastnote";

export const SOURCES: Record<SourceKey, { label: string; color: string }> = {
  x: { label: "X", color: "#1d9bf0" },
  note: { label: "note", color: "#2cb696" },
  qiita: { label: "Qiita", color: "#55c500" },
  beastnote: { label: "ビーストノート", color: "#f0a02a" },
};

export const BLOG: BlogPost[] = [
  { title: "宏子老坂のヒカマー訴訟が絶対に無理な理由", url: "https://x.com/maebahesioru2/status/2093626388205195448", source: "x" },
  { title: "#ヒカマーAI生成 カメオ一覧忘備録", url: "https://note.com/zyuuzika/n/nbbad3a721d63", source: "note" },
  { title: "X・BlueskyユーザーをTCGカード化するブラウザゲームを作った", url: "https://note.com/zyuuzika/n/n51f8df4a6f93", source: "note" },
  { title: "AIと一緒にHoI4 modを作るツールを作った話", url: "https://note.com/zyuuzika/n/ndf02c9aa20a9", source: "note" },
  { title: "ヒカマニのMisskey鯖を作ってみた", url: "https://note.com/zyuuzika/n/n4fa5bc35b7f6", source: "note" },
  { title: "ヒカマーWikiの各記事全文をAIに読み込ませて七夕の願い事を予想させてみた", url: "https://note.com/zyuuzika/n/n3a6cd152129e", source: "note" },
  { title: "ヒカマーWikiの各記事全文をAIに読み込ませてヒカマー引退時期を予想させてみた", url: "https://note.com/zyuuzika/n/n0ec66cc8b30e", source: "note" },
  { title: "ヒカマーWikiの各記事全文をAIに読み込ませてMBTIを予想させてみた", url: "https://note.com/zyuuzika/n/nd19c1ce4360a", source: "note" },
  { title: "無料で今すぐにできるX凍結対策一覧", url: "https://note.com/zyuuzika/n/nc8d775e48585", source: "note" },
  { title: "ヒカマニbot 利用規約", url: "https://note.com/zyuuzika/n/n520e7566d6fe", source: "note" },
  { title: "ヒカマニbot プライバシーポリシー", url: "https://note.com/zyuuzika/n/ne5e9e48eb014", source: "note" },
  { title: "Yahooリアルタイム検索のAPIが本当に有能だからみんな使ったほうがいい話", url: "https://qiita.com/maebahesioru/items/4fc4e6baf5b96aa84061", source: "qiita" },
  { title: "Windows Updateが全更新0x80240034で失敗する時の復旧手順(FODOrOCPended地獄からの脱出)", url: "https://qiita.com/maebahesioru/items/ec4f1bc8eeaf42f7366c", source: "qiita" },
  { title: "hikabooru 素材のソース一覧", url: "https://beast-note.yajuvideo.st/text_contents/4e339faa-dc53-4a34-9c6b-b216da6d1c9f", source: "beastnote" },
  { title: "マニアスプレッダーのサンサンサンデー2026野獣の日SPの振り返り", url: "https://beast-note.yajuvideo.st/text_contents/f9b2909f-c773-4201-8046-cca74dc1a8c5", source: "beastnote" },
  { title: "ヒカキンブンブンじゃんけん & Today's Hikakin's Point 完全解析マスターレポート", url: "https://beast-note.yajuvideo.st/text_contents/a52a1349-87c3-4049-bc02-2f8b13958ff6", source: "beastnote" },
  { title: "マニアスプレッダーのサンサンサンデー2026について", url: "https://beast-note.yajuvideo.st/text_contents/5b534648-f096-4355-b539-92ada7856c9d", source: "beastnote" },
  { title: "ヒカマーズアルカイダは電気糞の夢を見るか？", url: "https://beast-note.yajuvideo.st/text_contents/8dd7cfa5-4234-4c13-af5d-5301cc1ac753", source: "beastnote" },
  { title: "ヒカマーズ1984", url: "https://beast-note.yajuvideo.st/text_contents/d1cf0480-c95b-4ac1-a687-872c94b96a2b", source: "beastnote" },
  { title: "『ヒカマニクエスト』エンディング案・全24種", url: "https://beast-note.yajuvideo.st/text_contents/a3d652df-1638-44d2-950e-701fb930b9b1", source: "beastnote" },
  { title: "地雷チャンの個人情報とか", url: "https://beast-note.yajuvideo.st/text_contents/20f824d1-4edb-456e-bbe9-10a7eda85eb2", source: "beastnote" },
];

export type ContactLink = {
  label: string;
  handle: string;
  url?: string;
  icon: IconName;
  note?: LText;
  secret?: string;
  /** fxtwitter でリアルタイム取得する X アカウントのハンドル(@なし) */
  xAccount?: string;
  /** ライブ取得できた時に note を隠す(内容が実データと重複する場合) */
  noteReplacedByLive?: boolean;
};

/** fxtwitter で情報を取得するアカウント(@なし) */
export const X_ACCOUNTS = ["maebahesioru2", "okubahesioru", "bosekimanianext"] as const;

export const CONTACTS: ContactLink[] = [
  { label: "X (メイン)", handle: "@maebahesioru2", url: "https://x.com/maebahesioru2", icon: "x", xAccount: "maebahesioru2", note: { ja: "フォロワー約7000人", en: "~7,000 followers" }, noteReplacedByLive: true },
  { label: "X (サブ)", handle: "@okubahesioru", url: "https://x.com/okubahesioru", icon: "x", xAccount: "okubahesioru" },
  { label: "X (鍵)", handle: "@bosekimanianext", url: "https://x.com/bosekimanianext", icon: "x", xAccount: "bosekimanianext", note: { ja: "FFならほぼ全員通します！", en: "I accept basically any follower back" } },
  { label: "Bluesky", handle: "@maebahesioru.bsky.social", url: "https://bsky.app/profile/maebahesioru.bsky.social", icon: "bluesky" },
  { label: "north", handle: "@maebahesioru", url: "https://north.rip/maebahesioru", icon: "north" },
  { label: "GitHub", handle: "maebahesioru", url: "https://github.com/maebahesioru", icon: "github" },
  { label: "note", handle: "zyuuzika", url: "https://note.com/zyuuzika", icon: "note" },
  { label: "Qiita", handle: "maebahesioru", url: "https://qiita.com/maebahesioru", icon: "qiita" },
  { label: "YouTube", handle: "@maebahesioru", url: "https://www.youtube.com/@maebahesioru", icon: "youtube" },
  { label: "ニコニコ", handle: "十字架_mania", url: "https://www.nicovideo.jp/user/145170461", icon: "niconico" },
  { label: "Instagram", handle: "maebahesioru", url: "https://www.instagram.com/maebahesioru/", icon: "instagram" },
  { label: "Twitch", handle: "maebahesioru", url: "https://www.twitch.tv/maebahesioru", icon: "twitch" },
  { label: "TikTok", handle: "@maebahesioru2", url: "https://www.tiktok.com/@maebahesioru2", icon: "tiktok" },
  { label: "Reddit", handle: "Ok_General4461", url: "https://www.reddit.com/user/Ok_General4461/", icon: "reddit" },
  {
    label: "Signal",
    handle: "@maebahesioru.63",
    url: "https://signal.me/#eu/lEf_4yKtbxSZamGfLjyf_UchVyQFgpLelak8oiTCpx31jgVgc3JFaKCwZzBjr1ym",
    icon: "signal",
  },
  {
    label: "Session",
    handle: "Session ID",
    icon: "session",
    secret: "05fbb0ff738031ada8c0c1b38ad93a955564b6009bc6d1b19012987d59f03c2e61",
  },
  { label: "Telegram", handle: "@maebahesioru2", url: "http://t.me/maebahesioru2", icon: "telegram" },
];

export type Donation = { label: string; icon: "monero" | "bitcoin" | "litecoin" | "ofuse"; address?: string; url?: string; recommended?: boolean };

export const DONATIONS: Donation[] = [
  { label: "Monero (XMR)", icon: "monero", address: "84sqLzBCyfA3yEib6C4v3m3xGhk7h7qftj56E8SaaYqXDBtW46tbe7PMNusFs6TQQWUKSTQPJsNY2XUywiNrKKfG5k4A2uf", recommended: true },
  { label: "Bitcoin (BTC)", icon: "bitcoin", address: "bc1q2v0hfpsczjmkes6yehexy3pupp7qzm7t26mdjd" },
  { label: "Litecoin (LTC)", icon: "litecoin", address: "ltc1qn89en6aeapwd2zy7k8egpagqvwx0qded7rtd4s" },
  { label: "OFUSE (カード)", icon: "ofuse", url: "https://ofuse.me/maebahesioru" },
];

export const MACHINES = [
  {
    name: { ja: "メインPC", en: "Main PC" },
    role: { ja: "開発・ゲーム・動画", en: "Dev / gaming / video" },
    spec: [
      ["CPU", "AMD Ryzen 5 5500"],
      ["GPU", "NVIDIA RTX 2080 Ti"],
      ["RAM", "32 GB"],
      ["Storage", "SSD 512GB (C:) / SSD 512GB (D:) / HDD 2TB (E:) / 外付けSSD 250GB (F:)"],
      ["OS", "Windows 11 Pro"],
    ],
  },
  {
    name: { ja: "サブPC", en: "Sub PC" },
    role: { ja: "自宅鯖 / 常駐", en: "Home server / always on" },
    spec: [
      ["CPU", "Intel N100"],
      ["GPU", "Intel UHD Graphics"],
      ["RAM", "32 GB"],
      ["Storage", "M.2 SSD 512GB (C:)"],
      ["OS", "Debian 13"],
    ],
  },
  {
    name: { ja: "POCO X7 Pro", en: "POCO X7 Pro" },
    role: { ja: "モバイル", en: "Mobile" },
    spec: [
      ["CPU", "MediaTek Dimensity 8400-Ultra"],
      ["RAM", "12 GB"],
      ["OS", "Android (Xiaomi HyperOS)"],
    ],
  },
];

export const NAV = [
  { href: "/", key: "nav.home" },
  { href: "/blog", key: "nav.blog" },
  { href: "/bbs", key: "nav.bbs" },
  { href: "/mirror", key: "nav.mirror" },
  { href: "/terms", key: "nav.terms" },
  { href: "/license", key: "nav.license" },
];
