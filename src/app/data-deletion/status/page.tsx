import Link from "next/link";
import { Suspense } from "react";
import { BRAND } from "@/lib/brand";
import { isDbConfigured, query } from "@/lib/db";

export const metadata = { title: "Data deletion status", robots: { index: false, follow: false } };

type Row = { status: string; requested_at: Date; completed_at: Date | null };

const LABELS: Record<string, string> = {
  received: "Received. We are deleting your data and will finish within 30 days.",
  completed: "Completed. Your connected-account data (tokens, posts, messages and contacts) has been deleted.",
  not_found: "Completed. We had no connected-account data for this Instagram account, so there was nothing to delete.",
};

function fmt(d: Date | null): string {
  return d ? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC" : "—";
}

type StatusPageProps = { searchParams: Promise<{ code?: string | string[] }> };

export default function Page({ searchParams }: StatusPageProps) {
  return (
    <Suspense fallback={<p role="status" className="mx-auto max-w-3xl px-4 py-16 text-muted">Loading deletion status…</p>}>
      <DeletionStatus searchParams={searchParams} />
    </Suspense>
  );
}

async function DeletionStatus({ searchParams }: StatusPageProps) {
  const { code: raw } = await searchParams;
  const code = typeof raw === "string" ? raw.trim().slice(0, 64) : "";
  let row: Row | null = null;
  let lookupFailed = false;
  if (code && isDbConfigured()) {
    try {
      const rows = await query<Row>(
        "select status, requested_at, completed_at from socialapp.data_deletion_requests where code=$1",
        [code]
      );
      row = rows[0] ?? null;
    } catch {
      lookupFailed = true;
    }
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 leading-7 text-ink-2">
      <h1 className="mb-6 text-3xl font-semibold text-ink">Data deletion status</h1>
      <form method="get" className="mb-6 flex flex-wrap gap-2">
        <label htmlFor="code" className="sr-only">Confirmation code</label>
        <input
          id="code"
          name="code"
          defaultValue={code}
          placeholder="Confirmation code"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
        />
        <button type="submit" className="btn-primary">Check status</button>
      </form>
      {!code ? (
        <p>Enter the confirmation code you received when you removed {BRAND.name} from Instagram.</p>
      ) : row ? (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Confirmation code</p>
          <p className="font-mono text-ink">{code}</p>
          <p className="mt-4 font-medium text-ink">{LABELS[row.status] ?? row.status}</p>
          <p className="mt-2 text-sm text-muted">Requested: {fmt(row.requested_at)} · Finished: {fmt(row.completed_at)}</p>
        </div>
      ) : (
        <p className="rounded-2xl border border-warn p-5 text-warn">
          {lookupFailed ? "We couldn't look up this code right now. Please try again later." : "We couldn't find a request with this code."} Email {BRAND.supportEmail} with the code and we will confirm the status.
        </p>
      )}
      <p className="mt-8 text-sm">
        <Link className="underline" href="/data-deletion">How to delete your data</Link> · <Link className="underline" href="/privacy">Privacy policy</Link>
      </p>
    </main>
  );
}
