"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ui from "@/components/ui/ui.module.css";
import styles from "./commerce.module.css";
import { PER_PAGE_OPTIONS } from "./pager";

/** Table footer: rows-per-page select, "1-10 of 34", previous / next. */
export default function TablePager({
  basePath,
  total,
  page,
  perPage,
  label,
}: {
  basePath: string;
  total: number;
  page: number;
  perPage: number;
  label: string;
}) {
  const router = useRouter();
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  const href = (p: number, per = perPage) => `${basePath}?page=${p}&per=${per}`;
  const selectId = `${label.replace(/\W+/g, "-").toLowerCase()}-per-page`;
  return (
    <nav aria-label={`${label} pagination`} className={styles.pager}>
      <span className={styles.pagerRows}>
        <label htmlFor={selectId} className={ui.hint}>Rows per page</label>
        <select
          id={selectId}
          className={`${ui.input} ${styles.pagerSelect}`}
          value={perPage}
          onChange={(e) => router.push(href(1, Number(e.target.value)))}
        >
          {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </span>
      <span className={ui.hint} aria-live="polite">{from}-{to} of {total}</span>
      <span className={styles.pagerButtons}>
        {page > 1 ? (
          <Link href={href(page - 1)} className={`${ui.btn} ${ui.btnGhost} ${ui.sm}`}>Previous</Link>
        ) : (
          <span className={`${ui.btn} ${ui.btnGhost} ${ui.sm} ${styles.disabled}`} aria-disabled="true">Previous</span>
        )}
        {page < pages ? (
          <Link href={href(page + 1)} className={`${ui.btn} ${ui.btnGhost} ${ui.sm}`}>Next</Link>
        ) : (
          <span className={`${ui.btn} ${ui.btnGhost} ${ui.sm} ${styles.disabled}`} aria-disabled="true">Next</span>
        )}
      </span>
    </nav>
  );
}
