import Link from "next/link";
import styles from "../admin.module.css";

// Prev / Next links for a LIMIT n+1 list (no total count: counting big tables on every view is not cheap).
export default function Pager({ page, hasNext, href, shown }: { page: number; hasNext: boolean; href: (page: number) => string; shown: number }) {
  if (page <= 1 && !hasNext) return null;
  return (
    <nav className={styles.pager} aria-label="Pages">
      <span>
        Page {page} · {shown} shown
      </span>
      <span className={styles.act}>
        <Link href={href(page - 1)} className={`${styles.btn} ${styles.btnSm} ${page <= 1 ? styles.btnOff : ""}`} aria-disabled={page <= 1}>
          ← Newer
        </Link>
        <Link href={href(page + 1)} className={`${styles.btn} ${styles.btnSm} ${hasNext ? "" : styles.btnOff}`} aria-disabled={!hasNext}>
          Older →
        </Link>
      </span>
    </nav>
  );
}
