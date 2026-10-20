import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPUでボーカル分離を自宅に置いた話 — 音源分離モデルをミドルレンジGPUで回す",
  description:
    "音源分離はクラウドに音源を上げるしかないと思っていたが、手元のGPUで実用的な速度で動くようになっていた。環境構築で踏んだsoundfileとCUDAバージョンの罠、実行オプションの選び方、出力の44.1kHz問題までを実際の構成でまとめます。",
  alternates: { canonical: "/blog/local-vocal-separation-gpu" },
};

export default function LocalVocalSeparationPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        GPUでボーカル分離を自宅に置いた話 — 音源分離モデルをミドルレンジGPUで回す
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-20 · GPU / 音声処理</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            音源分離、いわゆる「ボーカル抜き」や「ステム分離」は、少し前までクラウドに
            音源をアップロードするしかありませんでした。
          </strong>{" "}
          それが今は手元のGPUで動きます。しかも最新のハイエンドである必要はなく、
          ひと世代前のミドルレンジでも実用になります。自宅に置く価値は十分あるので、
          構築で踏んだ罠と実際の使い勝手をまとめておきます。
        </p>

        <h2 className="display text-xl sm:text-2xl">なぜローカルに置くのか</h2>
        <p>
          理由は3つでした。<strong>素材を外に出さなくて済む</strong>こと。
          <strong>回数制限や待ち時間を気にしなくて済む</strong>こと。
          そして<strong>パラメータを試行錯誤できる</strong>ことです。
        </p>
        <p>
          特に3つ目が大きい。分離の品質は素材によって最適な設定が変わるので、
          「同じ音源を設定を変えて何度か回して聴き比べる」ができないと、
          結局どれがいいのか分かりません。従量課金のサービスだと、この試行が
          そのまま課金になるので、心理的に試せなくなります。
        </p>

        <h2 className="display text-xl sm:text-2xl">何を使うか</h2>
        <p>
          定番は<code>Demucs</code>です。ボーカル・ドラム・ベース・その他の4ステムに
          分離できるモデルで、<code>htdemucs</code>系の重みが広く使われています。
          派生として、追加学習を回した<code>htdemucs_ft</code>があり、
          品質が上がる代わりに処理時間が伸びます。
        </p>

        <h2 className="display text-xl sm:text-2xl">環境構築で踏んだ2つの罠</h2>
        <p>
          <strong>罠1: <code>soundfile</code>が入っていない。</strong>
          依存関係として自動で入ると思っていたら入っておらず、音声ファイルの読み込みで
          落ちました。明示的に入れて解決。音声を扱うライブラリは、実際のデコード部分が
          別パッケージになっていることが多いので、エラーが出たらまずそこを確認します。
        </p>
        <p>
          <strong>罠2: CUDAのバージョンとドライバの対応。</strong>
          PyTorchはCUDAのバージョンごとにビルドが分かれていて、ドライバが
          対応していないものを入れると、インストールは成功するのに実行時に
          <code>no kernel image is available</code>系のエラーで落ちます。
          <strong>先にドライバのバージョンを確認し、それに合うビルドを選ぶ</strong>。
          逆順にやると、動かない環境を1から作り直すことになります。
        </p>
        <p>
          環境は専用の仮想環境に切り分けました。音声処理は依存が重く、
          バージョン衝突を起こしやすいので、システムのPythonには触らないほうが安全です。
        </p>

        <h2 className="display text-xl sm:text-2xl">実行と、オプションの選び方</h2>
        <p>
          基本の形はこうです。<code>--two-stems=vocals</code>を付けると
          「ボーカル」と「それ以外」の2つに絞るので、4ステムに分けるより速く終わります。
          カラオケ用途なら2ステムで十分なことが多いです。
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <code>-n htdemucs_ft</code>: 品質重視。標準モデルより遅いが分離がきれい
          </li>
          <li>
            <code>--shifts 2</code>: 入力を少しずつずらして複数回推論し、結果を平均する。
            品質は上がるが、おおむね回数に比例して時間が伸びる
          </li>
          <li>
            <code>-d cuda</code>: GPUを使う指定。指定を忘れるとCPUで回って
            桁違いに遅いので、初回はログでデバイスを確認する
          </li>
        </ul>
        <p>
          手元の環境はRTX 2080 Ti(VRAM 11GB)です。このクラスでもモデルは余裕で載ります。
          VRAM不足で落ちるのは、極端に長い音源を一度に読ませたときでした。
          その場合は曲を分割してから回すか、バッチサイズを下げます。
        </p>

        <h2 className="display text-xl sm:text-2xl">出力の罠: 44.1kHz固定</h2>
        <p>
          見落としやすいのがこれです。<strong>出力のサンプルレートは44.1kHzになります。</strong>
          元の音源が48kHzだと、そのまま素材と並べたときにサンプルレートが食い違います。
          DAWに戻すなら、分離結果をリサンプルするか、プロジェクト全体を44.1kHzで
          組むかを先に決めておく必要があります。
        </p>
        <p>
          これを知らずに48kHzのプロジェクトへ放り込むと、ピッチかテンポが微妙にずれます。
          「分離はできたのに、なぜか元の音と重ならない」という症状になったら、
          まずサンプルレートを疑ってください。
        </p>

        <h2 className="display text-xl sm:text-2xl">品質についての正直な感想</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>ボーカルはかなり取れます。コーラスやハモリも一緒に抜けるので、そこはセットで扱う前提</li>
          <li>リバーブ成分は残りやすい。完全に消すより「邪魔にならない程度に薄くする」用途が現実的</li>
          <li>4ステムに分けたほうが、後段で個別に処理するときは楽</li>
          <li>ドラムのシンバルは、他のステムに少し漏れることがある</li>
        </ul>
        <p>
          「プロのマルチトラックと同等」とはいきませんが、
          カバー動画の下地を作る、練習用に特定のパートを聴く、
          といった用途なら十分に実用的です。
        </p>

        <h2 className="display text-xl sm:text-2xl">権利の話は技術と切り離して考える</h2>
        <p>
          <strong>分離した音源をどう使うかは、原盤の権利者の許諾の範囲で決まります。</strong>
          自分で録った音、利用許諾を得た素材、私的利用の範囲 — それ以外で
          分離結果を配布・公開するのは避けるべきです。
        </p>
        <p>
          ローカルで動かせるということは「誰にも見られずに処理できる」ということであり、
          それは「何をしてもよい」という意味ではありません。技術的に可能なことと、
          してよいことは別、という当たり前の線を自分の中に引いておく必要があります。
        </p>

        <h2 className="display text-xl sm:text-2xl">まとめ</h2>
        <p>
          構築自体は1時間もあれば終わります。詰まるとしたら
          <strong><code>soundfile</code>の入れ忘れ</strong>と
          <strong>CUDAとドライバの対応</strong>の2点で、どちらもエラーメッセージを読めば解決できます。
        </p>
        <p>
          素材を外に出さずに、設定を変えながら何度でも試せる。それだけで分離作業の
          質は変わります。GPUが手元に余っているなら、入れておいて損はないツールです。
        </p>
      </article>
    </div>
  );
}
