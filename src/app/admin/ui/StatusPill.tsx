import styles from "../admin.module.css";

export type StatusTone = "ok" | "warn" | "err" | "info";

const TONE_CLASS: Record<StatusTone, string> = {
  ok: styles.pillOk,
  warn: styles.pillWarn,
  err: styles.pillErr,
  info: styles.pillInfo,
};

// 24px status pill, colours from the brand tokens.
export default function StatusPill({ tone, children }: { tone: StatusTone; children: string }) {
  return <span className={`${styles.pill} ${TONE_CLASS[tone]}`}>{children}</span>;
}
