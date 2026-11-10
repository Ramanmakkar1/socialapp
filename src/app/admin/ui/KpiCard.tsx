import type { ReactNode } from "react";
import styles from "../admin.module.css";

type KpiCardProps = {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: "up" | "down";
  accent?: boolean;
  spark?: ReactNode;
};

// White KPI card: uppercase label, big tabular value, optional delta chip + sparkline.
export default function KpiCard({ label, value, delta, deltaDir = "up", accent, spark }: KpiCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.kpi}>
        <div className={styles.kpiLabel}>{label}</div>
        <div className={`${styles.kpiValue} ${accent ? styles.kpiAccent : ""}`}>{value}</div>
        {delta && (
          <span className={`${styles.delta} ${deltaDir === "up" ? styles.deltaUp : styles.deltaDown}`}>
            {deltaDir === "up" ? "▲" : "▼"} {delta}
          </span>
        )}
        {spark}
      </div>
    </div>
  );
}
