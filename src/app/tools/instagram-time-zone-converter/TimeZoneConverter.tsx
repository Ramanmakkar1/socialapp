"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";

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

  const inputClass =
    "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] outline-none ring-[var(--poskoo-violet)] focus:ring-2";

  return (
    <div className="text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-date`} className="text-sm font-medium">
            Date
          </label>
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
        <div>
          <label htmlFor={`${id}-time`} className="text-sm font-medium">
            Time
          </label>
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
        <div>
          <label htmlFor={`${id}-source`} className="text-sm font-medium">
            From time zone
          </label>
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
        <div>
          <label htmlFor={`${id}-target`} className="text-sm font-medium">
            To time zone
          </label>
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

      <div className="mt-5 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4" aria-live="polite">
        {result.status === "empty" ? (
          <p className="text-sm text-[var(--poskoo-muted)]">Pick a date and time to see the converted local time.</p>
        ) : result.status === "invalid" ? (
          <p className="text-sm text-[var(--poskoo-coral)]" role="alert">
            {result.message}
          </p>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--poskoo-muted)]">
              Instagram post time in {zoneLabel(targetZone)}
            </p>
            <p className="mt-1 text-3xl font-bold leading-tight text-[var(--poskoo-ink)] sm:text-4xl">
              {result.targetTime}
            </p>
            <p className="mt-1 text-sm text-[#3d3450]">{result.targetDate}</p>
            {result.status === "gap" ? (
              <p className="mt-3 rounded-xl bg-[var(--poskoo-band)] px-3 py-2 text-sm text-[#3d3450]" role="status">
                The result uses the offset from before the jump, so it shows one hour earlier (for example 1:30 AM for 2:30 AM); pick a time after the jump for an exact answer.
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyResult}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--poskoo-violet)] px-4 text-sm font-medium text-white"
              >
                {copyState === "ok" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copyState === "ok" ? "Copied" : "Copy result"}
              </button>
              <p aria-live="polite" className="text-xs text-[#3d3450]">
                {copyState === "ok" ? "Converted time copied to your clipboard." : null}
                {copyState === "fail"
                  ? "Your browser blocked copying. Select the result above and press Ctrl+C (⌘C on Mac)."
                  : null}
              </p>
            </div>
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--poskoo-muted)]">
        Uses your browser’s time zone data, so daylight saving changes are included. Nothing is uploaded or saved.
      </p>
    </div>
  );
}
