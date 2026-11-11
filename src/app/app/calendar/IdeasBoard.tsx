"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import IdeaCard, { type Idea } from "./IdeaCard";
import { saveIdea } from "./ideasActions";
import { IDEA_STATUSES } from "@/lib/ideas";

export default function IdeasBoard({ ideas, loadFailed = false }: { ideas: Idea[]; loadFailed?: boolean }) {
  const [text, setText] = useState("");
  const [mediaText, setMediaText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await saveIdea({
          text,
          mediaUrls: mediaText.split(/[\n,]+/).map((url) => url.trim()).filter(Boolean),
          tags: tagsText.split(","),
          status: "unassigned",
        });
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error });
          return;
        }
        setText("");
        setMediaText("");
        setTagsText("");
        // saveIdea revalidates the calendar page, so the new card renders in this same transition.
        setFeedback({ kind: "ok", text: "Idea saved" });
      } catch {
        setFeedback({ kind: "err", text: "Could not save idea. Please try again." });
      }
    });
  }

  return (
    <section className="mt-8" aria-labelledby="ideas-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ideas-heading" className="text-xl font-semibold text-[var(--poskoo-ink)]">Ideas board</h2>
          <p className="mt-1 text-sm text-[var(--poskoo-muted)]">
            Save ideas, tag them, and turn one into a post when you are ready.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
        <label className="block text-xs font-medium text-[var(--poskoo-muted)]">
          New idea
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            placeholder="What do you want to post about?"
            className="mt-1 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
          />
        </label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block text-xs font-medium text-[var(--poskoo-muted)]">
            Media links (one per line)
            <input
              value={mediaText}
              onChange={(event) => setMediaText(event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
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
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--poskoo-violet)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add idea
          </button>
          {feedback && (
            <p role={feedback.kind === "err" ? "alert" : "status"} className={`text-xs ${feedback.kind === "err" ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-muted)]"}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>

      {loadFailed ? (
        <p role="alert" className="mt-4 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-sm text-[var(--poskoo-muted)]">
          We couldn’t load your ideas. They may still exist — reload the page to try again.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {IDEA_STATUSES.map((column) => {
            const columnIdeas = ideas.filter((idea) => idea.status === column.value);
            return (
              <div key={column.value} className="rounded-2xl bg-[var(--poskoo-band)] p-3">
                <h3 className="flex items-center justify-between px-1 text-sm font-semibold text-[var(--poskoo-ink)]">
                  {column.label}
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-[var(--poskoo-muted)]">
                    {columnIdeas.length}
                  </span>
                </h3>
                <div className="mt-3 space-y-3">
                  {columnIdeas.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[var(--poskoo-line)] p-3 text-xs text-[var(--poskoo-muted)]">
                      No ideas here yet.
                    </p>
                  ) : (
                    columnIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
