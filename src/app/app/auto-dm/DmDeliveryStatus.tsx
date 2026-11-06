import Link from "next/link";
import { query } from "@/lib/db";
import ui from "@/components/ui/ui.module.css";

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
};

export async function loadDmDeliveryRows(userId: string): Promise<DmDeliveryRow[]> {
  return query<DmDeliveryRow>(
    `select q.id, q.status, q.attempts, q.last_error, q.created_at, q.sent_at, q.next_attempt_at,
            r.name as rule_name, r.status as rule_status,
            a.username as account_username, a.status as account_status, a.dm_cooldown_until
     from socialapp.dm_queue q
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
    if (e.includes("paused")) return "Automation paused";
    if (e.includes("deleted") || e.includes("missing")) return "Automation removed";
    return "Automation not eligible";
  }
  if (e.startsWith("network:") || e.includes("timeout") || e.includes("fetch failed")) return "Temporary network error";
  if (e.includes("permission") || e.includes("not authorized")) return "Permission or policy block";
  if (e.startsWith("http 4") || e.includes("http 400") || e.includes("http 403") || e.includes("http 404")) {
    return "Instagram rejected the send";
  }
  if (e.startsWith("http 5")) return "Instagram temporarily unavailable";
  return "Could not deliver";
}

function statusLabel(status: string): string {
  if (status === "sent") return "Sent";
  if (status === "pending") return "Pending";
  if (status === "failed") return "Failed";
  if (status === "skipped") return "Skipped";
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === "sent") return `${ui.pill} ${ui.pillMint}`;
  if (status === "pending") return `${ui.pill} ${ui.pillInk}`;
  if (status === "failed") return `${ui.pill} ${ui.pillPeach}`;
  return ui.pill;
}

function pendingHoldReason(row: DmDeliveryRow, now: number): string | null {
  if (row.rule_status === "paused") return "Waiting — automation is paused.";
  if (row.account_status === "expired") return "Waiting — Instagram connection expired. Reconnect in Settings.";
  if (row.account_status === "disconnected") return "Waiting — Instagram account disconnected. Reconnect in Settings.";
  if (row.dm_cooldown_until && new Date(row.dm_cooldown_until).getTime() > now) {
    return `Waiting — account cooldown until ${fmtUtc(row.dm_cooldown_until)}.`;
  }
  return null;
}

function DeliveryEmptyIllustration() {
  return (
    <svg viewBox="0 0 120 72" className="mx-auto h-[72px] w-[120px]" aria-hidden="true">
      <rect x="8" y="12" width="104" height="48" rx="10" fill="var(--poskoo-band)" stroke="var(--poskoo-line)" strokeWidth="1.5" />
      <path d="M20 28h56M20 36h40M20 44h48" stroke="var(--poskoo-line)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="92" cy="36" r="14" fill="var(--poskoo-lilac)" />
      <path d="M86 36l4 4 8-8" stroke="var(--poskoo-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

type Props = { rows: DmDeliveryRow[] | null; loadError?: boolean; asOf: Date };

export function DmDeliveryStatus({ rows, loadError, asOf }: Props) {
  const now = asOf.getTime();

  return (
    <section className="mt-10" aria-labelledby="dm-delivery-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="dm-delivery-heading" className="m-0 text-xl font-semibold text-[var(--poskoo-ink)]">
            DM delivery
          </h2>
          <p className="text-sm text-[var(--poskoo-muted)]">Recent send queue activity (latest 20).</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <Link href="/app/settings" className={ui.link}>
            Settings
          </Link>
          <Link href="/app/inbox" className={ui.link}>
            Inbox
          </Link>
        </div>
      </div>

      {loadError ? (
        <div role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-4 text-center`}>
          <p className="m-0 text-sm">
            We couldn&apos;t load delivery status right now. Your automations still work — try refreshing.
          </p>
          <a href="/app/auto-dm" className={`${ui.btn} ${ui.btnGhost} ${ui.sm} mt-3`}>
            Refresh
          </a>
        </div>
      ) : !rows?.length ? (
        <div className={`${ui.card} mt-4 border-dashed p-6 text-center`}>
          <DeliveryEmptyIllustration />
          <p className="mt-3 text-sm font-semibold text-[var(--poskoo-ink)]">No DMs in the queue yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--poskoo-muted)]">
            When comment automations enqueue messages, sent and retry status will show here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {rows.map((row) => {
            const hold = row.status === "pending" ? pendingHoldReason(row, now) : null;
            const failure = row.status === "failed" || row.status === "skipped" ? failureCategory(row.last_error) : null;
            const needsReconnect =
              failure === "Reconnect Instagram" ||
              failure === "Account disconnected" ||
              row.account_status === "expired" ||
              row.account_status === "disconnected";

            return (
              <li key={row.id} className={`${ui.card} p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className={statusBadgeClass(row.status)}>
                    {statusLabel(row.status)}
                  </span>
                  <span className="text-xs text-[var(--poskoo-muted)]">
                    Attempts: <span className="font-semibold text-[var(--poskoo-ink)]">{row.attempts}</span>
                  </span>
                </div>
                <dl className="mt-3 grid gap-1.5 text-sm">
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-[var(--poskoo-muted)]">Automation:</dt>
                    <dd className="m-0 font-semibold text-[var(--poskoo-ink)]">{row.rule_name ?? "—"}</dd>
                    {row.rule_status && (
                      <dd className="m-0 text-xs text-[var(--poskoo-muted)]">({row.rule_status === "active" ? "active" : "paused"})</dd>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-[var(--poskoo-muted)]">Account:</dt>
                    <dd className="m-0 font-semibold text-[var(--poskoo-ink)]">{row.account_username ? `@${row.account_username}` : "—"}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-[var(--poskoo-muted)]">Queued (UTC):</dt>
                    <dd className="m-0 text-[var(--poskoo-ink)]">{fmtUtc(row.created_at)}</dd>
                  </div>
                  {row.sent_at && (
                    <div className="flex flex-wrap gap-x-1">
                      <dt className="text-[var(--poskoo-muted)]">Sent (UTC):</dt>
                      <dd className="m-0 text-[var(--poskoo-ink)]">{fmtUtc(row.sent_at)}</dd>
                    </div>
                  )}
                  {row.status === "pending" && (
                    <div className="flex flex-wrap gap-x-1">
                      <dt className="text-[var(--poskoo-muted)]">{hold ? "Hold reason:" : "Next retry (UTC):"}</dt>
                      <dd className="m-0 text-[var(--poskoo-ink)]">{hold ?? fmtUtc(row.next_attempt_at)}</dd>
                    </div>
                  )}
                  {failure && (
                    <div className="flex flex-wrap gap-x-1">
                      <dt className="text-[var(--poskoo-muted)]">Issue:</dt>
                      <dd className="m-0 text-[var(--poskoo-ink)]">{failure}</dd>
                    </div>
                  )}
                </dl>
                {(needsReconnect || row.status !== "sent") && (
                  <p className="mt-3 text-xs text-[var(--poskoo-muted)]">
                    {needsReconnect && (
                      <>
                        <Link href="/app/settings" className={ui.link}>
                          Settings
                        </Link>
                        {" · "}
                      </>
                    )}
                    <Link href="/app/inbox" className={ui.link}>
                      Inbox
                    </Link>
                    {needsReconnect ? " for reconnection or conversation context." : " for conversation context."}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
