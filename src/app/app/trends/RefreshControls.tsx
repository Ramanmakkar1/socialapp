"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshTrendsAction, type RefreshState } from "./actions";
import styles from "./trends.module.css";

/**
 * "Refresh" button. With `autoRefresh` (some watched account's cache is older than 6 hours) it also
 * refreshes the stale ones once when the page opens, so the page itself renders from cache instantly.
 */
export default function RefreshControls({ autoRefresh, disabled }: { autoRefresh: boolean; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<RefreshState | null>(null);
  const started = useRef(false);

  const run = (force: boolean) =>
    startTransition(async () => {
      try {
        const r = await refreshTrendsAction(force);
        // The silent automatic refresh only speaks up when something went wrong.
        if (force || !r.ok) setResult(r);
      } catch {
        setResult({ ok: false, message: "Refresh failed. Please try again." });
      }
    });

  useEffect(() => {
    if (!autoRefresh || disabled || started.current) return;
    started.current = true;
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <div className={styles.headActions}>
      {(pending || result) && (
        <p className={`${styles.refreshMsg} ${result && !result.ok && !pending ? styles.refreshMsgErr : ""}`} role="status" aria-live="polite">
          {pending ? "Reading watched accounts…" : result?.message}
        </p>
      )}
      <button type="button" className={styles.ghost} disabled={pending || disabled} aria-busy={pending} onClick={() => run(true)}>
        <RefreshCw width={14} height={14} aria-hidden="true" className={pending ? "animate-spin motion-reduce:animate-none" : undefined} />
        {pending ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
