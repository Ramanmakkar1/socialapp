"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import {
  PERFORMANCE_CSV_HEADERS,
  performanceCsvRows,
  toCsv,
  type PostPerformanceRow,
} from "@/lib/analytics";
import styles from "./analytics.module.css";

type SortKey = "publishedAt" | "reach" | "impressions" | "likes" | "comments" | "saved" | "linkClicks";

const COLUMNS: { key: SortKey | "caption" | "platforms"; label: string; numeric?: boolean }[] = [
  { key: "caption", label: "Post" },
  { key: "publishedAt", label: "Published" },
  { key: "platforms", label: "Platforms" },
  { key: "reach", label: "Reach", numeric: true },
  { key: "impressions", label: "Impressions", numeric: true },
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

function shortCaption(caption: string): string {
  const text = caption.trim();
  if (!text) return "(no caption)";
  return text.length > 60 ? `${text.slice(0, 60).trimEnd()}…` : text;
}

function formatPlatforms(platforms: string[]): string {
  return platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
}

export default function PostPerformanceTable({ rows }: { rows: PostPerformanceRow[] }) {
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

  return (
    <div>
      <div className={styles.tableToolbar}>
        <button type="button" className={styles.exportBtn} onClick={exportCsv} disabled={rows.length === 0}>
          <Download width={15} height={15} aria-hidden="true" />
          Export CSV
        </button>
      </div>
      <div className={styles.tableWrap}>
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className={styles.tableHead}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 font-medium ${col.numeric ? "text-right" : ""}`}
                  aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {col.numeric || col.key === "publishedAt" ? (
                    <button
                      type="button"
                      className={styles.sortBtn}
                      onClick={() => toggleSort(col.key as SortKey)}
                    >
                      {col.label}
                      <span aria-hidden="true" className={styles.sortArrow}>
                        {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className={styles.tableRow}>
                <td className="px-4 py-3">{shortCaption(row.caption)}</td>
                <td className="px-4 py-3 tabular-nums">
                  <LocalTime value={row.publishedAt} style="medium" fallback="—" />
                </td>
                <td className="px-4 py-3">{formatPlatforms(row.platforms)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMetric(row.reach)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMetric(row.impressions)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMetric(row.likes)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMetric(row.comments)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMetric(row.saved)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.linkClicks.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
