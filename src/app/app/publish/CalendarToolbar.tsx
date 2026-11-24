"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarOff, ChevronDown, ChevronLeft, ChevronRight, Globe, Layers } from "lucide-react";
import { PLATFORM_ICON, PLATFORM_LABEL } from "./calendarUtils";
import { parseChannels, toggleChannel } from "./weekGrid";
import styles from "./calendar.module.css";

/** A draft with no date: listed under "No date" and opened in the composer. */
export type NoDatePost = { id: string; caption: string; platforms: string[] };

type Props = {
  view: "day" | "week" | "month";
  label: string;
  subLabel?: string;
  prevHref: string;
  nextHref: string;
  todayHref: string;
  isCurrent: boolean;
  /** Platforms the user can filter by. */
  channels: string[];
  tags: string[];
  /** Drafts without a time (hidden from the grid). */
  noDate?: NoDatePost[];
  /** Time zone of the user's posting schedule (Settings), offered next to the browser zone. */
  scheduleTz?: string;
};

// Calendar toolbar (Buffer-style): ‹ › range, Today, Week/Month, then Channels / status / tag filters
// No date drafts and the time zone. Filters live in the URL (?channel=a,b&status=&tag=&tz=) so the
// server filters the posts and a reload or shared link keeps them.
export default function CalendarToolbar({ view, label, subLabel, prevHref, nextHref, todayHref, isCurrent, channels, tags, noDate = [], scheduleTz }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/app/publish";
  const params = useSearchParams();
  const id = useId();
  const [tz, setTz] = useState("");
  const [zones, setZones] = useState<string[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser time zone is only known after hydration
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setZones(typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : []);
  }, []);
  // Close an open dropdown (Channels, No date) on a click outside it or Escape.
  useEffect(() => {
    const closeOthers = (target: EventTarget | null) => {
      barRef.current?.querySelectorAll("details[open]").forEach((d) => {
        if (!(target instanceof Node) || !d.contains(target)) d.removeAttribute("open");
      });
    };
    const onDown = (e: PointerEvent) => closeOthers(e.target);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeOthers(null); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  const selectedChannels = parseChannels(params.get("channel"));
  const tzParam = params.get("tz") ?? "";
  const zoneOptions = [...new Set([scheduleTz, tzParam, "UTC", ...zones].filter((z): z is string => Boolean(z) && z !== tz))];

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
    for (const k of ["channel", "status", "tag", "tz"]) {
      const val = params.get(k);
      if (val) next.set(k, val);
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const unit = view;

  return (
    <div className={styles.toolbar} ref={barRef}>
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
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
          <ChevronDown width={14} height={14} aria-hidden="true" />
        </span>
      </div>
      <div className={styles.toolbarFilters}>
        {channels.length > 1 && (
          <details className={styles.dropdown}>
            <summary className={styles.toolSelect} aria-label={`Channels: ${selectedChannels.length ? selectedChannels.map((c) => PLATFORM_LABEL[c] ?? c).join(", ") : "all"}`}>
              <Layers width={14} height={14} aria-hidden="true" />
              Channels
              {selectedChannels.length > 0 && <span className={styles.dropdownCount}>{selectedChannels.length}</span>}
              <ChevronDown width={14} height={14} aria-hidden="true" />
            </summary>
            <div className={styles.dropdownPanel} role="group" aria-label="Show channels">
              {channels.map((c) => {
                const Icon = PLATFORM_ICON[c] ?? PLATFORM_ICON.threads;
                return (
                  <label key={c} className={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(c)}
                      onChange={() => setParam("channel", toggleChannel(selectedChannels, c).join(","))}
                    />
                    <Icon width={15} height={15} className={styles[`ico_${c}`]} aria-hidden="true" />
                    {PLATFORM_LABEL[c] ?? c}
                  </label>
                );
              })}
              {selectedChannels.length > 0 && (
                <button type="button" className={styles.dropdownClear} onClick={() => setParam("channel", "")}>Show all channels</button>
              )}
            </div>
          </details>
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
        {view === "week" && (
          <details className={styles.dropdown}>
            <summary className={styles.toolSelect} aria-label={`No date: ${noDate.length} ${noDate.length === 1 ? "draft" : "drafts"} without a time`}>
              <CalendarOff width={14} height={14} aria-hidden="true" />
              No date
              <span className={styles.dropdownCount}>{noDate.length}</span>
            </summary>
            <div className={styles.dropdownPanel}>
              {noDate.length === 0 ? (
                <p className={styles.dropdownEmpty}>Every post has a date.</p>
              ) : (
                noDate.map((p) => {
                  const Icon = PLATFORM_ICON[p.platforms[0]] ?? PLATFORM_ICON.threads;
                  return (
                    <Link key={p.id} href={`/app/publish?view=week&draft=${p.id}`} scroll={false} className={styles.dropdownItem}>
                      <Icon width={14} height={14} className={styles[`ico_${p.platforms[0]}`]} aria-hidden="true" />
                      <span className={styles.noDateCaption}>{p.caption.trim() || "(no caption)"}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </details>
        )}
        <span className={styles.selectWrap}>
          <label htmlFor={`${id}-tz`} className={styles.srOnly}>Time zone</label>
          <Globe width={14} height={14} aria-hidden="true" className={styles.selectIconLeft} />
          <select id={`${id}-tz`} value={tzParam && tzParam !== tz ? tzParam : ""} onChange={(e) => setParam("tz", e.target.value)} className={`${styles.toolSelect} ${styles.tzSelect}`}>
            <option value="" suppressHydrationWarning>{tz ? `${tz.replace(/_/g, " ")} (yours)` : "Your time zone"}</option>
            {zoneOptions.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}{z === scheduleTz ? " (posting schedule)" : ""}</option>)}
          </select>
          <ChevronDown width={14} height={14} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
