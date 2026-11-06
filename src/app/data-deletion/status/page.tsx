import type { CSSProperties } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { BRAND } from "@/lib/brand";
import { isDbConfigured, query } from "@/lib/db";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

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
    <PublicShell>
      <Suspense fallback={<p role="status" className="small" style={{ padding: "48px 0" }}>Loading deletion status…</p>}>
        <DeletionStatus searchParams={searchParams} />
      </Suspense>
    </PublicShell>
  );
}

const noticeCard: CSSProperties = {
  borderRadius: "var(--poskoo-radius-card)",
  boxShadow: "var(--poskoo-shadow-card)",
  padding: "22px 24px",
};

const inputStyle: CSSProperties = {
  flex: "1 1 220px",
  minWidth: 0,
  border: "1.5px solid var(--poskoo-line)",
  borderRadius: "var(--poskoo-radius-sm)",
  background: "var(--poskoo-card)",
  color: "var(--poskoo-ink)",
  padding: "12px 16px",
  font: "inherit",
};

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
    <>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/">Home</Link> / <Link href="/data-deletion">Data deletion</Link> / Status
      </nav>
      <header className="hero">
        <p className="eyebrow">Data deletion</p>
        <h1>Data deletion status</h1>
      </header>
      <section style={{ paddingTop: 40 }}>
        <div className={s.prose}>
          <form method="get" style={{ marginBottom: "28px" }}>
            <label htmlFor="code" style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}>
              Confirmation code
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <input
                id="code"
                name="code"
                defaultValue={code}
                placeholder="Confirmation code"
                style={inputStyle}
                className="focus:border-[var(--poskoo-violet)] focus:outline-none"
              />
              <button type="submit" className="btn btn-dark">Check status</button>
            </div>
          </form>
          {!code ? (
            <p>Enter the confirmation code you received when you removed {BRAND.name} from Instagram.</p>
          ) : row ? (
            <div style={{ ...noticeCard, background: "var(--poskoo-mint)" }}>
              <p className="small">Confirmation code</p>
              <p style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--poskoo-ink)" }}>{code}</p>
              <p style={{ fontWeight: 600, marginTop: "14px" }}>{LABELS[row.status] ?? row.status}</p>
              <p className="small" style={{ marginTop: "6px" }}>Requested: {fmt(row.requested_at)} · Finished: {fmt(row.completed_at)}</p>
            </div>
          ) : (
            <p style={{ ...noticeCard, background: "var(--poskoo-peach)" }}>
              {lookupFailed ? "We couldn't look up this code right now. Please try again later." : "We couldn't find a request with this code."} Email {BRAND.supportEmail} with the code and we will confirm the status.
            </p>
          )}
          <p className="small" style={{ marginTop: "28px" }}>
            <Link className={s.vlink} href="/data-deletion">How to delete your data</Link> · <Link className={s.vlink} href="/privacy">Privacy policy</Link>
          </p>
        </div>
      </section>
    </>
  );
}
