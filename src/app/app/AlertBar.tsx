import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, Info, X } from "lucide-react";
import { dismissVerifyBannerAction, resendFromBannerAction } from "@/app/login/emailActions";
import styles from "./shell.module.css";

export type ShellAlert = { id: string; tone: "danger" | "info"; text: string; action?: ReactNode };

function Row({ alert }: { alert: ShellAlert }) {
  const Icon = alert.tone === "danger" ? AlertTriangle : Info;
  return (
    <div className={`${styles.alertRow} ${alert.tone === "danger" ? styles.alertDanger : ""}`}>
      <Icon width={16} height={16} aria-hidden="true" className={styles.alertIcon} />
      <span className={styles.alertText}>{alert.text}</span>
      {alert.action ? <span className={styles.alertActions}>{alert.action}</span> : null}
    </div>
  );
}

/** Resend / hide controls for the verify-email alert ("Later" hides it for 3 days via cookie). */
export function VerifyEmailActions() {
  return (
    <>
      <Link href="/verify-email" className={styles.alertLink}>Enter code</Link>
      <form action={resendFromBannerAction}>
        <button type="submit" className={styles.alertLinkBtn}>Resend</button>
      </form>
      <form action={dismissVerifyBannerAction}>
        <button type="submit" className={styles.alertDismiss} aria-label="Hide for now" title="Hide for now">
          <X width={14} height={14} aria-hidden="true" />
        </button>
      </form>
    </>
  );
}

/** One compact alert strip for the dashboard: the most important alert, the rest behind "+N more". */
export default function AlertBar({ alerts }: { alerts: ShellAlert[] }) {
  if (alerts.length === 0) return null;
  const [first, ...rest] = alerts;
  const urgent = alerts.some((a) => a.tone === "danger");
  return (
    <div role={urgent ? "alert" : "status"} className={styles.alertBar}>
      <Row alert={first} />
      {rest.length > 0 && (
        <details className={styles.alertMore}>
          <summary className={styles.alertMoreBtn}>
            +{rest.length} more <ChevronDown width={14} height={14} aria-hidden="true" />
          </summary>
          {rest.map((a) => <Row key={a.id} alert={a} />)}
        </details>
      )}
    </div>
  );
}
