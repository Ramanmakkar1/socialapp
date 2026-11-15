import { BtnA } from "@/components/ui/kit";
import styles from "./calendar.module.css";

export type LoadError = { message: string; reloadHref: string };

export default function LoadFailed({
  message,
  reloadHref,
  className = "",
}: {
  message: string;
  reloadHref: string;
  className?: string;
}) {
  return (
    <div className={`${styles.loadFailed} ${className}`}>
      <p role="alert">{message}</p>
      <BtnA href={reloadHref} variant="ghost" size="sm">
        Reload
      </BtnA>
    </div>
  );
}
