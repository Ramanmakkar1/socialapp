import Link from "next/link";
import { AlertCircle, CalendarDays, CloudOff } from "lucide-react";
import { BtnA } from "@/components/ui/kit";
import styles from "./calendar.module.css";

export type LoadError = { message: string; reloadHref: string };

export default function LoadFailed({
  message,
  reloadHref,
  className = "",
  icon = "generic",
}: {
  message: string;
  reloadHref: string;
  className?: string;
  /** "calendar" keeps the calendar illustration for calendar failures; other failure states use a generic one. */
  icon?: "calendar" | "generic";
}) {
  return (
    <div className={`${styles.loadFailed} ${className}`}>
      <div className={styles.loadFailedIcon} aria-hidden="true">
        {icon === "calendar" ? <CalendarDays size={22} /> : <CloudOff size={22} />}
      </div>
      <p role="alert" className={styles.loadFailedText}>
        <AlertCircle size={15} className={styles.loadFailedAlertIcon} aria-hidden="true" />
        {message}
      </p>
      <div className={styles.loadFailedActions}>
        <BtnA href={reloadHref} variant="dark" size="sm">
          Reload
        </BtnA>
        <Link href="/help" className={styles.loadFailedHelp}>
          Need help?
        </Link>
      </div>
    </div>
  );
}
