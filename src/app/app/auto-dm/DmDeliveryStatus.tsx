import Link from "next/link";
import { query } from "@/lib/db";
import ui from "@/components/ui/ui.module.css";
import { RefreshCw } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import styles from "./auto-dm.module.css";
import { displayAttempts, recipientLabel } from "@/lib/deliveryLabels";

export type DmDeliveryRow = {
  id: string;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: Date;
  sent_at: Date | null;
  next_attempt_at: Date;
  rule_name: string | null;
  rule_status: string | null;
  account_username: string | null;
  account_status: string | null;
  dm_cooldown_until: Date | null;
  contact_username: string | null;
  recipient_external_id: string | null;
};

export async function loadDmDeliveryRows(userId: string): Promise<DmDeliveryRow[]> {
  return query<DmDeliveryRow>(
    `select q.id, q.status, q.attempts, q.last_error, q.created_at, q.sent_at, q.next_attempt_at,
            r.name as rule_name, r.status as rule_status,
            a.username as account_username, a.status as account_status, a.dm_cooldown_until,
            coalesce(c.username, c2.username) as contact_username, q.recipient_external_id
     from socialapp.dm_queue q
     left join socialapp.contacts c on c.id = q.contact_id and c.user_id = q.user_id
     left join socialapp.contacts c2 on q.contact_id is null and c2.user_id = q.user_id and c2.platform = 'instagram' and c2.external_id = q.recipient_external_id
     left join socialapp.dm_rules r on r.id = q.rule_id and r.user_id = q.user_id
     left join socialapp.social_accounts a on a.id = q.social_account_id and a.user_id = q.user_id
     where q.user_id = $1
     order by q.created_at desc
     limit 20`,
    [userId],
  );
}

function fmtUtc(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const t = new Date(value);
  if (!Number.isFinite(t.getTime())) return "—";
  return `${t.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

export function failureCategory(lastError: string | null): string | null {
  if (!lastError) return null;
  const e = lastError.toLowerCase();
  if (e.includes("disconnected")) return "Account disconnected";
  if (e.includes("reconnect") || e.includes("access expired") || e.includes("token")) return "Reconnect Instagram";
  if (e.includes("rate limit") || e.includes("too many")) return "Rate limited by Instagram";
  if (e.includes("7-day") || e.includes("24-hour") || e.includes("messaging window") || e.includes("outside instagram")) {
    return "Outside Instagram messaging window";
  }
  if (e.includes("automation rule")) {
    if (e.includes("paused")) return "Auto-DM paused";
    if (e.includes("deleted") || e.includes("missing")) return "Auto-DM removed";
    return "Auto-DM not eligible";
  }
  if (e.startsWith("network:") || e.includes("timeout") || e.includes("fetch failed")) return "Temporary network error";
  if (e.includes("permission") || e.includes("not authorized")) return "Permission or policy block";
  if (e.startsWith("http 4") || e.includes("http 400") || e.includes("http 403") || e.includes("http 404")) {
    return "Instagram rejected the send";
  }
  if (e.startsWith("http 5")) return "Instagram temporarily unavailable";
  return "Could not deliver";
}

function statusPill(row: DmDeliveryRow): { label: string; className: string } {
  if (row.status === "sent") return { label: "Sent", className: styles.dSent };
  if (row.status === "pending") return row.attempts > 0 ? { label: "Retrying", className: styles.dRetry } : { label: "Queued", className: styles.dQueued };
  if (row.status === "failed") return { label: "Failed", className: styles.dFailed };
  if (row.status === "skipped") return { label: "Skipped", className: styles.dSkipped };
  return { label: row.status, className: styles.dQueued };
}

function pendingHoldReason(row: DmDeliveryRow, now: number): string | null {
  if (row.rule_status === "paused") return "Waiting — Auto-DM is paused.";
  if (row.account_status === "expired") return "Waiting — Instagram connection expired. Reconnect in Settings.";
  if (row.account_status === "disconnected") return "Waiting — Instagram account disconnected. Reconnect in Settings.";
  if (row.dm_cooldown_until && new Date(row.dm_cooldown_until).getTime() > now) {
    return `Waiting — account cooldown until ${fmtUtc(row.dm_cooldown_until)}.`;
  }
  return null;
}

type Props = { rows: DmDeliveryRow[] | null; loadError?: boolean; asOf: Date };

export function DmDeliveryStatus({ rows, loadError, asOf }: Props) {
  const now = asOf.getTime();

  return (
    <section className={styles.tableCard} aria-labelledby="dm-delivery-heading" style={{ marginTop: 32 }}>
      <div className={styles.deliveryHead}>
        <h2 id="dm-delivery-heading" className={styles.deliveryTitle}>
          Recent DM delivery <span>Latest 20</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/app/auto-dm" className={styles.ghostBtn} prefetch={false}>
            <RefreshCw width={14} height={14} aria-hidden="true" /> Refresh
          </Link>
          <Link href="/app/insights?tab=activity" className={styles.headLink}>View full log →</Link>
        </div>
      </div>
      {loadError ? (
        <div role="alert" className={`${ui.notice} ${ui.noticeWarn} mx-4 mb-4 text-center`}>
          <p className="m-0 text-sm">
            We couldn&apos;t load delivery status right now. Your Auto-DMs still work. Try refreshing.
          </p>
        </div>
      ) : !rows?.length ? (
        <p className={styles.emptyBox}>No DMs sent yet: they&apos;ll appear here as soon as someone comments your keyword.</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Auto-DM</th>
                <th scope="col">Status</th>
                <th scope="col" className={styles.num}>Attempts</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const hold = row.status === "pending" ? pendingHoldReason(row, now) : null;
                const failure = row.status === "failed" || row.status === "skipped" ? failureCategory(row.last_error) : null;
                const needsReconnect =
                  failure === "Reconnect Instagram" ||
                  failure === "Account disconnected" ||
                  row.account_status === "expired" ||
                  row.account_status === "disconnected";
                const pill = statusPill(row);
                const reason = failure ?? hold;
                const user = recipientLabel(row.contact_username, row.recipient_external_id);
                return (
                  <tr key={row.id}>
                    <td>
                      <span className={styles.userCell}>
                        <span className={styles.userAvatar} aria-hidden="true">{user.startsWith("@") ? user.slice(1, 2).toUpperCase() : "?"}</span>
                        <span>
                          <span className="block font-semibold">{user}</span>
                          <span className={`block text-xs ${styles.muted}`}>via {row.account_username ? `@${row.account_username}` : "Instagram"}</span>
                        </span>
                      </span>
                    </td>
                    <td data-label="Auto-DM">
                      {row.rule_name ?? "—"}
                      {row.rule_status === "paused" && <span className={`ml-1 text-xs ${styles.muted}`}>(paused)</span>}
                    </td>
                    <td data-label="Status">
                      {reason ? (
                        <span className={styles.reasonWrap} tabIndex={0} aria-describedby={`dm-reason-${row.id}`}>
                          <span className={`${styles.dPill} ${pill.className}`}>{pill.label}</span>
                          <span id={`dm-reason-${row.id}`} role="tooltip" className={styles.reasonTip}>{reason}</span>
                        </span>
                      ) : (
                        <span className={`${styles.dPill} ${pill.className}`}>{pill.label}</span>
                      )}
                      {needsReconnect && row.status !== "sent" && (
                        <Link href="/app/settings" className={`${ui.link} ml-2 text-xs`}>Reconnect</Link>
                      )}
                    </td>
                    <td className={styles.num} data-label="Attempts">{displayAttempts(row.status, row.attempts) ?? "—"}</td>
                    <td className="whitespace-nowrap" data-label="Time">
                      <LocalTime value={row.sent_at ?? row.created_at} style="medium" fallback="—" />
                      {row.status === "pending" && !hold && (
                        <span className={`block text-xs ${styles.muted}`}>
                          Next try <LocalTime value={row.next_attempt_at} style="medium" fallback="—" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
