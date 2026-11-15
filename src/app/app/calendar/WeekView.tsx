"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import LoadFailed, { type LoadError } from "./LoadFailed";
import { CalendarGridSkeleton } from "../Skeleton";
import PostCard from "./PostCard";
import PostPopover from "./PostPopover";
import { addDays, groupByDay, hourLabel, zonedParts, type AccountNames, type CalendarPost } from "./calendarUtils";
import { useCalendar } from "./useCalendar";
import styles from "./calendar.module.css";

type WeekViewProps = {
  posts: CalendarPost[];
  /** Monday of the week (UTC midnight); the 7 days are shown in the viewer's time zone. */
  weekStart: Date;
  /** "/app/calendar?view=week&week=...&compose=1"; "&day=YYYY-MM-DD" is added per day. */
  composeBase?: string;
  accounts?: AccountNames;
  loadError?: LoadError;
};

const MAX_IN_CELL = 3;
const DEFAULT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function dayLabels(key: string) {
  const d = new Date(`${key}T12:00:00Z`);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    num: d.getUTCDate(),
    long: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }),
  };
}

export default function WeekView({ posts, weekStart, composeBase, accounts = {}, loadError }: WeekViewProps) {
  const { posts: visiblePosts, tz, error, dragOverKey, dropProps, open, openPost, closePost } = useCalendar(posts);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const todayKey = zonedParts(new Date(), tz).key;
  const startKey = weekStart.toISOString().slice(0, 10);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startKey, i));
  const byDay = groupByDay(visiblePosts, tz);

  // Rows: every hour that has a post this week, or a working-day range when the week is empty.
  const byCell = new Map<string, CalendarPost[]>();
  const hourSet = new Set<number>();
  for (const key of days) {
    for (const post of byDay.get(key) ?? []) {
      const { hour } = zonedParts(post.scheduled_at!, tz);
      hourSet.add(hour);
      const cell = `${key}|${hour}`;
      byCell.set(cell, [...(byCell.get(cell) ?? []), post]);
    }
  }
  const hours = hourSet.size ? [...hourSet].sort((a, b) => a - b) : DEFAULT_HOURS;

  const toggle = (cell: string) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(cell)) next.delete(cell);
      else next.add(cell);
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

      {/* Desktop / tablet: hour rows x 7 day columns. */}
      <div className={styles.weekTable} role="table" aria-label="Posts this week by day and hour" aria-rowcount={hours.length + 1}>
        <div className={styles.weekRow} role="row">
          <span className={styles.hourCorner} role="columnheader" aria-label="Time" />
          {days.map((key) => {
            const { weekday, num } = dayLabels(key);
            const isToday = key === todayKey;
            const count = byDay.get(key)?.length ?? 0;
            return (
              <div key={key} role="columnheader" className={`${styles.dayHead} ${isToday ? styles.dayHeadToday : ""}`} aria-current={isToday ? "date" : undefined}>
                <span className={styles.dayHeadName}>{weekday}</span>
                <span className={styles.dayHeadNum}>{num}</span>
                {count > 0 && <span className={styles.srOnly}>, {count} {count === 1 ? "post" : "posts"}</span>}
                {composeBase && key >= todayKey && (
                  <Link href={`${composeBase}&day=${key}`} scroll={false} className={styles.dayAdd} aria-label={`New post on ${dayLabels(key).long}`}>
                    <Plus width={14} height={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        {hours.map((hour) => (
          <div key={hour} className={styles.weekRow} role="row">
            <span className={styles.hourLabel} role="rowheader">{hourLabel(hour)}</span>
            {days.map((key) => {
              const cell = `${key}|${hour}`;
              const list = byCell.get(cell) ?? [];
              const isOpen = expanded.has(cell);
              const shown = isOpen ? list : list.slice(0, MAX_IN_CELL);
              const extra = list.length - MAX_IN_CELL;
              return (
                <div
                  key={cell}
                  role="cell"
                  {...dropProps(key, byDay.get(key) ?? [])}
                  className={[styles.cell, key === todayKey ? styles.cellToday : "", key < todayKey ? styles.cellPast : "", dragOverKey === key ? styles.cellOver : ""].filter(Boolean).join(" ")}
                >
                  {shown.map((post) => (
                    <PostCard key={post.id} post={post} tz={tz} onOpen={openPost} />
                  ))}
                  {extra > 0 && (
                    <button type="button" className={styles.moreBtn} aria-expanded={isOpen} onClick={() => toggle(cell)}>
                      {isOpen ? "Show less" : `${extra} more`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Phones: one agenda list per day. */}
      <ol className={styles.agenda} aria-label="Posts this week">
        {days.map((key) => {
          const list = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const { long } = dayLabels(key);
          return (
            <li key={key} className={styles.agendaDay}>
              <div className={styles.agendaHead}>
                <h3 className={styles.agendaTitle}>
                  {long}
                  {isToday && <span className={styles.todayTag}>Today</span>}
                </h3>
                {composeBase && key >= todayKey && (
                  <Link href={`${composeBase}&day=${key}`} scroll={false} className={styles.agendaAdd} aria-label={`New post on ${long}`}>
                    <Plus width={16} height={16} aria-hidden="true" />
                  </Link>
                )}
              </div>
              {list.length ? (
                <div className={styles.agendaList}>
                  {list.map((post) => <PostCard key={post.id} post={post} tz={tz} onOpen={openPost} />)}
                </div>
              ) : (
                <p className={styles.agendaEmpty}>No posts</p>
              )}
            </li>
          );
        })}
      </ol>

      <p className={styles.calHint}>
        <span className={styles.wideOnly}>Drag a scheduled post or draft to another day to move it (the time stays the same). </span>
        Open a post to edit, duplicate, reschedule or delete it.
      </p>

      {open && <PostPopover key={open.post.id} post={open.post} anchor={open.anchor} tz={tz} accounts={accounts} onClose={closePost} />}
    </div>
  );
}
