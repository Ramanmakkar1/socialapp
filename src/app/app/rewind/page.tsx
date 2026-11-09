import { History } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import EmptyState from "../EmptyState";
import LoadFailed from "../calendar/LoadFailed";
import RewindFlow from "./RewindFlow";
import LocalTime from "@/components/LocalTime";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";

export const metadata = {
  title: "Rewind",
  description:
    "Send your auto-DM to comments from the past 7 days that your automation missed. Pick an automation, scan recent posts and queue the DMs.",
};

type Rule = { id: string; name: string };

type Run = {
  id: string;
  created_at: Date;
  scanned: number;
  queued: number;
  failures: number;
  rule_name: string | null;
};

export default async function RewindPage() {
  const user = await requireUser();
  const configured = isDbConfigured();
  const loadFailure = (
    <>
      <PageHero
        eyebrow="Catch up on past comments"
        title="Rewind"
        lede="Send your auto-DM to recent comments it missed."
        art="/landing/card-leads.webp"
        artAlt=""
      />
      <LoadFailed
        className="mt-6"
        message="Rewind could not be loaded. Reload to try again."
        reloadHref="/app/rewind"
      />
    </>
  );
  let rules: Rule[];
  try {
    rules = configured ? await query<Rule>(
      "select id, name from socialapp.dm_rules where user_id=$1 and status='active' and 'comment' = any(triggers) order by name",
      [user.id]
    ) : [];
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

  return (
    <>
      <PageHero
        eyebrow="Catch up on past comments"
        title="Rewind"
        lede="Pick an automation and Poskoo scans your latest posts, then queues the DM to comments from the past 7 days it missed."
        art="/landing/card-leads.webp"
        artAlt=""
      />
      {rules.length === 0 ? (
        <div className={`${ui.card} ${ui.mint} mt-6 p-5 text-[.95rem]`}>
          <p className="m-0 text-[var(--poskoo-ink)]">
            No comment automations to rewind yet.
          </p>
          <p className="mt-2 text-[var(--poskoo-muted)]">
            Create an automation with a comment trigger and it will appear here, ready to replay on your recent posts.
          </p>
          <BtnLink href="/app/auto-dm" size="sm" className="mt-3">
            Create an automation
          </BtnLink>
        </div>
      ) : (
        <div className="mt-6">
          <RewindFlow rules={rules.map((rule) => ({ id: rule.id, name: rule.name }))} />
        </div>
      )}
      <h2 className="mt-10 text-xl font-bold text-[var(--poskoo-ink)]">Recent scans</h2>
      {runs.length === 0 ? (
        <p className={`${ui.hint} mt-3`}>
          No scans yet. Run your first rewind above and it will be listed here with what was queued.
        </p>
      ) : (
        <div className={`mt-4 ${ui.tableWrap}`}>
          <table className={ui.table}>
            <thead>
              <tr>{["When", "Automation", "Comments scanned", "DMs queued", "Status"].map((heading) => <th key={heading} scope="col" className={ui.th}>{heading}</th>)}</tr>
            </thead>
            <tbody>{runs.map((run) => (
              <tr key={run.id} className={ui.tr}>
                <td className={ui.td}><LocalTime value={run.created_at} style="medium" fallback="-" /></td>
                <td className={ui.td}>{run.rule_name || "—"}</td>
                <td className={ui.td}>{run.scanned}</td>
                <td className={ui.td}>{run.queued}</td>
                <td className={ui.td}>
                  {run.failures > 0 ? (
                    <span className="text-[var(--poskoo-coral)]">Partial scan ({run.failures} failed)</span>
                  ) : (
                    <span className="text-[var(--poskoo-green)]">Complete</span>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {rules.length === 0 && runs.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={History}
            title="Nothing to rewind yet"
            text="Once you have a comment automation and recent posts, you can replay the DM on past comments here."
            art="/illustrations/empty-leads.webp"
            artWidth={1536}
            artHeight={1024}
          />
        </div>
      ) : null}
    </>
  );
}
