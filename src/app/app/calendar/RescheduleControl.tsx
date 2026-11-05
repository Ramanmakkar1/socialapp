"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reschedulePost } from "./rescheduleActions";

export default function RescheduleControl({ id, scheduledAt, caption }: {
  id: string;
  scheduledAt: Date | string;
  caption: string;
}) {
  const router = useRouter();
  const fieldId = useId();
  const originalDate = new Date(scheduledAt).toISOString().slice(0, 10);
  const [date, setDate] = useState(originalDate);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <details
      className="min-w-0 text-xs text-ink-2"
      draggable={false}
      onDragStart={(event) => { event.preventDefault(); event.stopPropagation(); }}
    >
      <summary className="min-h-11 cursor-pointer content-center rounded-lg px-2 focus-visible:outline-2 focus-visible:outline-brand">
        Reschedule<span className="sr-only"> post: {caption}</span>
      </summary>
      <form
        className="space-y-2 rounded-lg border border-line bg-surface p-2"
        aria-label={`Reschedule post: ${caption}`}
        aria-busy={pending}
        onSubmit={(event) => {
          event.preventDefault();
          if (pending || !date || date === originalDate) return;
          setError(null);
          startTransition(async () => {
            try {
              const result = await reschedulePost(id, date);
              if (!result.ok) {
                setError(result.error ?? "Could not move post. Please try again.");
                return;
              }
              router.refresh();
            } catch {
              setError("Could not move post. Please try again.");
            }
          });
        }}
      >
        <label htmlFor={fieldId} className="block">New date (UTC)</label>
        <input
          id={fieldId}
          type="date"
          required
          value={date}
          disabled={pending}
          onChange={(event) => { setDate(event.target.value); setError(null); }}
          aria-describedby={`${fieldId}-hint${error ? ` ${fieldId}-error` : ""}`}
          aria-invalid={!!error}
          className="min-h-11 w-full min-w-0 max-w-full rounded-lg border border-line bg-surface px-1 text-base text-ink"
        />
        <p id={`${fieldId}-hint`}>Moving preserves the UTC time.</p>
        <button
          type="submit"
          disabled={pending || !date || date === originalDate}
          className="min-h-11 w-full rounded-lg bg-brand px-2 text-white disabled:opacity-50"
        >
          {pending ? "Moving…" : "Move"}
        </button>
        {error && <p id={`${fieldId}-error`} role="alert" className="break-words text-brand-2">{error}</p>}
      </form>
    </details>
  );
}
