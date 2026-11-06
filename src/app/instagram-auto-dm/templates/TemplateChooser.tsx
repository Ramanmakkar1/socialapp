"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AutomationMessagePreview from "@/components/AutomationMessagePreview";
import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";
import ui from "@/components/ui/ui.module.css";

const GOALS = [...new Set(DM_TEMPLATES.map((t) => t.useCase))];

function gateNote(t: DmTemplate): string {
  if (t.askEmail && t.requireFollow) return "They follow you and share an email before the link is sent.";
  if (t.askEmail) return "They share their email in the DM before the link is sent.";
  if (t.requireFollow) return "They follow your account before the link is sent.";
  return "No strings: the link arrives in the first message.";
}

function httpUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" ? value : "";
  } catch {
    return "";
  }
}

const CHIP_BASE = "block rounded-full border px-4 py-2 text-sm font-medium transition-colors";
const CARD_BASE = "flex h-full flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors";

export default function TemplateChooser() {
  const id = useId();
  const [goal, setGoal] = useState(GOALS[0]);
  const [slug, setSlug] = useState(DM_TEMPLATES[0].slug);
  const [url, setUrl] = useState("");

  const matches = useMemo(() => DM_TEMPLATES.filter((t) => t.useCase === goal), [goal]);
  const selected = matches.find((t) => t.slug === slug) ?? matches[0];
  const validUrl = httpUrl(url);
  const invalid = url.trim().length > 0 && validUrl === "";

  function pickGoal(next: string) {
    setGoal(next);
    setSlug(DM_TEMPLATES.find((t) => t.useCase === next)?.slug ?? DM_TEMPLATES[0].slug);
  }

  return (
    <section aria-labelledby={`${id}-title`} className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
      <div className="rounded-3xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-5 sm:p-8">
        <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Not sure which template? <span className={ui.accent}>Start from your goal.</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[#3d3450]">
          Four steps: choose your goal, choose a message, preview what the recipient sees, then create the automation.
        </p>

        <div className="mt-6">
          <fieldset>
            <legend className="text-sm font-semibold text-[var(--poskoo-ink)]">1 · Choose your goal</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <label key={g} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`${id}-goal`}
                    value={g}
                    checked={goal === g}
                    onChange={() => pickGoal(g)}
                    className="peer sr-only"
                  />
                  <span className={`${CHIP_BASE} ${goal === g ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)] text-white" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[#3d3450] hover:text-[var(--poskoo-ink)]"} peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--poskoo-violet)]/40`}>
                    {g}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-[var(--poskoo-ink)]">2 · Choose a message</legend>
            <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {matches.map((t) => (
                <label key={t.slug} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`${id}-template`}
                    value={t.slug}
                    checked={selected.slug === t.slug}
                    onChange={() => setSlug(t.slug)}
                    className="peer sr-only"
                  />
                  <span className={`${CARD_BASE} ${selected.slug === t.slug ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/5" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)]"} peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--poskoo-violet)]/40`}>
                    <span className="text-sm font-medium text-[var(--poskoo-ink)]">{t.title}</span>
                    <span className="text-xs text-[var(--poskoo-muted)]">
                      {t.slug === "story-freebie" ? "Story reply" : "Keyword"}: {t.keywords.join(" or ")} · {gateNote(t)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">3 · Preview the recipient experience</h3>
          <div className="mt-2">
            <label htmlFor={`${id}-url`} className="text-sm font-medium text-[#3d3450]">
              Destination URL <span className="text-[var(--poskoo-muted)]">(optional here)</span>
            </label>
            <input
              id={`${id}-url`}
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yoursite.com/guide"
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-url-error` : undefined}
              className="mt-1.5 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30"
            />
            {invalid && (
              <p id={`${id}-url-error`} className="mt-1 text-xs text-[var(--poskoo-coral)]">
                Enter a full link starting with http:// or https:// — the preview keeps the link out until the checks below are met.
              </p>
            )}
          </div>
          <div className="mt-3 min-w-0">
            <AutomationMessagePreview
              key={selected.slug}
              dmText={selected.dmMessage}
              linkUrl={validUrl}
              emailGate={selected.askEmail}
              followGate={selected.requireFollow}
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
          <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">4 · Create the automation</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#3d3450]">
            “Use this template” opens {selected.title} in setup, message and gates included. You add your own destination URL there, on a screen that explains each requirement in plain words.
          </p>
          <Link
            href={`/app/auto-dm?template=${selected.slug}`}
            className={`${ui.inkFill} mt-3 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold`}
          >
            Use this template <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
