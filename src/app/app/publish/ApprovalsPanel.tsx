"use client";

// Publish → Approvals: posts members sent for approval (team workspaces, migration 054).
// Owners/admins approve (it gets scheduled) or send back to drafts with a note; the requester can
// withdraw their own request. The server re-checks every role (src/lib/team.ts).
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Undo2, XCircle } from "lucide-react";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { approvePostAction, rejectPostAction, withdrawApprovalAction } from "./approvalActions";
import styles from "./approvals.module.css";

export type PendingItem = {
  id: string;
  caption: string;
  scheduledAt: string | null;
  requestedMode: "schedule" | "queue" | null;
  requestedBy: string | null;
  requestedByEmail: string | null;
  platforms: string[];
};

// Local time differs between the server render and the browser: the span suppresses that warning.
function when(iso: string | null): string {
  if (!iso) return "No time picked";
  return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function localInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Row({ item, canReview, userId, platformLabel }: { item: PendingItem; canReview: boolean; userId: string; platformLabel: Record<string, string> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [needTime, setNeedTime] = useState(false);
  const [time, setTime] = useState(() => localInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const mine = item.requestedBy === userId;

  const run = (fn: () => Promise<{ ok: boolean; error?: string; code?: string }>) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (r.ok) {
        router.refresh();
        return;
      }
      if (r.code === "time_passed") setNeedTime(true);
      setError(r.error ?? "Something went wrong.");
    });

  return (
    <li className={styles.row}>
      <div className={styles.meta}>
        <span className={styles.when} suppressHydrationWarning><Clock width={14} height={14} aria-hidden="true" /> {when(item.scheduledAt)}{item.requestedMode === "queue" ? " · queue" : ""}</span>
        <span className={styles.who}>{mine ? "You" : item.requestedByEmail ?? "A teammate"} asked to publish</span>
      </div>
      <p className={styles.caption}>{item.caption.trim() || "(no caption)"}</p>
      {item.platforms.length > 0 && (
        <p className={styles.nets}>{item.platforms.map((p) => platformLabel[p] ?? p).join(" · ")}</p>
      )}
      {needTime && canReview && (
        <label className={`${ui.field} ${styles.timeField}`}>
          <span className={ui.hint}>New time</span>
          <input className={ui.input} type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      )}
      {rejecting && canReview && (
        <label className={`${ui.field} ${styles.timeField}`}>
          <span className={ui.hint}>Note for {mine ? "yourself" : "the requester"} (optional)</span>
          <textarea className={ui.input} rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should change?" />
        </label>
      )}
      {error && <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>{error}</p>}
      <div className={styles.actions}>
        {canReview && !rejecting && (
          <Btn size="sm" disabled={pending} onClick={() => run(() => approvePostAction(item.id, needTime ? new Date(time).toISOString() : null))}>
            <CheckCircle2 width={15} height={15} aria-hidden="true" /> {needTime ? "Approve at this time" : "Approve"}
          </Btn>
        )}
        {canReview && (rejecting ? (
          <>
            <Btn size="sm" variant="line" disabled={pending} onClick={() => run(() => rejectPostAction(item.id, note))}>
              <XCircle width={15} height={15} aria-hidden="true" /> Send back to drafts
            </Btn>
            <Btn size="sm" variant="ghost" disabled={pending} onClick={() => setRejecting(false)}>Cancel</Btn>
          </>
        ) : (
          <Btn size="sm" variant="line" disabled={pending} onClick={() => setRejecting(true)}>
            <XCircle width={15} height={15} aria-hidden="true" /> Reject
          </Btn>
        ))}
        {!canReview && mine && (
          <Btn size="sm" variant="line" disabled={pending} onClick={() => run(() => withdrawApprovalAction(item.id))}>
            <Undo2 width={15} height={15} aria-hidden="true" /> Withdraw request
          </Btn>
        )}
        {!canReview && !mine && <span className={ui.hint}>Waiting for an owner or admin</span>}
      </div>
    </li>
  );
}

export default function ApprovalsPanel({ items, canReview, userId, platformLabel }: { items: PendingItem[]; canReview: boolean; userId: string; platformLabel: Record<string, string> }) {
  return (
    <section className={styles.panel} aria-labelledby="approvals-heading">
      <h2 id="approvals-heading" className={styles.heading}>Waiting for approval</h2>
      <p className={ui.hint}>
        {canReview
          ? "Posts your teammates sent for approval. Approving schedules them at the requested time."
          : "Posts you sent for approval. An owner or admin schedules them, or sends them back with a note."}
      </p>
      {items.length === 0 ? (
        <p className={styles.empty}>Nothing is waiting. 🎉</p>
      ) : (
        <ul className={styles.list}>
          {items.map((it) => <Row key={it.id} item={it} canReview={canReview} userId={userId} platformLabel={platformLabel} />)}
        </ul>
      )}
    </section>
  );
}
