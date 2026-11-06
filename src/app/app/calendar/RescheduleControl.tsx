"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reschedulePost } from "./rescheduleActions";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import styles from "./calendar.module.css";

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
      className={styles.reschedule}
      draggable={false}
      onDragStart={(event) => { event.preventDefault(); event.stopPropagation(); }}
    >
      <summary>
        Reschedule<span className="sr-only"> post: {caption}</span>
      </summary>
      <form
        className={styles.rescheduleForm}
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
        <label htmlFor={fieldId}>New date (UTC)</label>
        <input
          id={fieldId}
          type="date"
          required
          value={date}
          disabled={pending}
          onChange={(event) => { setDate(event.target.value); setError(null); }}
          aria-describedby={`${fieldId}-hint${error ? ` ${fieldId}-error` : ""}`}
          aria-invalid={!!error}
          className={ui.input}
        />
        <p id={`${fieldId}-hint`}>Moving preserves the UTC time.</p>
        <Btn
          type="submit"
          size="sm"
          disabled={pending || !date || date === originalDate}
        >
          {pending ? "Moving…" : "Move"}
        </Btn>
        {error && <p id={`${fieldId}-error`} role="alert" className={styles.rescheduleError}>{error}</p>}
      </form>
    </details>
  );
}
