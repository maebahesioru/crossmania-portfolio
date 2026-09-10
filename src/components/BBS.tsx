"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./ui";

type Post = { id: string; name: string; body: string; at: string; parentId: string | null };

type Tree = { post: Post; replies: Post[] };

function buildTree(posts: Post[]): Tree[] {
  const roots = posts.filter((p) => !p.parentId);
  return roots.map((post) => ({ post, replies: posts.filter((p) => p.parentId === post.id).sort((a, b) => a.at.localeCompare(b.at)) }));
}

export function BBS({ headingIndex = "10", standalone = false }: { headingIndex?: string; standalone?: boolean }) {
  const { t, locale } = useI18n();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [delKey, setDelKey] = useState("");
  const [replyTo, setReplyTo] = useState<Post | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [keyOf, setKeyOf] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/bbs", { cache: "no-store" });
      const j = (await r.json()) as { posts: Post[] };
      setPosts(j.posts);
    } catch {
      setPosts([]);
      setMsg({ kind: "err", text: t("error") });
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("crossmania-bbs-keys");
      if (raw) setKeyOf(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const tree = useMemo(() => (posts ? buildTree(posts) : []), [posts]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!body.trim()) {
      setMsg({ kind: "err", text: locale === "ja" ? "本文を入力してください" : "Please write a message" });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/bbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body, delKey, parentId: replyTo?.id ?? null }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || t("error"));
      if (delKey && j.post?.id) {
        const next = { ...keyOf, [j.post.id]: delKey };
        setKeyOf(next);
        try {
          localStorage.setItem("crossmania-bbs-keys", JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
      setBody("");
      setReplyTo(null);
      setMsg({ kind: "ok", text: t("bbs.thanks") });
      await load();
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (post: Post) => {
    const key = keyOf[post.id] || window.prompt(t("bbs.delPrompt")) || "";
    if (!key) return;
    const r = await fetch(`/api/bbs?id=${encodeURIComponent(post.id)}&key=${encodeURIComponent(key)}`, { method: "DELETE" });
    if (!r.ok) {
      setMsg({ kind: "err", text: t("bbs.delWrong") });
      return;
    }
    await load();
  };

  const total = posts?.length ?? 0;

  return (
    <section className={standalone ? "" : "shell py-14"}>
      {standalone ? null : (
        <Reveal>
          <SectionHeading index={headingIndex} title={t("sec.bbs")} sub={`${total} ${t("bbs.posts")}`} id="bbs" />
        </Reveal>
      )}

      <div className={`${standalone ? "" : "mt-7"} grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]`}>
        {/* 投稿一覧 */}
        <Reveal className="panel order-2 overflow-hidden lg:order-1">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="label">
              {total} {t("bbs.posts")}
            </span>
            <button type="button" onClick={load} className="font-mono text-[11.5px] text-sub transition hover:text-fg">
              ⟳ reload
            </button>
          </div>

          {posts === null ? (
            <p className="p-5 text-sm text-sub">{t("bbs.loading")}</p>
          ) : tree.length === 0 ? (
            <p className="p-5 text-sm text-sub">{t("bbs.empty")}</p>
          ) : (
            <ul className="flex flex-col gap-4 p-4">
              {tree.map(({ post, replies }) => (
                <li key={post.id} className="flex flex-col gap-2">
                  <PostRow post={post} onReply={setReplyTo} onDelete={remove} mine={!!keyOf[post.id]} />
                  {replies.length ? (
                    <ul className="ml-6 flex flex-col gap-2 border-l-2 border-line pl-3">
                      {replies.map((r) => (
                        <li key={r.id}>
                          <PostRow post={r} onReply={setReplyTo} onDelete={remove} mine={!!keyOf[r.id]} small />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        {/* 投稿フォーム */}
        <Reveal className="order-1 lg:order-2" delay={80}>
          <form onSubmit={submit} className="panel flex flex-col gap-3 p-4">
            <p className="label">{replyTo ? `${t("bbs.replyTo")}${replyTo.name}` : t("bbs.title")}</p>
            {replyTo ? (
              <div className="flex items-center justify-between rounded-lg border border-dashed border-line bg-panel2 px-3 py-2 text-[11.5px] text-sub">
                <span className="truncate">{replyTo.body.slice(0, 40)}…</span>
                <button type="button" onClick={() => setReplyTo(null)} className="shrink-0 text-xs hover:text-fg">
                  ✕
                </button>
              </div>
            ) : null}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("bbs.namePlaceholder")}
              maxLength={24}
              aria-label={t("bbs.name")}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("bbs.bodyPlaceholder")}
              rows={5}
              maxLength={1500}
              aria-label={t("bbs.body")}
              className="resize-y"
            />
            <div className="flex items-center justify-between font-mono text-[11.5px] text-sub">
              <span>{body.length}/1500</span>
              <span>{t("bbs.rule")}</span>
            </div>
            <input
              value={delKey}
              onChange={(e) => setDelKey(e.target.value)}
              placeholder={t("bbs.delKeyPlaceholder")}
              maxLength={16}
              aria-label={t("bbs.delKey")}
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-gradient-to-r from-accent to-accent2 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? t("bbs.sending") : t("bbs.submit")}
            </button>
            {msg ? (
              <p className={`text-[12px] ${msg.kind === "ok" ? "text-emerald-400" : "text-accent"}`}>{msg.text}</p>
            ) : null}
            <p className="text-[11.5px] leading-relaxed text-sub">
              {locale === "ja"
                ? "名前を空欄にすると「名無しヒカマー」になります。削除キーを入れておくと後から自分で消せます(ブラウザにも保存されます)。"
                : "Leave the name empty to post as Nanashi Hikamer. Set a delete key to remove your own post later (also stored in your browser)."}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function PostRow({
  post,
  onReply,
  onDelete,
  mine,
  small = false,
}: {
  post: Post;
  onReply: (p: Post) => void;
  onDelete: (p: Post) => void;
  mine: boolean;
  small?: boolean;
}) {
  const { t, locale } = useI18n();
  const when = new Date(post.at).toLocaleString(locale === "ja" ? "ja-JP" : "en-GB", { timeZone: "Asia/Tokyo" });
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border border-line bg-panel2/40 px-3.5 py-2.5 ${small ? "text-[12.5px]" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/30 to-accent2/30 text-[11.5px] font-bold">
          {post.name.slice(0, 1)}
        </span>
        <span className="truncate text-[12.5px] font-semibold">{post.name}</span>
        <span className="shrink-0 font-mono text-[11.5px] text-sub">{when}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2 font-mono text-[11.5px]">
          <button type="button" onClick={() => onReply(post)} className="text-sub transition hover:text-link">
            {t("bbs.reply")}
          </button>
          {mine ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="text-sub transition hover:text-accent"
              aria-label={t("bbs.deleteOpen")}
            >
              🗑
            </button>
          ) : null}
        </span>
      </div>
      <p className="mt-2 leading-relaxed whitespace-pre-wrap">{post.body}</p>
      {open ? (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onDelete(post);
              setOpen(false);
            }}
            className="rounded-md bg-accent px-2.5 py-1 text-[11.5px] font-bold text-white"
          >
            {t("bbs.delete")}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-[11.5px] text-sub">
            {t("bbs.cancel")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
