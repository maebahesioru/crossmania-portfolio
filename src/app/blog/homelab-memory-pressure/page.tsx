import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小さなホームラボのメモリがカツカツになった話 — zram・swap・犯人探しの手順",
  description:
    "24GBのミニPCサーバーで10以上のサービスを動かしていたら、だんだん動作が重くなってきた。『swapが満杯』の正体が実はzramだった話から、犯人コンテナの特定、安全なメモリ確保の手順まで、実際の障害対応を記録します。",
  alternates: { canonical: "/blog/homelab-memory-pressure" },
};

export default function MemoryPressurePage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        小さなホームラボのメモリがカツカツになった話 — zram・swap・犯人探しの手順
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-15 · 自宅サーバー / 運用</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            自宅のミニPCサーバーで10本以上のサービスを動かしていたら、最近なんだか全体的に
            動作が重い。
          </strong>{" "}
          「気のせいかな」と流していたのですが、実測してみたら明確にメモリがカツカツでした。
          この記事は、その時の調査と対応の記録です。誰得でもないですが、
          「swapが満杯」という表示に騙されかけた話として読んでください。
        </p>

        <h2 className="display text-xl sm:text-2xl">症状: なんとなく全部が遅い</h2>
        <p>
          分かりやすい障害ではなく、<em>「なんとなくページの反応が遅い」「たまにタイムアウトする」</em>
          という曖昧な劣化でした。こういう時は決め打ちせず、まず数字を取ります。
          <code>free</code>でメモリ、<code>uptime</code>でロードアベレージ、
          <code>ps aux --sort=-rss</code>でメモリ食いの上位を確認 —
          ここで出た数字がこちら(抜粋):
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>メモリ24GBのうち使用13GB、空きは約370MB</li>
          <li><strong>swapが2.7GBで「満杯」</strong>(残り196KB)← これが引っかかった</li>
          <li>ロードアベレージ(15分平均)が4コアに対して9.0 ← 2倍以上の過負荷</li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">「swap満杯」の正体はディスクではなかった</h2>
        <p>
          swapが満杯 — 普通なら「ディスクスワップが埋まった」と解釈して、スワップファイルを
          増やしたくなります。私も最初そう判断して<code>swappiness</code>を下げる設定を入れたのですが、
          ここで一旦立ち止まって<code>/proc/swaps</code>を確認して、ハッとしました。
        </p>
        <p>
          <strong>その「swap」は /dev/zram0 — zram、つまり圧縮RAMだったのです。</strong>
          このサーバーではディスクではなく、メモリ上に圧縮スワップ(zram)を置く設定にしていました。
          zramは普通のRAMより遅いものの、ディスクスワップよりははるかに速いという優れもの。
          つまり「2.7GBが満杯」というのは<strong>「メモリの中の圧縮領域まで使い切っている」</strong>
          という意味で、ディスクスワップが埋まっていたわけではありませんでした。
        </p>
        <p>
          しかも厄介なことに、この構成では<strong>swappinessを高め(100)に設定するのが意図的な正解</strong>です。
          圧縮スワップを積極的に使うほどメモリが節約できるためで、私は最初それを知らずに
          「100は異常値だ」と下げてしまい、あとで慌てて戻しました。
          <strong>swap関連のチューニングは、必ず「実際のデバイス構成」を確認してから</strong> —
          これがこの一件で一番の教訓です。
        </p>

        <h2 className="display text-xl sm:text-2xl">犯人探し: 誰がメモリを食っているか</h2>
        <p>
          上位プロセスを並べると、犯人ははっきりしていました。
          1つのWebアプリが<strong>単体で2.2GB</strong>を常駐させていたのです。
          そのアプリは「リクエストされたデータをメモリにキャッシュする」設計で、
          それはそれで正しい挙動。つまり<strong>リークではなく、仕様としてメモリを育てるタイプ</strong>
          でした。他にも翻訳モデルの常駐プロセス(約1GB)や、ファーミング系の常駐アプリ(約1.3GB)など、
          「常駐するのが仕事」のプロセスが積み重なって、24GBを使い切っていたわけです。
        </p>

        <h2 className="display text-xl sm:text-2xl">やった対策(上から順に安全な順)</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>オーバーフロー用のディスクスワップを追加</strong>: zramが満杯になったときの
            受け皿として4GBのスワップファイルを追加。これは「緊急時の余白」を作るだけで、
            普段は使われません
          </li>
          <li>
            <strong>メモリを育てるタイプのアプリを再起動</strong>: 2.2GBまで育ったアプリを
            深夜(低トラフィック時)に再起動。キャッシュが温まるまでの数分はCPUを使いますが、
            解放量が大きく、空きメモリが370MB→2.6GBに改善しました
          </li>
          <li>
            <strong>「育てるタイプ」は定期的にリセットする運用へ</strong>:
            リークではないので、閾値を超えたら自動で夜間に再起動、という見張りを入れる方向に
          </li>
        </ul>
        <p>
          やってはいけない対策も書いておきます。<strong>「とりあえずswappinessを下げる」</strong>は
          zram構成では逆効果になり得ますし、<strong>「キャッシュをdrop_cachesで捨てる」</strong>のも
          一時しのぎ。まず「どのプロセスが、仕様として、どれだけ育つのか」を把握するのが先です。
        </p>

        <h2 className="display text-xl sm:text-2xl">まとめ</h2>
        <p>
          小さなサーバーで多くのサービスを動かすなら、メモリは「犯罪現場」のように扱うべきです。
          数字を取り、デバイスの正体(zramかディスクか)を確認し、犯人を特定し、
          「戻せる・効く」順に対策を打つ。ロードアベレージが高くてもCPUが暇なら、
          それはメモリかI/Oを待っているサイン — この一連の流れは、この先も必ず役に立ちます。
        </p>
      </article>
    </div>
  );
}
