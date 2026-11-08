"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import {
  HOOK_STYLES,
  generateHooks,
  hooksToText,
  type HookStyleFilter,
} from "@/lib/hookIdeas";

const CHIP_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] transition-colors hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]";

export default function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<HookStyleFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topicId = useId();

  const groups = useMemo(() => {
    const styles =
      style === "all" ? HOOK_STYLES : HOOK_STYLES.filter((s) => s.id === style);
    return styles.map((s) => ({
      id: s.id,
      label: s.label,
      hooks: generateHooks(topic, s.id),
    }));
  }, [topic, style]);

  const all = groups.flatMap((g) => g.hooks);

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(id);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={topicId} className="text-sm font-medium">
            What is your Reel about?
          </label>
          <input
            id={topicId}
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. meal prep, cold email, puppy training"
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          />
        </div>
        <div>
          <span className="text-sm font-medium">Hook style</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStyle("all")}
              aria-pressed={style === "all"}
              className={`${CHIP_CLASS} ${style === "all" ? "!border-[var(--poskoo-violet)] !bg-[var(--poskoo-violet)] !text-white" : ""}`}
            >
              All
            </button>
            {HOOK_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                aria-pressed={style === s.id}
                className={`${CHIP_CLASS} ${style === s.id ? "!border-[var(--poskoo-violet)] !bg-[var(--poskoo-violet)] !text-white" : ""}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => copy("all", hooksToText(all))}
          disabled={all.length === 0}
          aria-label="Copy all hooks"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-5 text-sm font-semibold text-[#3d3450] hover:text-[var(--poskoo-violet)] disabled:opacity-50"
        >
          {copied === "all" ? (
            <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied === "all" ? "Copied" : "Copy all"}
        </button>
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--poskoo-violet)] px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Schedule your Reel with Poskoo <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/tools/instagram-caption-generator"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-5 text-sm font-semibold text-[#3d3450] hover:text-[var(--poskoo-violet)]"
        >
          Turn a hook into a caption
        </Link>
      </div>

      <div className="mt-6">
        {groups.map((group) => (
          <section key={group.id} className="mt-6 first:mt-0">
            {style === "all" && (
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                {group.label}
              </h3>
            )}
            <ul className="mt-3 grid gap-3">
              {group.hooks.map((hook, i) => {
                const id = `${group.id}-${i}`;
                return (
                  <li
                    key={hook}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-base font-medium leading-snug text-[#3d3450]">{hook}</p>
                    <button
                      type="button"
                      onClick={() => copy(id, hook)}
                      aria-label={`${copied === id ? "Copied" : "Copy"} hook: ${hook}`}
                      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 text-sm font-medium hover:text-[var(--poskoo-violet)] sm:self-auto"
                    >
                      {copied === id ? (
                        <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied === id ? "Copied" : "Copy"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
