"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reschedulePost } from "./rescheduleActions";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import styles from "./calendar.module.css";
import { formatTime, utcDateForLocalDay, zonedParts } from "./calendarUtils";

// Date picker for touch devices. Days are shown and picked in the browser's time zone (`tz`,
// "" = UTC before hydration), the same zone the calendar grid uses; the post keeps its local time.
export default function RescheduleControl({ id, scheduledAt, caption, tz = "", onMoved }: {
  id: string;
  scheduledAt: Date | string;
  caption: string;
  tz?: string;
  onMoved?: () => void;
}) {
  const router = useRouter();
  const fieldId = useId();
  const originalDate = zonedParts(scheduledAt, tz).key;
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
              const result = await reschedulePost(id, utcDateForLocalDay(scheduledAt, date, tz));
              if (!result.ok) {
                setError(result.error ?? "Could not move post. Please try again.");
                return;
              }
              onMoved?.();
              router.refresh();
            } catch {
              setError("Could not move post. Please try again.");
            }
          });
        }}
      >
        <label htmlFor={fieldId}>New date</label>
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
        <p id={`${fieldId}-hint`}>Keeps the time ({formatTime(scheduledAt, tz)}{tz ? "" : " UTC"}).</p>
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
