"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Save, Trash2 } from "lucide-react";
import { deleteIdea, saveIdea } from "./ideasActions";
import { IDEA_STATUSES, type IdeaStatus } from "@/lib/ideas";

export type Idea = {
  id: string;
  text: string;
  media: { url: string }[];
  tags: string[];
  status: IdeaStatus;
};

function isImage(url: string): boolean {
  const path = url.split("?")[0].toLowerCase();
  return path.endsWith(".jpg") || path.endsWith(".jpeg") || path.endsWith(".png") || path.endsWith(".webp");
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(idea.text);
  const [mediaText, setMediaText] = useState(idea.media.map((item) => item.url).join("\n"));
  const [tagsText, setTagsText] = useState(idea.tags.join(", "));
  const [status, setStatus] = useState<IdeaStatus>(idea.status);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await saveIdea({
          ideaId: idea.id,
          text,
          mediaUrls: mediaText.split(/[\n,]+/).map((url) => url.trim()).filter(Boolean),
          status,
          tags: tagsText.split(","),
        });
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error });
          return;
        }
        // Keep the tag box as typed: clearing it here used to wipe the saved tags on the next save.
        setFeedback({ kind: "ok", text: "Idea saved" });
        setEditing(false);
        router.refresh();
      } catch {
        setFeedback({ kind: "err", text: "Could not save idea. Please try again." });
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this idea?")) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await deleteIdea(idea.id);
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error ?? "Could not delete idea." });
          return;
        }
        router.refresh();
      } catch {
        setFeedback({ kind: "err", text: "Could not delete idea." });
      }
    });
  }

  return (
    <article className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 shadow-sm">
      {editing ? (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[var(--poskoo-muted)]">
            Idea
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              className="mt-1 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--poskoo-muted)]">
            Media links (one per line)
            <textarea
              value={mediaText}
              onChange={(event) => setMediaText(event.target.value)}
              rows={2}
              placeholder="https://example.com/photo.jpg"
              className="mt-1 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--poskoo-muted)]">
            Tags (comma separated)
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="launch, behind the scenes"
              className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--poskoo-muted)]">
            Column
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as IdeaStatus)}
              className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
            >
              {IDEA_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--poskoo-violet)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden /> Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-sm font-medium text-[var(--poskoo-muted)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm text-[var(--poskoo-ink)]">{idea.text || "No text yet"}</p>
          {idea.media.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {idea.media.map((item) =>
                isImage(item.url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={item.url}
                    src={item.url}
                    alt="Idea media"
                    className="h-16 w-16 rounded-lg border border-[var(--poskoo-line)] object-cover"
                  />
                ) : (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[var(--poskoo-line)] px-2 py-1 text-xs text-[var(--poskoo-violet)]"
                  >
                    Media link
                  </a>
                ),
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {idea.tags.length > 0 ? (
              idea.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--poskoo-band)] px-2 py-0.5 text-xs text-[var(--poskoo-muted)]">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--poskoo-muted)]">—</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={`/app/calendar?compose=1&idea=${idea.id}`}
              scroll={false}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--poskoo-violet)] px-3 py-1.5 text-xs font-medium text-white"
            >
              Create post from idea <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-xs font-medium text-[var(--poskoo-muted)]"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-xs font-medium text-[var(--poskoo-coral)] disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </button>
          </div>
        </>
      )}
      {feedback && (
        <p role={feedback.kind === "err" ? "alert" : "status"} className={`mt-2 text-xs ${feedback.kind === "err" ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-muted)]"}`}>
          {feedback.text}
        </p>
      )}
    </article>
  );
}
