"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Lightbulb, Plus, X } from "lucide-react";
import IdeaCard, { type Idea } from "./IdeaCard";
import { saveIdea } from "./ideasActions";
import { IDEA_STATUSES, type IdeaStatus } from "@/lib/ideas";
import styles from "./ideas.module.css";

const EMPTY_HINT: Record<IdeaStatus, string> = {
  unassigned: "Jot down anything worth posting about.",
  todo: "Ideas you plan to make next.",
  in_progress: "What you are writing or shooting now.",
  done: "Finished ideas land here.",
};

export default function IdeasBoard({ ideas, loadFailed = false }: { ideas: Idea[]; loadFailed?: boolean }) {
  const [adding, setAdding] = useState<IdeaStatus | null>(null);

  return (
    <section className={styles.board} aria-labelledby="ideas-heading">
      <div className={styles.head}>
        <div>
          <h2 id="ideas-heading" className={styles.title}>Ideas board</h2>
          <p className={styles.sub}>Save ideas, move them along, and turn one into a post when you are ready.</p>
        </div>
        <button type="button" className={styles.newBtn} onClick={() => setAdding("unassigned")}>
          <Plus width={16} height={16} aria-hidden="true" /> New idea
        </button>
      </div>

      {loadFailed ? (
        <p role="alert" className={styles.failed}>
          We couldn’t load your ideas. They may still exist — reload the page to try again.
        </p>
      ) : (
        <div className={styles.columns}>
          {IDEA_STATUSES.map((column) => {
            const columnIdeas = ideas.filter((idea) => idea.status === column.value);
            return (
              <div key={column.value} className={styles.column} data-status={column.value}>
                <h3 className={styles.colHead}>
                  <span className={styles.dot} aria-hidden="true" />
                  {column.label}
                  <span className={styles.count}>{columnIdeas.length}</span>
                </h3>
                <div className={styles.colBody}>
                  {adding === column.value && <QuickAdd status={column.value} onDone={() => setAdding(null)} />}
                  {columnIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
                  {columnIdeas.length === 0 && adding !== column.value && (
                    <div className={styles.empty}>
                      <span className={styles.emptyIcon} aria-hidden="true"><Lightbulb width={18} height={18} /></span>
                      <p>{EMPTY_HINT[column.value]}</p>
                    </div>
                  )}
                </div>
                {adding !== column.value && (
                  <button type="button" className={styles.addBtn} onClick={() => setAdding(column.value)}>
                    <Plus width={15} height={15} aria-hidden="true" /> New idea
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Inline "new idea" card at the top of a column; saves straight into that column.
function QuickAdd({ status, onDone }: { status: IdeaStatus; onDone: () => void }) {
  const [text, setText] = useState("");
  const [mediaText, setMediaText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveIdea({
          text,
          mediaUrls: mediaText.split(/[\n,]+/).map((url) => url.trim()).filter(Boolean),
          tags: tagsText.split(","),
          status,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        // saveIdea revalidates the calendar page, so the new card renders in this same transition.
        onDone();
      } catch {
        setError("Could not save idea. Please try again.");
      }
    });
  }

  return (
    <div className={styles.quick}>
      <label className="sr-only" htmlFor={`idea-new-${status}`}>New idea</label>
      <textarea
        id={`idea-new-${status}`}
        ref={ref}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onDone();
        }}
        rows={3}
        placeholder="What do you want to post about?"
        className={styles.input}
      />
      <details className={styles.more}>
        <summary>Media and tags</summary>
        <label className={styles.label}>
          Media links
          <input value={mediaText} onChange={(event) => setMediaText(event.target.value)} placeholder="https://example.com/photo.jpg" className={styles.input} />
        </label>
        <label className={styles.label}>
          Tags (comma separated)
          <input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="launch, behind the scenes" className={styles.input} />
        </label>
      </details>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.quickActions}>
        <button type="button" className={styles.saveBtn} onClick={handleAdd} disabled={pending || !text.trim()}>
          {pending ? "Saving…" : "Add idea"}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={onDone} aria-label="Cancel new idea">
          <X width={16} height={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
