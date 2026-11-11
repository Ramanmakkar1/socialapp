"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { PLATFORM_LABEL } from "./calendarUtils";
import styles from "./calendar.module.css";

type Props = {
  view: "week" | "month";
  label: string;
  subLabel?: string;
  prevHref: string;
  nextHref: string;
  todayHref: string;
  isCurrent: boolean;
  /** Platforms the user can filter by. */
  channels: string[];
  tags: string[];
};

// Calendar toolbar (Buffer-style): ‹ › range, Today, Week/Month, then Channels / status / tag filters
// and the viewer's time zone. Filters live in the URL so the server filters the posts.
export default function CalendarToolbar({ view, label, subLabel, prevHref, nextHref, todayHref, isCurrent, channels, tags }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/app/calendar";
  const params = useSearchParams();
  const id = useId();
  const [tz, setTz] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser time zone is only known after hydration
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete("compose");
    next.delete("draft");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function setView(v: string) {
    const next = new URLSearchParams();
    next.set("view", v);
    for (const k of ["channel", "status", "tag"]) {
      const val = params.get(k);
      if (val) next.set(k, val);
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const unit = view === "month" ? "month" : "week";

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarNav}>
        <Link href={prevHref} className={styles.arrowBtn} aria-label={`Previous ${unit}`}><ChevronLeft width={18} height={18} aria-hidden="true" /></Link>
        <Link href={nextHref} className={styles.arrowBtn} aria-label={`Next ${unit}`}><ChevronRight width={18} height={18} aria-hidden="true" /></Link>
        <h2 className={styles.rangeLabel} aria-live="polite">
          {label}
          {subLabel && <span className={styles.rangeSub}>{subLabel}</span>}
        </h2>
        <Link href={todayHref} className={styles.todayBtn} aria-disabled={isCurrent || undefined}>Today</Link>
        <span className={styles.selectWrap}>
          <label htmlFor={`${id}-view`} className={styles.srOnly}>Calendar range</label>
          <select id={`${id}-view`} value={view} onChange={(e) => setView(e.target.value)} className={styles.toolSelect}>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          <ChevronDown width={14} height={14} aria-hidden="true" />
        </span>
      </div>
      <div className={styles.toolbarFilters}>
        {channels.length > 1 && (
          <span className={styles.selectWrap}>
            <label htmlFor={`${id}-ch`} className={styles.srOnly}>Channels</label>
            <select id={`${id}-ch`} value={params.get("channel") ?? ""} onChange={(e) => setParam("channel", e.target.value)} className={styles.toolSelect}>
              <option value="">All channels</option>
              {channels.map((c) => <option key={c} value={c}>{PLATFORM_LABEL[c] ?? c}</option>)}
            </select>
            <ChevronDown width={14} height={14} aria-hidden="true" />
          </span>
        )}
        <span className={styles.selectWrap}>
          <label htmlFor={`${id}-st`} className={styles.srOnly}>Post status</label>
          <select id={`${id}-st`} value={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)} className={styles.toolSelect}>
            <option value="">All posts</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown width={14} height={14} aria-hidden="true" />
        </span>
        {tags.length > 0 && (
          <span className={styles.selectWrap}>
            <label htmlFor={`${id}-tag`} className={styles.srOnly}>Tag</label>
            <select id={`${id}-tag`} value={params.get("tag") ?? ""} onChange={(e) => setParam("tag", e.target.value)} className={styles.toolSelect}>
              <option value="">All tags</option>
              {tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown width={14} height={14} aria-hidden="true" />
          </span>
        )}
        <span className={styles.tzLabel} title="Times are shown in your browser's time zone">
          <Globe width={14} height={14} aria-hidden="true" />
          <span suppressHydrationWarning>{tz ? tz.replace(/_/g, " ") : "UTC"}</span>
        </span>
      </div>
    </div>
  );
}
