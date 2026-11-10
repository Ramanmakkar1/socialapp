"use client";

import { Printer } from "lucide-react";
import styles from "./report.module.css";

export default function PrintButton() {
  return (
    <button type="button" className={styles.printBtn} onClick={() => window.print()}>
      <Printer width={16} height={16} aria-hidden="true" />
      Print / Save as PDF
    </button>
  );
}
