"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import LoadFailed, { type LoadError } from "./LoadFailed";
import { CalendarGridSkeleton } from "../Skeleton";
import PostPopover from "./PostPopover";
import WeekPostCard from "./WeekPostCard";
import { addDays, hourLabel, type AccountNames, type CalendarPost } from "./calendarUtils";
import { HOURS, groupBySlot, initialScrollHour, isSlotPast, slotId, slotOf, slotStart } from "./weekGrid";
import { useCalendar } from "./useCalendar";
import styles from "./calendar.module.css";

type WeekViewProps = {
  posts: CalendarPost[];
  /** Sunday of the week (UTC midnight); the 7 days are shown in the viewer's time zone. */
  weekStart: Date;
  /** "/app/calendar?view=week&week=...&compose=1"; "&day=" (header +) or "&at=" (empty slot) is added. */
  composeBase?: string;
  accounts?: AccountNames;
  loadError?: LoadError;
  /** Day view: show only this day (YYYY-MM-DD), full width, no phone day tabs. */
  singleDay?: string;
};

const PHONE_QUERY = "(max-width: 767px)";

function subscribePhone(cb: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function dayLabels(key: string) {
  const d = new Date(`${key}T12:00:00Z`);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    num: d.getUTCDate(),
    long: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }),
  };
}

// Buffer-style week: day columns x 24 hour rows in a scrolling body that opens at the current hour
// (or the week's first post). Posts sit in their hour slot, stacked in time order. Click an empty
// slot to start a post at that time; drag a draft / scheduled post to another slot to move it.
// Phones get one day at a time with day tabs.
export default function WeekView({ posts, weekStart, composeBase, accounts = {}, loadError, singleDay }: WeekViewProps) {
  const { posts: visiblePosts, tz, error, dragOverKey, dropProps, open, openPost, closePost } = useCalendar(posts);
  const router = useRouter();
  const params = useSearchParams();
  const isPhone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const [now, setNow] = useState(() => new Date());
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const scrolledFor = useRef<string>("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const startKey = weekStart.toISOString().slice(0, 10);
  const week = singleDay ? [singleDay] : Array.from({ length: 7 }, (_, i) => addDays(startKey, i));
  const nowSlot = slotOf(now, tz);
  const todayKey = nowSlot.key;
  const activeDay = pickedDay && week.includes(pickedDay) ? pickedDay : week.includes(todayKey) ? todayKey : week[0];
  const days = isPhone || singleDay ? [activeDay] : week;
  const bySlot = groupBySlot(visiblePosts, tz);
  const dayCount = new Map<string, number>();
  let firstHour: number | null = null;
  for (const [id, list] of bySlot) {
    const [key, hour] = id.split("|");
    dayCount.set(key, (dayCount.get(key) ?? 0) + list.length);
    if (days.includes(key)) firstHour = Math.min(firstHour ?? 23, Number(hour));
  }

  // Open scrolled to now (this week) or the first post; once per week / day / zone.
  const scrollTarget = initialScrollHour(days, firstHour, nowSlot);
  const scrollKey = `${days.join(",")}|${tz}`;
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!tz || !body || scrolledFor.current === scrollKey) return;
    scrolledFor.current = scrollKey;
    const place = () => {
      const row = body.querySelector<HTMLElement>(`[data-hour="${scrollTarget}"]`);
      const head = body.querySelector<HTMLElement>("[data-head]");
      if (row) body.scrollTop = row.offsetTop - (head?.offsetHeight ?? 0);
    };
    place();
    // Again after the next frame, in case styles or fonts were still settling row heights.
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [tz, scrollKey, scrollTarget]);

  // Days and hours depend on the browser time zone, which is only known after hydration.
  if (!tz) {
    return (
      <div className={styles.calWrap} role="status" aria-busy="true">
        <span className={styles.srOnly}>Loading calendar</span>
        <CalendarGridSkeleton />
      </div>
    );
  }

  const editHref = (id: string) => {
    const next = new URLSearchParams(params.toString());
    for (const k of ["compose", "day", "at", "idea"]) next.delete(k);
    next.set("draft", id);
    return `/app/calendar?${next.toString()}`;
  };

  function newPostAt(e: MouseEvent<HTMLDivElement>, key: string, hour: number) {
    if (!composeBase) return;
    // Only clicks on the empty part of the slot; cards handle their own clicks.
    if ((e.target as HTMLElement).closest("a,button")) return;
    router.push(`${composeBase}&at=${encodeURIComponent(slotStart(key, hour, tz, now))}`, { scroll: false });
  }

  return (
    <div className={styles.calWrap}>
      {error && <p role="alert" className={styles.errorText}>{error}</p>}
      {loadError && <LoadFailed {...loadError} className={styles.mb} />}

      {isPhone && !singleDay && (
        <div className={styles.dayTabs} role="tablist" aria-label="Day">
          {week.map((key) => {
            const { weekday, num, long } = dayLabels(key);
            const n = dayCount.get(key) ?? 0;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={key === activeDay}
                aria-label={`${long}${n ? `, ${n} ${n === 1 ? "post" : "posts"}` : ""}`}
                onClick={() => setPickedDay(key)}
                className={`${styles.dayTab} ${key === todayKey ? styles.dayTabToday : ""}`}
              >
                <span>{weekday.slice(0, 2)}</span>
                <strong>{num}</strong>
                {n > 0 && <i className={styles.dayTabDot} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={bodyRef}
        className={styles.tgScroll}
        style={{ ["--tg-days" as string]: days.length }}
        role="table"
        aria-label={isPhone || singleDay ? `Posts on ${dayLabels(activeDay).long} by hour` : "Posts this week by day and hour"}
        aria-rowcount={HOURS.length + 1}
      >
        <div className={`${styles.tgRow} ${styles.tgHead}`} role="row" data-head>
          <span className={styles.tgCorner} role="columnheader"><span className={styles.srOnly}>Time</span></span>
          {days.map((key) => {
            const { weekday, num, long } = dayLabels(key);
            const isToday = key === todayKey;
            const n = dayCount.get(key) ?? 0;
            return (
              <div key={key} role="columnheader" className={`${styles.tgDay} ${isToday ? styles.tgDayToday : ""}`} aria-current={isToday ? "date" : undefined}>
                <span className={styles.tgDayName}>{weekday}</span>
                <span className={styles.tgDayNum}>{num}</span>
                {n > 0 && <span className={styles.srOnly}>, {n} {n === 1 ? "post" : "posts"}</span>}
                {composeBase && key >= todayKey && (
                  <Link href={`${composeBase}&day=${key}`} scroll={false} className={`${styles.dayAdd} ${styles.tgDayAdd}`} aria-label={`New post on ${long}`}>
                    <Plus width={14} height={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        {HOURS.map((hour) => (
          <div key={hour} className={styles.tgRow} role="row" data-hour={hour}>
            <span className={styles.tgHour} role="rowheader">{hourLabel(hour)}</span>
            {days.map((key) => {
              const id = slotId(key, hour);
              const list = bySlot.get(id) ?? [];
              const past = isSlotPast(key, hour, tz, now);
              const isNowSlot = key === todayKey && hour === nowSlot.hour;
              return (
                <div
                  key={id}
                  role="cell"
                  {...(past ? {} : dropProps(key, list, hour))}
                  onClick={past ? undefined : (e) => newPostAt(e, key, hour)}
                  className={[
                    styles.tgCell,
                    key === todayKey ? styles.tgCellToday : "",
                    past ? styles.tgCellPast : styles.tgCellOpen,
                    dragOverKey === id ? styles.cellOver : "",
                  ].filter(Boolean).join(" ")}
                >
                  {isNowSlot && <span className={styles.tgNow} style={{ top: `${(nowSlot.minute / 60) * 100}%` }} aria-hidden="true" />}
                  {list.map((post) => (
                    <WeekPostCard key={post.id} post={post} tz={tz} editHref={editHref(post.id)} onOpen={openPost} />
                  ))}
                  {!past && list.length === 0 && composeBase && (
                    <span className={styles.tgSlotAdd} aria-hidden="true"><Plus width={14} height={14} /> {hourLabel(hour)}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className={styles.calHint}>
        <span className={styles.wideOnly}>Click an empty slot to add a post at that time. Drag a draft or scheduled post to another slot to move it. </span>
        Open a post to edit it.
      </p>

      {open && <PostPopover key={open.post.id} post={open.post} anchor={open.anchor} tz={tz} accounts={accounts} onClose={closePost} />}
    </div>
  );
}
