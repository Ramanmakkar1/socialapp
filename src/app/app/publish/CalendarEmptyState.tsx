import { BtnLink } from "@/components/ui/kit";
import styles from "../empty-state.module.css";

export default function CalendarEmptyState({ composeHref }: { composeHref: string }) {
  return (
    <div className={styles.empty}>
      <div className={styles.art}>
        <svg
          width={220}
          height={180}
          viewBox="0 0 220 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="34" y="42" width="128" height="112" rx="16" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" strokeWidth="3" />
          <path d="M34 66h128" stroke="var(--poskoo-line)" strokeWidth="3" />
          <rect x="34" y="42" width="128" height="24" rx="12" fill="var(--poskoo-violet)" />
          <rect x="34" y="54" width="128" height="12" fill="var(--poskoo-violet)" />
          <rect x="54" y="30" width="8" height="24" rx="4" fill="var(--poskoo-ink)" />
          <rect x="134" y="30" width="8" height="24" rx="4" fill="var(--poskoo-ink)" />
          <rect x="54" y="82" width="24" height="20" rx="6" fill="var(--poskoo-coral)" opacity="0.18" />
          <rect x="86" y="82" width="24" height="20" rx="6" fill="var(--poskoo-violet)" opacity="0.14" />
          <rect x="118" y="82" width="24" height="20" rx="6" fill="var(--poskoo-coral)" opacity="0.18" />
          <rect x="54" y="110" width="24" height="20" rx="6" fill="var(--poskoo-violet)" opacity="0.14" />
          <rect x="86" y="110" width="24" height="20" rx="6" fill="var(--poskoo-coral)" opacity="0.18" />
          <path d="M150 96l44-22-16 44-10-16-18-6z" fill="var(--poskoo-coral)" />
          <path d="M150 96l28 6-10 16-18-22z" fill="var(--poskoo-violet)" />
          <path d="M178 102l16-28" stroke="var(--poskoo-card)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M186 44l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" fill="var(--poskoo-violet)" />
          <path d="M28 112l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="var(--poskoo-coral)" />
          <circle cx="196" cy="128" r="4" fill="var(--poskoo-violet)" opacity="0.5" />
          <circle cx="24" cy="70" r="3" fill="var(--poskoo-coral)" opacity="0.6" />
        </svg>
      </div>
      <h2 className={styles.title}>Your calendar is empty</h2>
      <p className={styles.text}>Schedule your first post in under a minute.</p>
      <div className={styles.actions}>
        <BtnLink href={composeHref} scroll={false} size="sm">Schedule a post</BtnLink>
      </div>
    </div>
  );
}
