"use client";

import type { ReactNode } from "react";
import styles from "../admin.module.css";

export type Column = { key: string; label: string; align?: "left" | "right" };
export type Row = { cells: ReactNode[]; href?: string };

type DataTableProps = {
  columns: Column[];
  rows: Row[];
  empty?: string;
  emptyAction?: ReactNode;
  pagination?: { label: string };
};

// Sticky-header table: 52px rows, hover band, right-aligned numbers, row click → detail,
// horizontal scroll on phones, friendly empty state.
export default function DataTable({ columns, rows, empty, emptyAction, pagination }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className={styles.empty}>
        {empty ?? "Nothing here yet."}
        {emptyAction ? <div style={{ marginTop: 12 }}>{emptyAction}</div> : null}
      </div>
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.align === "right" ? styles.n : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={row.href ? styles.rowLink : undefined} onClick={row.href ? () => (window.location.href = row.href!) : undefined}>
              {row.cells.map((cell, j) => (
                <td key={j} className={columns[j]?.align === "right" ? styles.n : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--poskoo-muted)" }}>{pagination.label}</div>
      )}
    </div>
  );
}
