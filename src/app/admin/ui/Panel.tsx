import type { ReactNode } from "react";
import styles from "../admin.module.css";

type PanelProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
};

// Card with a header row (title, muted subtitle, right-side actions) and a body.
export default function Panel({ title, subtitle, actions, children, flush }: PanelProps) {
  return (
    <div className={styles.card}>
      <div className={styles.panelHead}>
        <h2>{title}</h2>
        {subtitle && <span className={styles.panelSub}>{subtitle}</span>}
        {actions && <span className={styles.act}>{actions}</span>}
      </div>
      <div className={flush ? styles.panelBodyFlush : styles.panelBody}>{children}</div>
    </div>
  );
}
