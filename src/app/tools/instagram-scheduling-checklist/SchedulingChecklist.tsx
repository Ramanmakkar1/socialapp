"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";

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
      "Write a caption for every channel you selected and stay inside its limits — Instagram 2,200 characters and 30 hashtags, Threads 500 characters, Facebook Page 63,206. Keep your hook in the first line, before Instagram’s “more” cutoff.",
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
    <div className="text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--poskoo-ink)]" aria-live="polite">
          {doneCount} of {ITEMS.length} confirmed
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyChecklist}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] hover:text-[var(--poskoo-violet)]"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy checklist"}
          </button>
          {doneCount > 0 && (
            <button
              type="button"
              onClick={() => setDone({})}
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] hover:text-[var(--poskoo-violet)]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--poskoo-band)]"
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={ITEMS.length}
        aria-label="Checklist progress"
      >
        <div
          className="h-2 rounded-full bg-[var(--poskoo-violet)] transition-all"
          style={{ width: `${(doneCount / ITEMS.length) * 100}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2" aria-label="Scheduling preflight checklist">
        {ITEMS.map((item) => {
          const checked = !!done[item.id];
          const inputId = `checklist-${item.id}`;
          return (
            <li
              key={item.id}
              className={`rounded-2xl border bg-[var(--poskoo-paper)] transition-colors ${
                checked ? "border-[var(--poskoo-green)]/50" : "border-[var(--poskoo-line)]"
              }`}
            >
              <label
                htmlFor={inputId}
                className="flex min-h-11 cursor-pointer items-center gap-3 px-4 pt-3"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.id)}
                  className="h-5 w-5 shrink-0 accent-[var(--poskoo-violet)]"
                />
                <span
                  className={`text-sm font-semibold ${
                    checked ? "text-[var(--poskoo-muted)] line-through" : "text-[var(--poskoo-ink)]"
                  }`}
                >
                  {item.title}
                </span>
                {checked && (
                  <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--poskoo-green)]" aria-hidden />
                )}
              </label>
              <div className="px-4 pb-3 pl-12">
                <p className="text-sm leading-relaxed text-[var(--poskoo-muted)]">{item.detail}</p>
                {item.links && (
                  <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {item.links.map((l) => (
                      <Link key={l.href} href={l.href} className="font-medium text-[var(--poskoo-violet)] hover:underline">
                        {l.label} <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="mt-4 rounded-2xl border border-[var(--poskoo-green)]/40 bg-[var(--poskoo-green)]/10 px-4 py-3 text-sm font-medium text-[var(--poskoo-ink)]">
          All set — schedule the post from your{" "}
          <Link href="/signup" className="font-semibold text-[var(--poskoo-violet)] hover:underline">
            Poskoo calendar
          </Link>
          .
        </p>
      )}
    </div>
  );
}
