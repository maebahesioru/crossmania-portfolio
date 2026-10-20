import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arch系Linuxで日本語IMEを乗り換えた話 — インストーラ・既定IM・辞書の3つの罠",
  description:
    "Linuxの日本語入力は乗り換えが現実的になったが、手順をなぞるだけでは終わらない。apt前提のインストーラ、GUIで変えても反映されない既定入力メソッド、持ち越せない辞書。実際に踏んだ順に、戻せる状態で乗り換える手順を書きます。",
  alternates: { canonical: "/blog/linux-ime-fcitx5" },
};

export default function LinuxImeFcitx5Page() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        Arch系Linuxで日本語IMEを乗り換えた話 — インストーラ・既定IM・辞書の3つの罠
      </h1>
      <p className="mt-3 text-[13px] text-sub">2026-10-20 · Linux / 環境構築</p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            Linuxの日本語入力は、ここ数年で「選択肢が増えた」から「乗り換えが現実的になった」に
            変わりました。
          </strong>{" "}
          ただ、ブログの手順をなぞるだけでは終わりません。配布物のインストーラが想定していない
          ディストリビューション、GUIで変えたのに反映されない既定入力メソッド、
          そして持ち越せない辞書。実際に踏んだ順に書いていきます。
        </p>
        <p>
          前提として、環境はArch系ディストリビューション + KDE Plasma(Wayland) +
          fcitx5 5.1.23。WaylandかX11かで入力メソッドの挙動は変わるので、
          読み替えが必要な箇所は注記します。
        </p>

        <h2 className="display text-xl sm:text-2xl">罠1: インストーラがaptを前提にしている</h2>
        <p>
          新しいIMEの導入スクリプトを実行したら、途中でパッケージマネージャのエラーで止まりました。
          スクリプトを読むと、依存パッケージを<code>apt</code>で入れようとしています。
          Arch系にaptは無いので、そこで落ちるのは当然です。
        </p>
        <p>
          回避は簡単でした。そのスクリプトには「fcitx5向けのセットアップだけを実行する」ための
          フラグが用意されていて、<code>bash install.sh --fcitx5</code>のように渡すと
          依存解決のフェーズを飛ばしてくれます。足りないパッケージは
          <code>pacman</code>で個別に入れます。
        </p>
        <p>
          <strong>配布物のインストーラは、作者の環境を前提にしています。</strong>
          落ちたときに「使えない」と判断する前に、止まった箇所を開いて
          <em>「何を入れようとしていたか」</em>を読み、自分のパッケージマネージャで
          同じものを入れる。この読み替えができるかどうかで、対応できるソフトの幅がかなり変わります。
        </p>

        <h2 className="display text-xl sm:text-2xl">罠2: GUIで選んでも既定の入力メソッドが変わらない</h2>
        <p>
          インストールが終わっても、日本語入力は新しいIMEに変わりません。設定ツールで
          選んで保存し、再ログインしても元に戻ります。ここで「壊れた」と判断して
          アンインストールする人が多いんじゃないかと思います。
        </p>
        <p>
          原因は単純でした。<strong>fcitx5は起動時に
          <code>~/.config/fcitx5/profile</code>を読んで</strong>、そこに書かれた
          <code>DefaultIM</code>を使って入力メソッドを決めます。使っていたGUIツールは
          このファイルを書き換えていませんでした。つまり<em>GUIが何を書いているか</em>ではなく、
          <em>デーモンが何を読んでいるか</em>が食い違っていたわけです。
        </p>
        <p>
          対処はその1行を直接編集するだけ。<code>DefaultIM=&lt;使いたいIMEのID&gt;</code>に
          書き換えて、fcitx5を再起動すれば切り替わります。ポイントは
          <strong>旧IMEの記述を消さずに残しておく</strong>こと。戻すときに
          また1行書き換えるだけで済みます。
        </p>

        <h2 className="display text-xl sm:text-2xl">罠3: 辞書は持ち越せないことがある</h2>
        <p>
          一番痛いのがこれです。学習履歴とユーザー辞書はIMEごとに独自形式なので、
          <strong>気軽に移行できるとは限りません</strong>。手元では、旧IMEの学習履歴が
          テキスト形式で約5,000行、ユーザー辞書がバイナリで400MB超という構成でしたが、
          新しいIME側の形式と互換がなく、そのままでは読めませんでした。
        </p>
        <p>
          そこで取った方針は<strong>「消さない」</strong>です。旧IMEの辞書とバイナリは
          そのまま残しておきました。切り替えは<code>DefaultIM</code>の1行と、
          ロードする共有ライブラリのパスだけで制御できるので、旧環境を丸ごと保持していれば
          <em>合わなければ10秒で戻せます</em>。
        </p>
        <p>
          <strong>環境の乗り換えは「戻せる状態」でやる。</strong>これが今回いちばん効いた原則でした。
          新しいものが良さそうに見えても、毎日入力に使う道具は相性が出ます。
          消してから後悔するのが一番高い買い物です。
        </p>

        <h2 className="display text-xl sm:text-2xl">乗り換えたあとに確認すること</h2>
        <p>
          設定が通ったように見えても、実際に使うと細かいところで差が出ます。最低限、
          次の4点は見ておくべきでした。
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>普通の文を打って、変換候補が期待どおりに出るか(辞書が空だとここで気づく)</li>
          <li>英数字を打ったときに、日本語入力がオンのまま残らないか(日英自動判定の効き方)</li>
          <li>再ログインしても設定が残っているか(<code>profile</code>が上書きされていないか)</li>
          <li>Electron系アプリやゲームで、候補ウィンドウが正しい位置に出るか</li>
        </ul>
        <p>
          最後の項目はWaylandで特に差が出ます。X11向けに作られた入力の仕組みが
          そのまま動かないアプリがあり、そこで「日本語が打てない」と感じたら、
          アプリではなくセッション側(Wayland / XWayland)を疑うほうが早いことが多いです。
        </p>

        <h2 className="display text-xl sm:text-2xl">乗り換えチェックリスト</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>依存パッケージを、自分のディストリビューションのマネージャで入れたか</li>
          <li><code>~/.config/fcitx5/profile</code>の<code>DefaultIM</code>を確認したか</li>
          <li>旧IMEのバイナリと辞書を残したか</li>
          <li>辞書のバックアップを別ディレクトリに取ったか</li>
          <li>WaylandとX11のどちらで動かしているか把握しているか</li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">まとめ</h2>
        <p>
          3つの罠は、どれも「設定が反映されない」という同じ顔をして現れます。しかし原因は
          ばらばらで、<strong>インストーラの前提の違い</strong>、<strong>GUIとデーモンが読む場所の違い</strong>、
          <strong>データ形式の非互換</strong>。症状から原因を推測するより、
          「誰が何を読んでいるか」を1段ずつ確認するほうが速いです。
        </p>
        <p>
          そして、毎日使う道具ほど戻せる状態で触る。GUIの選択が効かないからといって
          アンインストールしてしまうと、戻す手段まで消えます。設定ファイル1枚を
          コピーしておくだけで、この手の作業の心理的コストはかなり下がります。
        </p>
      </article>
    </div>
  );
}
