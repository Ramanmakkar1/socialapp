import Link from "next/link";
import { Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import EmptyState from "../../EmptyState";

export const metadata = { title: "Auto-DM activity" };

const PAGE_SIZE = 30;

type Status = "pending" | "sent" | "failed" | "skipped";

type ActivityRow = {
  id: string;
  status: Status;
  attempts: number;
  last_error: string | null;
  created_at: Date;
  sent_at: Date | null;
  next_attempt_at: Date | null;
  rule_name: string | null;
  rule_paused: boolean;
};

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-line bg-surface-2 text-ink-2" },
  sent: { label: "Sent", className: "border-ok/30 bg-ok/10 text-ok" },
  failed: { label: "Failed", className: "border-warn/30 bg-warn/10 text-warn" },
  skipped: { label: "Skipped", className: "border-line bg-surface-2 text-muted" },
};

// Maps stored errors to safe, fixed wording. Raw API text is never rendered.
function explainError(error: string | null): string | null {
  if (!error) return null;
  const e = error.toLowerCase();
  if (e.includes("access expired") || e.includes("reconnect")) return "Instagram access expired. Reconnect Instagram in Settings.";
  if (e.includes("disconnected")) return "The Instagram account was disconnected.";
  if (e.includes("7-day")) return "The comment was older than Instagram's 7-day private reply window.";
  if (e.includes("24-hour")) return "Instagram only allows DMs within 24 hours of the person's message.";
  if (e.includes("rule is not active") || e.includes("rule was deleted") || e.includes("rule is missing")) return "The automation was turned off or deleted before sending.";
  if (e.includes("different instagram account") || e.includes("does not belong")) return "The automation no longer applies to this Instagram account.";
  if (e.includes("http 429") || e.includes("rate limit") || e.includes("too many")) return "Instagram's sending limit was reached, so sending paused for a while.";
  if (e.startsWith("network")) return "Instagram could not be reached.";
  if (e.startsWith("http")) return "Instagram did not accept this message.";
  return "This message could not be delivered.";
}

function formatTime(value: Date | null): string {
  if (!value) return "";
  return `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value))} UTC`;
}

function DeliveryIllustration() {
  return (
    <svg viewBox="0 0 120 64" className="h-16 w-28 shrink-0" aria-hidden="true">
      <circle cx="60" cy="32" r="30" fill="var(--brand)" opacity="0.1" />
      <rect x="8" y="18" width="34" height="24" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
      <path d="M15 27h20M15 33h13" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M46 30h22" stroke="var(--brand)" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M66 25l6 5-6 5" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <g className="hero-float">
        <path d="M80 14h26a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H94l-8 6v-6h-6a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" fill="var(--brand)" />
        <path d="M86 28l5 5 10-10" fill="none" stroke="var(--brand-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default async function AutoDmActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser();
  const { page: requestedPage = "" } = await searchParams;
  const page = Math.min(Math.max(Number.parseInt(requestedPage, 10) || 1, 1), 1000);

  let rows: ActivityRow[] = [];
  let loadError = false;
  if (isDbConfigured()) {
    try {
      rows = await query<ActivityRow>(
        `select q.id, q.status, q.attempts, q.last_error, q.created_at, q.sent_at, q.next_attempt_at,
                r.name as rule_name, coalesce(r.status = 'paused', false) as rule_paused
         from socialapp.dm_queue q
         left join socialapp.dm_rules r on r.id = q.rule_id and r.user_id = q.user_id
         where q.user_id = $1 and q.kind <> 'manual_reply'
         order by q.created_at desc, q.id desc
         limit $2 offset $3`,
        [user.id, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE],
      );
    } catch (err) {
      console.error("auto-dm activity: load failed", err instanceof Error ? err.message : "unknown error");
      loadError = true;
    }
  } else {
    loadError = true;
  }
  const hasMore = rows.length > PAGE_SIZE;
  const visible = rows.slice(0, PAGE_SIZE);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/app/auto-dm" className="text-sm font-medium text-brand hover:underline">← Back to Auto-DM</Link>
          <h1 className="mt-2 text-2xl font-semibold">Auto-DM activity</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            The latest DMs your automations tried to send. Pending messages wait while their automation is paused and send after you resume it.
          </p>
        </div>
        <DeliveryIllustration />
      </div>

      {loadError ? (
        <div role="alert" className="mt-6 rounded-2xl border border-warn/30 bg-warn/10 p-5 text-sm text-warn">
          <p className="font-semibold">We couldn&apos;t load your DM activity.</p>
          <p className="mt-1">Your automations keep running. Refresh the page in a minute to try again.</p>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={page > 1 ? "No older activity" : "No DMs sent yet"}
          text={page > 1 ? "You've reached the end of your DM activity." : "When someone comments a keyword on your post, the DM shows up here with its delivery status."}
        />
      ) : (
        <ul className="mt-6 grid gap-3">
          {visible.map((row) => {
            const style = STATUS_STYLE[row.status] ?? STATUS_STYLE.pending;
            const reason = row.status === "sent" ? null : explainError(row.last_error);
            return (
              <li key={row.id} className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:flex sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.rule_name ?? "Deleted automation"}</p>
                  <p className="mt-1 text-xs text-muted">
                    {row.status === "sent" && row.sent_at ? `Sent ${formatTime(row.sent_at)}` : `Queued ${formatTime(row.created_at)}`}
                    {" · "}
                    {row.attempts} {row.attempts === 1 ? "attempt" : "attempts"}
                  </p>
                  {row.status === "pending" && row.rule_paused && (
                    <p className="mt-2 text-sm text-ink-2">Waiting: this automation is paused.</p>
                  )}
                  {row.status === "pending" && !row.rule_paused && row.next_attempt_at && (
                    <p className="mt-2 text-sm text-ink-2">Next try: {formatTime(row.next_attempt_at)}</p>
                  )}
                  {reason && <p className="mt-2 text-sm text-ink-2">{reason}</p>}
                </div>
                <span className={`mt-3 inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:mt-0 ${style.className}`}>
                  {style.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!loadError && (page > 1 || hasMore) && (
        <nav aria-label="Activity pages" className="mt-6 flex items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Link href={page === 2 ? "/app/auto-dm/activity" : `/app/auto-dm/activity?page=${page - 1}`} className="rounded-full border border-line px-4 py-2 font-medium hover:bg-surface-2">Newer</Link>
          ) : <span />}
          {hasMore && (
            <Link href={`/app/auto-dm/activity?page=${page + 1}`} className="rounded-full border border-line px-4 py-2 font-medium hover:bg-surface-2">Older</Link>
          )}
        </nav>
      )}

      <p className="mt-8 text-sm text-muted">
        DMs not arriving?{" "}
        <Link href="/help/instagram-auto-dm-not-working" className="font-medium text-brand hover:underline">Read the troubleshooting guide</Link>.
      </p>
    </>
  );
}
