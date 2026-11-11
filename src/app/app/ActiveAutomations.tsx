"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, MessageCircle, MoreHorizontal } from "lucide-react";
import { toggleRule } from "./auto-dm/actions";
import { formatCtr } from "@/lib/ctr";
import styles from "./home.module.css";

export type AutomationRow = {
  id: string;
  name: string;
  status: string;
  summary: string;
  dmsSent: number;
  clicks: number;
  uniqueClicks?: number;
  triggers?: string[];
};

// Active automations table with one-tap Pause / Resume (same server action as the Auto-DM page).
export default function ActiveAutomations({ rows }: { rows: AutomationRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    setBusy(id);
    setError(null);
    startTransition(async () => {
      const res = await toggleRule(id);
      if (!res.ok) setError(res.errors[0] ?? "Could not update the automation.");
      setBusy(null);
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className={styles.tableCard}>
        <p className={styles.empty}>
          No automations yet. <Link href="/app/auto-dm">Create your first automation</Link> and Poskoo will DM everyone who comments your keyword.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      {error && <p role="alert" className={styles.empty}>{error}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col" className={styles.num}>DMs</th>
            <th scope="col" className={styles.num}>Clicks</th>
            <th scope="col" className={styles.num}>CTR</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const live = r.status === "active";
            const ctr = formatCtr(r.uniqueClicks ?? r.clicks, r.dmsSent);
            return (
              <tr key={r.id}>
                <td>
                  <div className={styles.ruleCell}>
                    <span className={styles.ruleIcon} aria-hidden="true">
                      {r.triggers?.includes("story_reply") && !r.triggers.includes("comment") ? <AtSign width={16} height={16} /> : <MessageCircle width={16} height={16} />}
                    </span>
                    <div className={styles.ruleText}>
                      <div className={styles.ruleName}>{r.name}</div>
                      <div className={styles.ruleSub}>{r.summary}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.num}>{r.dmsSent}</td>
                <td className={styles.num}>{r.clicks}</td>
                <td className={styles.num}>{ctr}</td>
                <td><span className={live ? styles.live : styles.paused}>{live ? "Live" : "Paused"}</span></td>
                <td>
                  <div className={styles.rowActions}>
                    <button type="button" className={styles.toggle} disabled={busy === r.id} onClick={() => toggle(r.id)} aria-label={`${live ? "Pause" : "Resume"} ${r.name}`}>
                      {busy === r.id ? "Saving…" : live ? "Pause" : "Resume"}
                    </button>
                    <details className={styles.rowMenu}>
                      <summary aria-label={`More actions for ${r.name}`}><MoreHorizontal width={16} height={16} aria-hidden="true" /></summary>
                      <div className={styles.rowMenuList}>
                        <Link href="/app/auto-dm">Edit automation</Link>
                        <Link href="/app/auto-dm/activity">View activity</Link>
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
