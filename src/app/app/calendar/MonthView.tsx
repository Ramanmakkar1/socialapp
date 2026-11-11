"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import LoadFailed, { type LoadError } from "./LoadFailed";
import { CalendarGridSkeleton } from "../Skeleton";
import PostCard from "./PostCard";
import PostPopover from "./PostPopover";
import { addDays, groupByDay, zonedParts, type AccountNames, type CalendarPost } from "./calendarUtils";
import { useCalendar } from "./useCalendar";
import styles from "./calendar.module.css";

type MonthViewProps = {
  posts: CalendarPost[];
  /** First day of the month (UTC midnight). */
  monthStart: Date;
  /** "/app/calendar?view=month&month=...&compose=1"; "&day=YYYY-MM-DD" is added per day. */
  composeBase?: string;
  accounts?: AccountNames;
  loadError?: LoadError;
};

const MAX_CHIPS = 3;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthView({ posts, monthStart, composeBase, accounts = {}, loadError }: MonthViewProps) {
  const { tz, error, dragOverKey, dropProps, open, openPost, closePost } = useCalendar(posts);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const todayKey = zonedParts(new Date(), tz).key;
  const byDay = groupByDay(posts, tz);
  const monthKey = monthStart.toISOString().slice(0, 7);

  // Monday on/before the 1st through the Sunday on/after the last day.
  const firstKey = `${monthKey}-01`;
  const startDow = new Date(`${firstKey}T12:00:00Z`).getUTCDay();
  const gridStart = addDays(firstKey, -(startDow === 0 ? 6 : startDow - 1));
  const lastKey = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
  const endDow = new Date(`${lastKey}T12:00:00Z`).getUTCDay();
  const gridEnd = addDays(lastKey, endDow === 0 ? 0 : 7 - endDow);
  const days: string[] = [];
  for (let k = gridStart; k <= gridEnd; k = addDays(k, 1)) days.push(k);

  const toggle = (key: string) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Days and hours depend on the browser time zone, which is only known after hydration.
  if (!tz) {
    return (
      <div className={styles.calWrap} role="status" aria-busy="true">
        <span className={styles.srOnly}>Loading calendar</span>
        <CalendarGridSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.calWrap}>
      {error && <p role="alert" className={styles.errorText}>{error}</p>}
      {loadError && <LoadFailed {...loadError} className={styles.mb} />}
      <div className={styles.monthGrid}>
        {WEEKDAYS.map((name) => (
          <p key={name} className={styles.monthHead} aria-hidden="true">{name}</p>
        ))}
        {days.map((key) => {
          const list = byDay.get(key) ?? [];
          const inMonth = key.startsWith(monthKey);
          const isToday = key === todayKey;
          const isOpen = expanded.has(key);
          const shown = isOpen ? list : list.slice(0, MAX_CHIPS);
          const extra = list.length - MAX_CHIPS;
          const d = new Date(`${key}T12:00:00Z`);
          const long = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
          return (
            <section
              key={key}
              aria-label={`${long}${list.length ? `, ${list.length} ${list.length === 1 ? "post" : "posts"}` : ""}`}
              {...dropProps(key, list)}
              className={[styles.monthDay, inMonth ? "" : styles.monthDayOut, isToday ? styles.monthDayToday : "", key < todayKey ? styles.cellPast : "", dragOverKey === key ? styles.cellOver : "", list.length ? "" : styles.monthDayEmpty].filter(Boolean).join(" ")}
            >
              <div className={styles.monthDayHead}>
                <span className={styles.monthNum} aria-current={isToday ? "date" : undefined}>
                  <span className={styles.phoneOnly}>{d.toLocaleDateString("en-US", { weekday: "short", month: "short", timeZone: "UTC" })} </span>
                  {d.getUTCDate()}
                </span>
                {composeBase && key >= todayKey && (
                  <Link href={`${composeBase}&day=${key}`} scroll={false} className={styles.dayAdd} aria-label={`New post on ${long}`}>
                    <Plus width={14} height={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className={styles.monthPosts}>
                {shown.map((post) => (
                  <PostCard key={post.id} post={post} tz={tz} compact onOpen={openPost} />
                ))}
                {extra > 0 && (
                  <button type="button" className={styles.moreBtn} aria-expanded={isOpen} onClick={() => toggle(key)}>
                    {isOpen ? "Show less" : `${extra} more`}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <p className={styles.calHint}>
        <span className={styles.wideOnly}>Drag a scheduled post or draft to another day to move it (the time stays the same). </span>
        Open a post to edit, duplicate, reschedule or delete it.
      </p>
      {open && <PostPopover key={open.post.id} post={open.post} anchor={open.anchor} tz={tz} accounts={accounts} onClose={closePost} />}
    </div>
  );
}
