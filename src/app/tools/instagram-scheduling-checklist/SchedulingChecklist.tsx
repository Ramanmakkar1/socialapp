"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Copy, RotateCcw } from "lucide-react";

type Item = {
  id: string;
  title: string;
  detail: string;
  links?: { href: string; label: string }[];
};

const ITEMS: Item[] = [
  {
    id: "caption",
    title: "Caption",
    detail:
      "Write a caption for every channel you selected and stay inside its limits — Instagram 2,200 characters and 30 hashtags, Threads 500 characters; Facebook Pages publish no limit, so keep it readable. Keep your hook in the first line, before Instagram’s “more” cutoff.",
    links: [{ href: "/tools/instagram-caption-counter", label: "Caption counter" }],
  },
  {
    id: "media",
    title: "Media format",
    detail:
      "Paste public https links to .jpg, .png or .mp4 files. One image posts as a feed post, one .mp4 as a Reel (9:16, 1080×1920 recommended), 2–10 images as a carousel, one image or video as a Story. Carousels are images only.",
    links: [
      { href: "/tools/instagram-image-size", label: "Image size guide" },
      { href: "/tools/instagram-safe-zone-checker", label: "Safe zone checker" },
    ],
  },
  {
    id: "channel",
    title: "Channel selection",
    detail:
      "Select at least one channel in the composer — Instagram, a Facebook Page or Threads — and connect it in Settings through Meta’s official login. Instagram needs a professional (Business or Creator) account.",
    links: [{ href: "/help/getting-started", label: "Getting started" }],
  },
  {
    id: "time",
    title: "Scheduled time & timezone",
    detail:
      "Pick a date and time in your own time zone — the composer shows your time zone under the field — at least one minute in the future. The post publishes at that local time.",
  },
  {
    id: "account",
    title: "Confirm the connected account",
    detail:
      "Check that the account still shows as connected in Settings. If a post fails with an access-expired error, reconnect through Meta’s official login, then retry the post.",
    links: [{ href: "/app/settings", label: "Settings" }],
  },
  {
    id: "status",
    title: "Review publishing status",
    detail:
      "After the scheduled time, open the Calendar and check the post’s status: published when it goes live, or failed with the error message and a Retry option if something went wrong.",
    links: [{ href: "/help/schedule-instagram-reels", label: "Reels scheduling guide" }],
  },
];

export default function SchedulingChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doneCount = ITEMS.filter((i) => done[i.id]).length;
  const allDone = doneCount === ITEMS.length;
  const nextItem = ITEMS.find((i) => !done[i.id]);
  const pctDone = Math.round((doneCount / ITEMS.length) * 100);

  function toggle(id: string) {
    setDone((d) => ({ ...d, [id]: !d[id] }));
  }

  async function copyChecklist() {
    const text = [
      "Instagram scheduling preflight checklist",
      ...ITEMS.map((i) => `${done[i.id] ? "[x]" : "[ ]"} ${i.title} — ${i.detail}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      if (timer.current) clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <ol className="min-w-0 space-y-2" aria-label="Scheduling preflight checklist">
          {ITEMS.map((item, n) => {
            const checked = !!done[item.id];
            const inputId = `checklist-${item.id}`;
            return (
              <li
                key={item.id}
                className={`relative rounded-2xl border transition-colors ${
                  checked ? "border-[var(--poskoo-green)]/50 bg-[var(--poskoo-green)]/[0.06]" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-ink)]/40"
                }`}
              >
                <label htmlFor={inputId} className="flex min-h-12 cursor-pointer items-center gap-3 px-4 pt-3">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid h-7 w-7 flex-none place-items-center rounded-full border-2 text-xs font-bold tabular-nums transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--poskoo-violet)] ${
                      checked ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)] text-white" : "border-[var(--poskoo-line)] text-[#5f5873]"
                    }`}
                  >
                    {checked ? <Check className="h-4 w-4" /> : n + 1}
                  </span>
                  <span className={`text-[15px] font-semibold ${checked ? "text-[#5f5873] line-through" : "text-[var(--poskoo-ink)]"}`}>
                    {item.title}
                  </span>
                </label>
                <div className="px-4 pb-3 pl-14">
                  <p className="text-sm leading-relaxed text-[#3d3450]">{item.detail}</p>
                  {item.links && (
                    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      {item.links.map((l) => (
                        <Link key={l.href} href={l.href} className="inline-flex min-h-8 items-center font-medium text-[var(--poskoo-violet)] hover:underline">
                          {l.label} <span aria-hidden="true">&nbsp;→</span>
                        </Link>
                      ))}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <aside aria-label="Checklist progress summary" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex-none rounded-full" style={{ background: `conic-gradient(${allDone ? "var(--poskoo-green)" : "var(--poskoo-violet)"} ${pctDone * 3.6}deg, var(--poskoo-line) 0deg)` }} aria-hidden="true">
              <span className="absolute inset-[9px] grid place-items-center rounded-full bg-[var(--poskoo-card)] text-lg font-bold tabular-nums">{pctDone}%</span>
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-[var(--poskoo-ink)]" aria-live="polite">
                {doneCount} of {ITEMS.length} confirmed
              </p>
              <p className="mt-0.5 text-xs text-[#3d3450]">{nextItem ? <>Next: <b className="text-[var(--poskoo-ink)]">{nextItem.title}</b></> : "Every check is done."}</p>
            </div>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={ITEMS.length}
            aria-label="Checklist progress"
          >
            <div
              className={`h-2 rounded-full motion-safe:transition-all ${allDone ? "bg-[var(--poskoo-green)]" : "bg-[var(--poskoo-violet)]"}`}
              style={{ width: `${(doneCount / ITEMS.length) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={copyChecklist}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy checklist"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
          {doneCount > 0 && (
            <button
              type="button"
              onClick={() => setDone({})}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />Reset
            </button>
          )}
          {allDone && (
            <p className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-green)]/40 bg-[var(--poskoo-green)]/10 px-3 py-2.5 text-sm font-medium text-[var(--poskoo-ink)]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-green)]" aria-hidden="true" />
              <span>
                All set — schedule the post from your{" "}
                <Link href="/signup" className="font-semibold text-[var(--poskoo-violet)] hover:underline">
                  Poskoo calendar
                </Link>
                .
              </span>
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
