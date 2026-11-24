"use client";

// "Why it failed": the plain reason, the network's own message, and the one action that fixes it
// (Reconnect / Fix and repost / Retry). Also shows posts waiting for an automatic retry, and
// warnings on live posts (e.g. Instagram first comment not added).
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { duplicatePost } from "./duplicateActions";
import { retryPost } from "./retryActions";
import { formatDateTime, PLATFORM_LABEL, type CalendarPost } from "./calendarUtils";
import { failureAction, KIND_SUMMARY, type PublishErrorKind } from "@/lib/publishErrorKinds";
import styles from "./calendar.module.css";

type Props = {
  post: Pick<CalendarPost, "id" | "status" | "error" | "error_kind" | "error_raw" | "error_platform" | "retry_at" | "warning">;
  tz: string;
  onDone?: () => void;
};

/** True when there is something to explain on this post. */
export function hasFailureDetails(post: Props["post"]): boolean {
  return Boolean((post.status === "failed" && post.error) || post.retry_at || post.warning);
}

export default function FailureDetails({ post, tz, onDone }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const retrying = Boolean(post.retry_at) && post.status !== "failed";
  const failed = post.status === "failed" && Boolean(post.error);
  if (!failed && !retrying && !post.warning) return null;

  const kind = (post.error_kind ?? "unknown") as PublishErrorKind;
  const action = retrying ? "retry" : failureAction(post.error_kind);
  const network = post.error_platform ? PLATFORM_LABEL[post.error_platform] ?? post.error_platform : null;
  const raw = post.error_raw && post.error_raw !== post.error ? post.error_raw : null;

  function run(fn: () => Promise<{ ok: boolean; error?: string; id?: string }>, after?: (id?: string) => void) {
    setMsg(null);
    start(async () => {
      try {
        const res = await fn();
        if (!res.ok) return setMsg(res.error ?? "That didn't work. Please try again.");
        after?.(res.id);
        onDone?.();
      } catch {
        setMsg("That didn't work. Please try again.");
      }
    });
  }

  return (
    <div className={styles.failBox} role="status">
      {(failed || retrying) && (
        <>
          <p className={styles.failTitle}>
            {retrying ? <RefreshCw width={14} height={14} aria-hidden="true" /> : <AlertTriangle width={14} height={14} aria-hidden="true" />}
            <span>
              {retrying ? "Poskoo will try again" : KIND_SUMMARY[kind] ?? KIND_SUMMARY.unknown}
              {network ? ` · ${network}` : ""}
            </span>
          </p>
          {post.error && <p className={styles.failReason}>{post.error.slice(0, 300)}</p>}
          {retrying && post.retry_at && (
            <p className={styles.failMeta} suppressHydrationWarning>Next try: {formatDateTime(post.retry_at, tz)}</p>
          )}
          {raw && (
            <details className={styles.failRaw}>
              <summary>Message from the network</summary>
              <p>{raw.slice(0, 600)}</p>
            </details>
          )}
          <div className={styles.failActions}>
            {action === "reconnect" && (
              <Link href="/app/settings#accounts-heading" className={styles.popPrimary}>
                Reconnect{network ? ` ${network}` : ""}
              </Link>
            )}
            {action === "edit" && (
              <button
                type="button"
                className={styles.popPrimary}
                disabled={pending}
                onClick={() => run(() => duplicatePost(post.id), (id) => id && router.push(`/app/calendar?draft=${id}`))}
              >
                {pending ? "Opening…" : "Fix and repost"}
              </button>
            )}
            {(action === "retry" || action === "reconnect") && (
              <button
                type="button"
                className={action === "retry" ? styles.popPrimary : styles.linkBtn}
                disabled={pending}
                onClick={() => run(() => retryPost(post.id))}
              >
                {pending ? "Retrying…" : retrying ? "Retry now" : "Retry"}
              </button>
            )}
          </div>
          {kind === "ambiguous" && !retrying && (
            <p className={styles.failMeta}>Check your profile first: if the post is already there, don&apos;t retry.</p>
          )}
        </>
      )}
      {post.warning && <p className={styles.failWarn}>{post.warning.slice(0, 300)}</p>}
      {msg && <p className={styles.failMeta}>{msg}</p>}
    </div>
  );
}
