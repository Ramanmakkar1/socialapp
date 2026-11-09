"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

type FormatKey = "reels" | "carousel" | "feed" | "story";

type Format = { key: FormatKey; label: string; minutes: number; hint: string };

// Rough planning estimates for one finished piece, including caption.
const FORMATS: Format[] = [
  { key: "reels", label: "Reels", minutes: 45, hint: "script, film, edit" },
  { key: "carousel", label: "Carousels", minutes: 30, hint: "design slides + caption" },
  { key: "feed", label: "Feed posts", minutes: 20, hint: "photo + caption" },
  { key: "story", label: "Stories", minutes: 10, hint: "quick frames" },
];

const HOURS_MIN = 1;
const HOURS_MAX = 12;

export default function FrequencyCalculator() {
  const uid = useId();
  const [hours, setHours] = useState(4);
  const [selected, setSelected] = useState<Record<FormatKey, boolean>>({
    reels: true,
    carousel: false,
    feed: true,
    story: false,
  });

  const active = FORMATS.filter((f) => selected[f.key]);

  const result = useMemo(() => {
    if (active.length === 0) return null;
    const totalMinutes = hours * 60;
    const slowest = Math.max(...active.map((f) => f.minutes));
    const fastest = Math.min(...active.map((f) => f.minutes));
    const minPosts = Math.floor(totalMinutes / slowest);
    const maxPosts = Math.floor(totalMinutes / fastest);
    // Sample plan: split the weekly budget evenly across the chosen formats.
    const share = totalMinutes / active.length;
    const sample = active.map((f) => ({ ...f, posts: Math.floor(share / f.minutes) }));
    const sampleTotal = sample.reduce((sum, f) => sum + f.posts, 0);
    return { minPosts, maxPosts, sample, sampleTotal };
  }, [active, hours]);

  function toggle(key: FormatKey) {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="text-left">
      <div>
        <label htmlFor={`${uid}-hours`} className="text-sm font-medium">
          Weekly time budget: <strong className="tabular-nums">{hours} h</strong> per week
        </label>
        <input
          id={`${uid}-hours`}
          type="range"
          min={HOURS_MIN}
          max={HOURS_MAX}
          step={1}
          value={hours}
          aria-valuetext={`${hours} hours per week`}
          onChange={(e) => setHours(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--poskoo-violet)]"
        />
        <div className="flex justify-between text-xs text-[var(--poskoo-muted)]">
          <span>{HOURS_MIN} h</span>
          <span>{HOURS_MAX} h</span>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Content formats you make</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FORMATS.map((f) => (
            <label
              key={f.key}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                selected[f.key]
                  ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]"
                  : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] hover:border-[var(--poskoo-violet)]"
              }`}
            >
              <input
                type="checkbox"
                checked={selected[f.key]}
                onChange={() => toggle(f.key)}
                className="h-4 w-4 accent-[var(--poskoo-violet)]"
              />
              <span>
                <span className="font-medium">{f.label}</span>
                <span className="block text-xs text-[var(--poskoo-muted)]">
                  ~{f.minutes} min each · {f.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div
        className="mt-8 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-6 text-center"
        aria-live="polite"
      >
        {result === null ? (
          <>
            <p className="text-sm text-[#3d3450]">Your weekly posting range</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Pick at least one content format
            </p>
            <p className="mt-3 text-sm text-[var(--poskoo-muted)]">
              The range appears here as soon as you choose a format above.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[#3d3450]">A realistic weekly posting range for {hours} h</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
              {result.minPosts === result.maxPosts
                ? `${result.minPosts} posts`
                : `${result.minPosts}–${result.maxPosts} posts`}
              <span className="text-lg font-medium text-[var(--poskoo-muted)]"> / week</span>
            </p>
            <p className="mt-3 text-sm text-[var(--poskoo-muted)]">
              {result.minPosts} if you spend the week on your slowest format, up to {result.maxPosts} on your
              fastest. An estimate from your time budget — not a growth guarantee.
            </p>
            <div className="mt-5 border-t border-[var(--poskoo-line)] pt-4">
              <p className="text-sm font-medium">Sample week ({result.sampleTotal} posts)</p>
              <ul className="mt-2 flex flex-wrap justify-center gap-2">
                {result.sample.map((f) => (
                  <li
                    key={f.key}
                    className="rounded-full bg-[var(--poskoo-band)] px-3 py-1.5 text-sm tabular-nums"
                  >
                    {f.posts} {f.label.toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        Put the plan on a calendar:{" "}
        <Link href="/instagram-scheduler" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
          Instagram scheduler
        </Link>{" "}
        · or draft each post first with the{" "}
        <Link href="/instagram-content-planner" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
          content planner
        </Link>
        .
      </p>
    </div>
  );
}
