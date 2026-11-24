"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import {
  PERFORMANCE_CSV_HEADERS,
  performanceCsvRows,
  toCsv,
  type PostPerformanceRow,
} from "@/lib/analyticsCsv";
import styles from "./analytics.module.css";

type SortKey = "publishedAt" | "reach" | "impressions" | "likes" | "comments" | "saved" | "linkClicks";

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "reach", label: "Reach", numeric: true },
  { key: "impressions", label: "Views", numeric: true },
  { key: "likes", label: "Likes", numeric: true },
  { key: "comments", label: "Comments", numeric: true },
  { key: "saved", label: "Saves", numeric: true },
  { key: "linkClicks", label: "Link clicks", numeric: true },
];

function metricValue(row: PostPerformanceRow, key: SortKey): number {
  if (key === "publishedAt") return row.publishedAt ? Date.parse(row.publishedAt) : 0;
  return row[key] ?? 0;
}

function formatMetric(value: number | null): string {
  return value == null ? "—" : value.toLocaleString("en-US");
}

function platformLabel(p: string): string {
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function PostPerformanceTable({ rows, thumbs = {} }: { rows: PostPerformanceRow[]; thumbs?: Record<string, string> }) {
  const [sortKey, setSortKey] = useState<SortKey>("publishedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const diff = metricValue(a, sortKey) - metricValue(b, sortKey);
      return sortDir === "asc" ? diff : -diff;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCsv() {
    const csv = toCsv(PERFORMANCE_CSV_HEADERS, performanceCsvRows(sorted));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "poskoo-post-performance.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function sortHeader(key: SortKey, label: string, numeric = true) {
    return (
      <th
        key={key}
        scope="col"
        className={numeric ? styles.num : undefined}
        aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
      >
        <button type="button" className={styles.sortBtn} onClick={() => toggleSort(key)}>
          {label}
          <span aria-hidden="true" className={styles.sortArrow}>
            {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
          </span>
        </button>
      </th>
    );
  }

  return (
    <div>
      <div className={styles.tableToolbar}>
        <span className={styles.subtle}>{rows.length} {rows.length === 1 ? "post" : "posts"}</span>
        <button type="button" className={styles.ghostBtn} onClick={exportCsv} disabled={rows.length === 0}>
          <Download width={15} height={15} aria-hidden="true" />
          Export CSV
        </button>
      </div>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.perfTable}`}>
          <thead>
            <tr>
              <th scope="col" className={styles.rankCol}>#</th>
              {sortHeader("publishedAt", "Post", false)}
              {COLUMNS.map((col) => sortHeader(col.key, col.label, col.numeric))}
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id}>
                <td className={styles.rankCol}>{i + 1}</td>
                <td>
                  <div className={styles.postCell}>
                    <span className={styles.thumb}>
                      {thumbs[row.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts
                        <img src={thumbs[row.id]} alt="" loading="lazy" />
                      ) : (
                        <ImageIcon width={16} height={16} aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className={styles.postCaption}>{row.caption.trim() || "(no caption)"}</p>
                      <p className={styles.postMeta}>
                        <LocalTime value={row.publishedAt} style="medium" fallback="—" />
                        {row.platforms.map((p) => (
                          <span key={p} className={styles.typeChip}>{platformLabel(p)}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className={`${styles.num} tabular-nums`}>
                    {col.key === "linkClicks" ? row.linkClicks.toLocaleString("en-US") : formatMetric(row[col.key as Exclude<SortKey, "publishedAt" | "linkClicks">])}
                  </td>
                ))}
                <td>
                  <details className={styles.rowMenu}>
                    <summary aria-label={`Actions for post ${i + 1}`}><MoreHorizontal width={16} height={16} aria-hidden="true" /></summary>
                    <div className={styles.rowMenuList}>
                      <Link href={`/app/publish?view=month&month=${(row.publishedAt ?? new Date().toISOString()).slice(0, 7)}`}>View in calendar</Link>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(row.caption)}>Copy caption</button>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
