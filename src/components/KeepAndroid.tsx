"use client";

import Script from "next/script";

const HOST_ID = "kao-banner-host";

/**
 * keepandroidopen.org の公式カウントダウンバナー。
 *
 * 自前のデザインで作らず、公式が配布している `banner.js` をそのまま読み込む。
 * 文言・配色・カウントダウン(2027年1月1日まで)・閉じるボタンの挙動は
 * すべて公式実装のものになる。
 *
 * - 言語は `<html lang>` から自動判定されるため lang は渡さない
 * - `id=` を渡して、React が管理しないホスト要素の中に挿入させる
 *   (body直下に割り込ませると React の子要素の整合性とぶつかるため)
 * - 公式スクリプトは `<div id>` の中に追記するので、ホスト要素は
 *   子を持たない空要素として置く
 * - SRI(integrity) は意図的に付けない: 上流が随時更新する配布スクリプトで、
 *   ハッシュを固定するとある日バナーが読み込めなくなる。公式が案内する
 *   設置方法(そのまま script で読み込む)に従う。
 */
export function KeepAndroidBanner() {
  return (
    <>
      <div id={HOST_ID} suppressHydrationWarning />
      <Script
        id="kao-countdown-banner"
        src={`https://keepandroidopen.org/banner.js?id=${HOST_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
