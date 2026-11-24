import Link from "next/link";
import { History, RefreshCw } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import LoadFailed from "../publish/LoadFailed";
import RewindFlow, { type RewindRule } from "./RewindFlow";
import LocalTime from "@/components/LocalTime";
import styles from "./rewind.module.css";

export const metadata = {
  title: "Rewind",
  description:
    "Send your auto-DM to comments from the past 7 days that your Auto-DM missed. Pick an Auto-DM, scan recent posts and queue the DMs.",
};

type RuleRow = { id: string; name: string; status: string; triggers: string[] | null; keywords: string[] | null; dm_text: string | null };

type Run = {
  id: string;
  created_at: Date;
  scanned: number;
  queued: number;
  failures: number;
  rule_name: string | null;
};

// Same conditions rewindRule() (src/lib/rewind.ts) checks before scanning.
function unavailableReason(rule: RuleRow): string | null {
  if (rule.status !== "active") return "This Auto-DM is paused. Turn it on to rewind it.";
  if (!(rule.triggers ?? []).includes("comment")) return "Rewind replays post comments, and this Auto-DM has no comment trigger.";
  return null;
}

function Header() {
  return (
    <header className={styles.head}>
      <span className={styles.headIcon} aria-hidden="true"><History width={20} height={20} /></span>
      <div>
        <h1 className={styles.h1}>Rewind</h1>
        <p className={styles.sub}>Send DMs to comments your Auto-DM missed</p>
      </div>
    </header>
  );
}

export default async function RewindPage() {
  const user = await requireUser();
  const configured = isDbConfigured();
  const loadFailure = (
    <div className={styles.page}>
      <Header />
      <LoadFailed className="mt-6" message="Rewind could not be loaded. Reload to try again." reloadHref="/app/rewind" />
    </div>
  );
  let rules: RuleRow[];
  try {
    rules = configured
      ? await query<RuleRow>(
          "select id, name, status, triggers, keywords, dm_text from socialapp.dm_rules where user_id=$1 order by (status='active' and 'comment' = any(triggers)) desc, name",
          [user.id]
        )
      : [];
  } catch {
    return loadFailure;
  }
  let runs: Run[];
  try {
    runs = configured ? await query<Run>(
      `select r.id, r.created_at, r.scanned, r.queued, r.failures, d.name as rule_name from socialapp.rewind_runs r left join socialapp.dm_rules d on d.id = r.rule_id where r.user_id=$1 order by r.created_at desc, r.id desc limit 20`,
      [user.id]
    ) : [];
  } catch {
    return loadFailure;
  }
  const flowRules: RewindRule[] = rules.map((r) => ({ id: r.id, name: r.name, keywords: r.keywords ?? [], dmText: r.dm_text ?? "", unavailable: unavailableReason(r) }));

  return (
    <div className={styles.page}>
      <Header />
      {rules.length === 0 ? (
        <section className={styles.card}>
          <h2 className={styles.h2}>Choose an Auto-DM to rewind</h2>
          <div className={styles.empty}>
            <p><b>No comment Auto-DMs to rewind yet.</b></p>
            <p>Create an Auto-DM with a comment trigger and it will appear here, ready to replay on your recent posts.</p>
            <Link href="/app/auto-dm" className={styles.primary}>Create an Auto-DM</Link>
          </div>
        </section>
      ) : (
        <RewindFlow rules={flowRules} />
      )}

      <section className={styles.card} aria-labelledby="rewind-history">
        <div className={styles.cardHead}>
          <h2 id="rewind-history" className={styles.h2}>Rewind history</h2>
          <Link href="/app/rewind" className={styles.ghost} prefetch={false}>
            <RefreshCw width={14} height={14} aria-hidden="true" /> Refresh
          </Link>
        </div>
        {runs.length === 0 ? (
          <div className={styles.empty}>
            <History width={22} height={22} aria-hidden="true" className={styles.emptyIcon} />
            <p><b>No rewind jobs yet</b></p>
            <p>Run your first rewind above and it will be listed here with what was queued.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>{["When", "Auto-DM", "Comments scanned", "DMs queued", "Status"].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td><LocalTime value={run.created_at} style="medium" fallback="-" /></td>
                    <td>{run.rule_name || "—"}</td>
                    <td className={styles.num}>{run.scanned}</td>
                    <td className={styles.num}>{run.queued}</td>
                    <td>
                      {run.failures > 0 ? (
                        <span className={`${styles.pill} ${styles.pillWarn}`}>Partial ({run.failures} failed)</span>
                      ) : (
                        <span className={`${styles.pill} ${styles.pillOk}`}>Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
