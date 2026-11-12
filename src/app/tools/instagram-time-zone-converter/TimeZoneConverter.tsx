"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDownUp, CalendarDays, Check, Clock, Copy, Globe2, MoveRight } from "lucide-react";

const FALLBACK_ZONES = [
  "UTC",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Anchorage",
  "America/Argentina/Buenos_Aires",
  "America/Bogota",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Phoenix",
  "America/Sao_Paulo",
  "America/Toronto",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Jakarta",
  "Asia/Jerusalem",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Manila",
  "Asia/Riyadh",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Dublin",
  "Europe/Istanbul",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Zurich",
  "Pacific/Auckland",
];

function listTimeZones(): string[] {
  try {
    const supported = (
      Intl as typeof Intl & { supportedValuesOf?: (key: "timeZone") => string[] }
    ).supportedValuesOf?.("timeZone");
    if (supported && supported.length > 0) return supported;
  } catch {
    // Older browsers: fall back to the short list below.
  }
  return FALLBACK_ZONES;
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Wall-clock fields for an instant in a specific IANA time zone (no fixed offset). */
function zonedParts(instant: number, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const out: ZonedParts = { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 };
  for (const part of parts) {
    const value = Number(part.value);
    if (part.type === "year") out.year = value;
    else if (part.type === "month") out.month = value;
    else if (part.type === "day") out.day = value;
    else if (part.type === "hour") out.hour = value;
    else if (part.type === "minute") out.minute = value;
    else if (part.type === "second") out.second = value;
  }
  return out;
}

/** Offset of a time zone at a given instant, in milliseconds. */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const p = zonedParts(instant, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - instant;
}

type Result =
  | { status: "empty" }
  | { status: "invalid"; message: string }
  | {
      status: "ok" | "gap";
      instant: number;
      targetTime: string;
      targetDate: string;
      copyText: string;
    };

export function convertWallTime(
  dateValue: string,
  timeValue: string,
  sourceZone: string,
  targetZone: string,
): Result {
  if (!dateValue || !timeValue) return { status: "empty" };

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})/.exec(timeValue);
  if (!dateMatch || !timeMatch) {
    return { status: "invalid", message: "Enter a valid date and time to convert." };
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const check = new Date(guess);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    return { status: "invalid", message: "That date or time doesn’t exist. Check the day and time and try again." };
  }

  // Resolve the wall time to an instant without assuming a fixed UTC offset.
  // A second pass picks up the offset on the other side of a DST change.
  const firstOffset = zoneOffsetMs(guess, sourceZone);
  const firstInstant = guess - firstOffset;
  const secondOffset = zoneOffsetMs(firstInstant, sourceZone);
  const instant = guess - secondOffset;

  const actual = zonedParts(instant, sourceZone);
  const actualWall = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
  // spring-forward gap: this wall time never happens, so the round trip lands on a different clock time
  const status: "ok" | "gap" = actualWall === guess ? "ok" : "gap";

  const targetTime = new Intl.DateTimeFormat("en-US", {
    timeZone: targetZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    hourCycle: "h12",
  }).format(new Date(instant));

  const targetDate = new Intl.DateTimeFormat("en-US", {
    timeZone: targetZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(instant));

  return {
    status,
    instant,
    targetTime,
    targetDate,
    copyText: `${targetTime} on ${targetDate} (${targetZone.replace(/_/g, " ")})`,
  };
}

function zoneLabel(zone: string): string {
  return zone.replace(/_/g, " ");
}

const subscribeToNothing = () => () => {};

let cachedZones: string[] | null = null;

function getTimeZones(): string[] {
  if (!cachedZones) cachedZones = listTimeZones();
  return cachedZones;
}

function getBrowserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatOffset(ms: number): string {
  const sign = ms < 0 ? "−" : "+";
  const mins = Math.round(Math.abs(ms) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${sign}${h}h${m ? ` ${m}m` : ""}`;
}

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function TimeZoneConverter() {
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zones = useSyncExternalStore(subscribeToNothing, getTimeZones, () => FALLBACK_ZONES);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const localZone = useSyncExternalStore(subscribeToNothing, getBrowserZone, () => "UTC");
  const [sourceChoice, setSourceChoice] = useState<string | null>(null);
  const [targetChoice, setTargetChoice] = useState<string | null>(null);
  const sourceZone = sourceChoice ?? (zones.includes(localZone) ? localZone : "UTC");
  const targetZone = targetChoice ?? (sourceZone === "Europe/London" ? "America/New_York" : "Europe/London");
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  let result: Result;
  try {
    result = convertWallTime(date, time, sourceZone, targetZone);
  } catch {
    result = { status: "invalid", message: "That time zone isn’t available in this browser. Pick another one." };
  }

  // At-a-glance facts, all from the same instant the converter resolved.
  let glance: { diff: string; dayShift: string; sourceTime: string } | null = null;
  if (result.status === "ok" || result.status === "gap") {
    try {
      const diffMs = zoneOffsetMs(result.instant, targetZone) - zoneOffsetMs(result.instant, sourceZone);
      const s = zonedParts(result.instant, sourceZone);
      const t = zonedParts(result.instant, targetZone);
      const days = Math.round((Date.UTC(t.year, t.month - 1, t.day) - Date.UTC(s.year, s.month - 1, s.day)) / 86400000);
      glance = {
        diff: diffMs === 0 ? "Same time" : formatOffset(diffMs),
        dayShift: days === 0 ? "Same day" : days > 0 ? "Next day" : "Previous day",
        sourceTime: new Intl.DateTimeFormat("en-US", { timeZone: sourceZone, hour: "numeric", minute: "2-digit", hourCycle: "h12", timeZoneName: "short" }).format(new Date(result.instant)),
      };
    } catch {
      glance = null;
    }
  }

  async function copyResult() {
    if (result.status !== "ok" && result.status !== "gap") return;
    try {
      await navigator.clipboard.writeText(result.copyText);
      setCopyState("ok");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("fail");
    }
  }

  function fillNow() {
    const p = zonedParts(Date.now(), sourceZone);
    const pad = (n: number) => String(n).padStart(2, "0");
    setDate(`${p.year}-${pad(p.month)}-${pad(p.day)}`);
    setTime(`${pad(p.hour)}:${pad(p.minute)}`);
    setCopyState("idle");
  }

  function swap() {
    setSourceChoice(targetZone);
    setTargetChoice(sourceZone);
    setCopyState("idle");
  }

  const inputClass =
    "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";
  const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)]";

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Inputs */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor={`${id}-date`} className="text-sm font-semibold">Date</label>
              <input
                id={`${id}-date`}
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setCopyState("idle");
                }}
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label htmlFor={`${id}-time`} className="text-sm font-semibold">Time</label>
              <input
                id={`${id}-time`}
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setCopyState("idle");
                }}
                className={inputClass}
              />
            </div>
          </div>
          <button type="button" className={ghostBtn} onClick={fillNow}>
            <Clock className="h-4 w-4" aria-hidden="true" />Use current time
          </button>

          <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <div className="min-w-0">
              <label htmlFor={`${id}-source`} className="text-sm font-semibold">From time zone</label>
              <select
                id={`${id}-source`}
                value={sourceZone}
                onChange={(e) => {
                  setSourceChoice(e.target.value);
                  setCopyState("idle");
                }}
                className={inputClass}
              >
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zoneLabel(zone)}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={swap} aria-label="Swap time zones" title="Swap time zones"
              className="inline-grid h-11 w-11 place-items-center justify-self-center rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-ink)]">
              <ArrowDownUp className="h-4 w-4 sm:rotate-90" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <label htmlFor={`${id}-target`} className="text-sm font-semibold">To time zone</label>
              <select
                id={`${id}-target`}
                value={targetZone}
                onChange={(e) => {
                  setTargetChoice(e.target.value);
                  setCopyState("idle");
                }}
                className={inputClass}
              >
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zoneLabel(zone)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-[#5f5873]">
            Uses your browser’s time zone data, so daylight saving changes are included. Nothing is uploaded or saved.
          </p>
        </div>

        {/* Result */}
        <aside aria-label="Converted time" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24" aria-live="polite">
          {result.status === "empty" ? (
            <div className="grid place-items-center gap-2 py-8 text-center">
              <Globe2 className="h-9 w-9 text-[var(--poskoo-violet)]" aria-hidden="true" />
              <p className="text-sm text-[#3d3450]">Pick a date and time to see the converted local time.</p>
            </div>
          ) : result.status === "invalid" ? (
            <p className="rounded-xl border border-[var(--poskoo-coral)]/50 bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#8a2f12]" role="alert">
              {result.message}
            </p>
          ) : (
            <>
              <div className="rounded-xl bg-[var(--poskoo-ink)] p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  Instagram post time in {zoneLabel(targetZone)}
                </p>
                <p className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">{result.targetTime}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80"><CalendarDays className="h-4 w-4 flex-none text-[var(--poskoo-lime)]" aria-hidden="true" />{result.targetDate}</p>
              </div>
              {glance && (
                <>
                  <p className="flex min-w-0 items-center gap-1.5 text-xs text-[#3d3450]">
                    <MoveRight className="h-3.5 w-3.5 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
                    <span className="min-w-0">From <b className="text-[var(--poskoo-ink)]">{glance.sourceTime}</b> in {zoneLabel(sourceZone)}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={kpi}><p className={kpiLabel}>Difference</p><p className="mt-0.5 text-lg font-bold tabular-nums">{glance.diff}</p></div>
                    <div className={kpi}><p className={kpiLabel}>Calendar day</p><p className="mt-0.5 text-lg font-bold">{glance.dayShift}</p></div>
                  </div>
                </>
              )}
              {result.status === "gap" ? (
                <p className="rounded-xl bg-[var(--poskoo-band)] px-3 py-2 text-sm text-[#3d3450]" role="status">
                  The result uses the offset from before the jump, so it shows one hour earlier (for example 1:30 AM for 2:30 AM); pick a time after the jump for an exact answer.
                </p>
              ) : null}
              <button
                type="button"
                onClick={copyResult}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px"
              >
                {copyState === "ok" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
                {copyState === "ok" ? "Copied" : "Copy result"}
              </button>
              <p aria-live="polite" className="text-xs text-[#3d3450] empty:hidden">
                {copyState === "ok" ? "Converted time copied to your clipboard." : null}
                {copyState === "fail"
                  ? "Your browser blocked copying. Select the result above and press Ctrl+C (⌘C on Mac)."
                  : null}
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
