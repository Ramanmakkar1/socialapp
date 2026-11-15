"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { Briefcase, CalendarDays, CalendarX, Check, Clock, Copy, Globe2, Info, ListChecks, Moon, ShoppingBag, Sparkles, Store, Sunrise, type LucideIcon } from "lucide-react";
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

type Audience = "creator" | "b2b" | "local" | "ecommerce";

const AUDIENCES: { id: Audience; label: string }[] = [
  { id: "creator", label: "Creators & personal brands" },
  { id: "b2b", label: "B2B & SaaS" },
  { id: "local", label: "Local businesses" },
  { id: "ecommerce", label: "Ecommerce & retail" },
];

const AUDIENCE_ICON: Record<Audience, LucideIcon> = { creator: Sparkles, b2b: Briefcase, local: Store, ecommerce: ShoppingBag };

const field = "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)]";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

/**
 * Simple starting-point rules for Bluesky, not measured data. Times are local
 * to the audience time zone the visitor picks. The audience is mostly US/EU
 * tech, journalism and creators, so weekdays cover a morning (8-10 am), lunch
 * (12-1 pm) and evening (7-9 pm) window; weekends start later and are lighter.
 * B2B drops weekends and adds a Tuesday-Thursday 10 am slot, creators add a
 * 9 pm weekday slot, and local businesses add a Saturday late-morning slot.
 */
const RULES: Record<Audience, { weekday: string[]; weekend: string[]; tueThu?: string[]; saturday?: string[] }> = {
  creator: { weekday: ["08:00", "09:00", "12:30", "19:00", "20:00"], weekend: ["10:00"] },
  b2b: { weekday: ["08:00", "09:00", "12:30", "19:00"], weekend: [], tueThu: ["10:00"] },
  local: { weekday: ["08:00", "12:30", "19:00"], weekend: ["10:00"], saturday: ["11:00"] },
  ecommerce: { weekday: ["08:00", "12:30", "19:00", "20:00"], weekend: ["10:00"] },
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

export default function BestTimeFinder({ platform = "Bluesky", insightsName = "Bluesky analytics" }: { platform?: string; insightsName?: string } = {}) {
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zones = useSyncExternalStore(subscribeToNothing, getTimeZones, () => FALLBACK_ZONES);
  const localZone = useSyncExternalStore(subscribeToNothing, getBrowserZone, () => "UTC");
  const [zoneChoice, setZoneChoice] = useState<string | null>(null);
  const zone = zoneChoice ?? (zones.includes(localZone) ? localZone : "UTC");
  const [audience, setAudience] = useState<Audience>("creator");
  const [days, setDays] = useState<boolean[]>(() => DAYS.map(() => true));
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const rule = RULES[audience];
  const selectedDays = DAYS.filter((_, i) => days[i]);

  function slotsFor(day: (typeof DAYS)[number]): string[] {
    const base = day.weekend ? rule.weekend : rule.weekday;
    const extra = day.label === "Sat" ? rule.saturday : day.label === "Tue" || day.label === "Wed" || day.label === "Thu" ? rule.tueThu : undefined;
    // Deduplicate so a slot shared by the weekend and Saturday rules shows once.
    return [...new Set([...base, ...(extra ?? [])])].sort((a, b) => {
      const [ah, am] = a.split(":").map(Number);
      const [bh, bm] = b.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
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
    const lines = [`Best time to post on ${platform} - starting slots (${zoneLabel(zone)})`];
    for (const day of selectedDays) {
      lines.push(`${day.label}: ${slotsFor(day).map(formatTime).join(", ")}`);
    }
    lines.push(`Starting points to test. Your own ${insightsName} beat any general rule.`);
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


  function setAllDays(pick: (day: (typeof DAYS)[number]) => boolean) {
    setDays(DAYS.map(pick));
    setCopyState("idle");
  }

  const minutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const weekSlots = selectedDays.flatMap((day) => slotsFor(day));
  const sortedSlots = [...weekSlots].sort((a, b) => minutes(a) - minutes(b));
  const earliest = sortedSlots[0];
  const latest = sortedSlots[sortedSlots.length - 1];
  const AudienceIcon = AUDIENCE_ICON[audience];
  const plan = planText();

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr]">
        <div className="min-w-0">
          <label htmlFor={`${id}-zone`} className="text-sm font-semibold">
            Audience time zone
          </label>
          <div className="relative mt-2">
            <Globe2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
            <select
              id={`${id}-zone`}
              value={zone}
              onChange={(e) => {
                setZoneChoice(e.target.value);
                setCopyState("idle");
              }}
              className={`${field} pl-10`}
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {zoneLabel(z)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-audience`} className="text-sm font-semibold">
            Audience type
          </label>
          <div className="relative mt-2">
            <AudienceIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
            <select
              id={`${id}-audience`}
              value={audience}
              onChange={(e) => {
                setAudience(e.target.value as Audience);
                setCopyState("idle");
              }}
              className={`${field} pl-10`}
            >
              {AUDIENCES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="min-w-0 md:col-span-2 xl:col-span-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3">
            <p className="text-sm font-semibold" id={`${id}-days`}>Days you can post</p>
            <div className="-my-2.5 flex gap-1 text-xs">
              <button type="button" onClick={() => setAllDays(() => true)} className="min-h-11 rounded-lg px-2 font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]">Every day</button>
              <button type="button" onClick={() => setAllDays((d) => !d.weekend)} className="min-h-11 rounded-lg px-2 font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]">Weekdays</button>
            </div>
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1" role="group" aria-labelledby={`${id}-days`}>
            {DAYS.map((day, i) => (
              <button
                key={day.label}
                type="button"
                aria-pressed={days[i]}
                onClick={() => toggleDay(i)}
                className={`min-h-11 min-w-0 rounded-lg text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--poskoo-violet)] ${
                  days[i]
                    ? "bg-[var(--poskoo-ink)] text-white"
                    : "text-[#5f5873] hover:bg-[var(--poskoo-band)]"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><CalendarDays className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Posting days</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{selectedDays.length}<span className="text-base font-medium text-[#5f5873]"> / 7</span></p>
          <div className="mt-2 flex gap-0.5" aria-hidden="true">
            {DAYS.map((d, i) => <i key={d.label} className="h-2 flex-1 rounded-full" style={{ background: days[i] ? "var(--poskoo-violet)" : "var(--poskoo-line)" }} />)}
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><ListChecks className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Slots per week</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{weekSlots.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Pick one or two a day to test.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Sunrise className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Earliest slot</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{earliest ? formatTime(earliest) : "—"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Audience local time.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Moon className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Latest slot</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{latest ? formatTime(latest) : "—"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Audience local time.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Results */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold"><Clock className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />Starting slots in {zoneLabel(zone)}</h3>
            <p className="text-xs text-[var(--poskoo-muted)]">Your time zone: {zoneLabel(localZone)}</p>
          </div>

          {selectedDays.length === 0 ? (
            <div className="mt-3 grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-10 text-center text-sm text-[var(--poskoo-muted)]">
              <CalendarX className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
              <p>Pick at least one day to see your starting slots.</p>
              <button type="button" onClick={() => setAllDays(() => true)} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium text-[var(--poskoo-ink)] hover:border-[var(--poskoo-ink)]">Select every day</button>
            </div>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-7">
                {DAYS.map((day, i) => {
                  const active = days[i];
                  const slots = slotsFor(day);
                  return (
                    <div
                      key={day.label}
                      className={`min-w-0 rounded-2xl border p-2.5 ${
                        active
                          ? "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]"
                          : "border-dashed border-[var(--poskoo-line)] opacity-60"
                      }`}
                    >
                      <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                        {day.label}
                        {day.weekend ? <span className="rounded bg-[var(--poskoo-peach)]/50 px-1 text-[10px] normal-case tracking-normal text-[#7a3d0c]">Weekend</span> : null}
                      </p>
                      {active ? (
                        <ul className="mt-2 space-y-1.5">
                          {slots.map((slot) => {
                            const other = visitorTime(day.date, slot);
                            return (
                              <li key={slot} className="rounded-lg bg-[var(--poskoo-band)] px-2 py-1.5" style={{ boxShadow: "inset 3px 0 0 var(--poskoo-violet)" }}>
                                <span className="block whitespace-nowrap text-sm font-semibold tabular-nums text-[var(--poskoo-ink)]">{formatTime(slot)}</span>
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

              {/* 24-hour view */}
              <figure className="mx-0 mb-0 mt-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
                <figcaption className="text-sm font-semibold">24-hour view</figcaption>
                <div className="mt-2 space-y-1.5" aria-hidden="true">
                  {DAYS.map((day, i) => (
                    <div key={day.label} className="flex items-center gap-2">
                      <span className="w-8 flex-none text-[11px] font-semibold uppercase text-[#5f5873]">{day.label}</span>
                      <div className="relative h-5 flex-1 rounded-full bg-[var(--poskoo-card)] ring-1 ring-[var(--poskoo-line)]">
                        {[6, 12, 18].map((h) => <i key={h} className="absolute inset-y-0 w-px bg-[var(--poskoo-line)]" style={{ left: `${(h / 24) * 100}%` }} />)}
                        {days[i] && slotsFor(day).map((slot) => (
                          <i key={slot} title={formatTime(slot)} className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--poskoo-violet)] shadow" style={{ left: `${(minutes(slot) / 1440) * 100}%` }} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 text-[10px] tabular-nums text-[#5f5873]">
                    <span className="w-8 flex-none" />
                    <span className="relative h-3 flex-1">
                      {["12 AM", "6 AM", "12 PM", "6 PM", "12 AM"].map((t, k) => (
                        <span key={k} className={`absolute whitespace-nowrap ${k === 0 ? "" : k === 4 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `${k * 25}%` }}>{t}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </figure>
            </>
          )}
        </div>

        {/* Primary action + plan preview */}
        <aside aria-labelledby={`${id}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={copyPlan}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copyState === "ok" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copyState === "ok" ? "Copied" : "Copy plan"}
          </button>
          <div>
            <h4 id={`${id}-prev`} className="flex items-center justify-between text-sm font-semibold">
              Plan preview
              <span className="text-xs font-medium tabular-nums text-[#5f5873]">{selectedDays.length} days · {weekSlots.length} slots</span>
            </h4>
            <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 font-sans text-[13px] leading-relaxed text-[#3d3450]">{plan}</pre>
          </div>
          <p aria-live="polite" className="text-xs text-[#3d3450] empty:hidden">
            {copyState === "ok" ? "Your posting plan was copied to the clipboard." : null}
            {copyState === "fail"
              ? "Your browser blocked copying. Select the plan above and press Ctrl+C (⌘C on Mac)."
              : null}
          </p>
          <p className="flex items-start gap-1.5 text-xs text-[var(--poskoo-muted)]">
            <Info className="mt-px h-3.5 w-3.5 flex-none" aria-hidden="true" />
            Starting points to test. Your own {insightsName} beat any general rule.
          </p>
        </aside>
      </div>
    </div>
  );
}
