import type { AdminPostTarget } from "@/lib/adminPosts";
import StatusPill, { type StatusTone } from "./StatusPill";
import NetworkTag from "./NetworkTag";
import styles from "../admin.module.css";

/** Tone for a post or post-target status (scheduled_posts / post_targets). */
export function postStatusTone(status: string): StatusTone {
  if (status === "published") return "ok";
  if (status === "failed") return "err";
  if (status === "publishing" || status === "pending" || status === "reminded") return "warn";
  return "info";
}

// One line per network target: badge, status, and the error text when there is one.
export function PostTargets({ targets }: { targets: AdminPostTarget[] }) {
  if (targets.length === 0) return <span className={styles.muted}>no targets</span>;
  return (
    <div className={styles.targets}>
      {targets.map((t) => (
        <div key={t.platform} className={styles.target}>
          <NetworkTag platform={t.platform} />
          <StatusPill tone={postStatusTone(t.status)}>{t.status}</StatusPill>
          {t.error && <span className={styles.errText}>{t.error}</span>}
        </div>
      ))}
    </div>
  );
}
