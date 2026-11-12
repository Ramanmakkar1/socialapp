"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";
import { convertWallTime } from "../instagram-time-zone-converter/TimeZoneConverter";

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
    // Older browsers: fall back to the short list above.
  }
  return FALLBACK_ZONES;
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

type Audience = "local" | "lifestyle" | "b2b" | "ecommerce";

const AUDIENCES: { id: Audience; label: string }[] = [
  { id: "local", label: "Local business" },
  { id: "lifestyle", label: "Creators & lifestyle" },
  { id: "b2b", label: "B2B & professional" },
  { id: "ecommerce", label: "E-commerce" },
];

/**
 * Simple starting-point rules, not measured data. Times are local to the
 * audience time zone the visitor picks. Weekends get a slightly later start
 * for local and B2B audiences.
 */
const RULES: Record<Audience, { weekday: string[]; weekend: string[] }> = {
  local: { weekday: ["08:00", "12:00", "18:00"], weekend: ["09:00", "12:00", "18:00"] },
  lifestyle: { weekday: ["07:00", "12:00", "20:00"], weekend: ["08:00", "12:00", "20:00"] },
  b2b: { weekday: ["08:00", "12:00", "17:30"], weekend: ["09:00", "12:00", "17:30"] },
  ecommerce: { weekday: ["11:00", "19:00", "21:00"], weekend: ["11:00", "19:00", "21:00"] },
};

/** A fixed reference week keeps the render deterministic; dates only drive DST conversion. */
const DAYS = [
  { label: "Mon", date: "2026-01-05", weekend: false },
  { label: "Tue", date: "2026-01-06", weekend: false },
  { label: "Wed", date: "2026-01-07", weekend: false },
  { label: "Thu", date: "2026-01-08", weekend: false },
  { label: "Fri", date: "2026-01-09", weekend: false },
  { label: "Sat", date: "2026-01-10", weekend: true },
  { label: "Sun", date: "2026-01-11", weekend: true },
];

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function zoneLabel(zone: string): string {
  return zone.replace(/_/g, " ");
}

export default function BestTimeFinder() {
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zones = useSyncExternalStore(subscribeToNothing, getTimeZones, () => FALLBACK_ZONES);
  const localZone = useSyncExternalStore(subscribeToNothing, getBrowserZone, () => "UTC");
  const [zoneChoice, setZoneChoice] = useState<string | null>(null);
  const zone = zoneChoice ?? (zones.includes(localZone) ? localZone : "UTC");
  const [audience, setAudience] = useState<Audience>("local");
  const [days, setDays] = useState<boolean[]>(() => DAYS.map(() => true));
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const rule = RULES[audience];
  const selectedDays = DAYS.filter((_, i) => days[i]);

  function slotsFor(day: (typeof DAYS)[number]): string[] {
    return day.weekend ? rule.weekend : rule.weekday;
  }

  function visitorTime(date: string, hhmm: string): string | null {
    if (zone === localZone) return null;
    try {
      const result = convertWallTime(date, hhmm, zone, localZone);
      if (result.status === "ok" || result.status === "gap") return result.targetTime;
    } catch {
      // A zone the browser cannot resolve: skip the secondary line.
    }
    return null;
  }

  function planText(): string {
    const lines = [`Best time to post on Instagram - starting slots (${zoneLabel(zone)})`];
    for (const day of selectedDays) {
      lines.push(`${day.label}: ${slotsFor(day).map(formatTime).join(", ")}`);
    }
    lines.push("Starting points to test. Your own Insights beat any general rule.");
    return lines.join("\n");
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(planText());
      setCopyState("ok");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("fail");
    }
  }

  function toggleDay(index: number) {
    setDays((prev) => prev.map((value, i) => (i === index ? !value : value)));
    setCopyState("idle");
  }

  const inputClass =
    "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] outline-none ring-[var(--poskoo-violet)] focus:ring-2";

  return (
    <div className="text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-zone`} className="text-sm font-medium">
            Audience time zone
          </label>
          <select
            id={`${id}-zone`}
            value={zone}
            onChange={(e) => {
              setZoneChoice(e.target.value);
              setCopyState("idle");
            }}
            className={inputClass}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {zoneLabel(z)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-audience`} className="text-sm font-medium">
            Audience type
          </label>
          <select
            id={`${id}-audience`}
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value as Audience);
              setCopyState("idle");
            }}
            className={inputClass}
          >
            {AUDIENCES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium">Days you can post</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((day, i) => (
            <button
              key={day.label}
              type="button"
              aria-pressed={days[i]}
              onClick={() => toggleDay(i)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                days[i]
                  ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)] text-white"
                  : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] text-[var(--poskoo-ink)]"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">Starting slots in {zoneLabel(zone)}</p>
          <p className="text-xs text-[var(--poskoo-muted)]">Your time zone: {zoneLabel(localZone)}</p>
        </div>

        {selectedDays.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--poskoo-muted)]">Pick at least one day to see your starting slots.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {DAYS.map((day, i) => {
              const active = days[i];
              const slots = slotsFor(day);
              return (
                <div
                  key={day.label}
                  className={`rounded-2xl border p-3 ${
                    active
                      ? "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]"
                      : "border-dashed border-[var(--poskoo-line)] opacity-60"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">{day.label}</p>
                  {active ? (
                    <ul className="mt-2 space-y-1.5">
                      {slots.map((slot) => {
                        const other = visitorTime(day.date, slot);
                        return (
                          <li key={slot} className="rounded-lg bg-[var(--poskoo-band)] px-2 py-1.5">
                            <span className="block text-sm font-semibold text-[var(--poskoo-ink)]">{formatTime(slot)}</span>
                            {other ? (
                              <span className="block text-[11px] text-[var(--poskoo-muted)]">{other} your time</span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Rest day</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyPlan}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--poskoo-violet)] px-4 text-sm font-medium text-white"
          >
            {copyState === "ok" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copyState === "ok" ? "Copied" : "Copy plan"}
          </button>
          <p aria-live="polite" className="text-xs text-[#3d3450]">
            {copyState === "ok" ? "Your posting plan was copied to the clipboard." : null}
            {copyState === "fail"
              ? "Your browser blocked copying. Select the plan above and press Ctrl+C (⌘C on Mac)."
              : null}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--poskoo-muted)]">
        Starting points to test. Your own Insights beat any general rule.
      </p>
    </div>
  );
}
