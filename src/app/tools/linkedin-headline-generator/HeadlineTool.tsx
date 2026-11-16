"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Lightbulb } from "lucide-react";
import {
  HEADLINE_FORMULAS,
  generateHeadlines,
  LINKEDIN_HEADLINE_MAX,
  LINKEDIN_HEADLINE_MOBILE_VISIBLE,
  type HeadlineFormulaFilter,
} from "@/lib/linkedinHeadlines";

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn = "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]";

const CHIP_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] transition-colors hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]";

export default function HeadlineTool() {
  const [role, setRole] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState("");
  const [skills, setSkills] = useState("");
  const [formula, setFormula] = useState<HeadlineFormulaFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roleId = useId();
  const audienceId = useId();
  const resultId = useId();
  const skillsId = useId();

  const groups = useMemo(() => {
    const formulas =
      formula === "all"
        ? HEADLINE_FORMULAS
        : HEADLINE_FORMULAS.filter((item) => item.id === formula);
    return formulas.map((item) => ({
      id: item.id,
      label: item.label,
      headlines: generateHeadlines({ role, audience, result, skills }, item.id),
    }));
  }, [role, audience, result, skills, formula]);

  const all = groups.flatMap((group) => group.headlines);
  const usingSample = !role.trim() && !audience.trim() && !result.trim() && !skills.trim();
  const overMax = all.filter((headline) => headline.length > LINKEDIN_HEADLINE_MAX).length;
  const overMobile = all.filter(
    (headline) =>
      headline.length > LINKEDIN_HEADLINE_MOBILE_VISIBLE &&
      headline.length <= LINKEDIN_HEADLINE_MAX
  ).length;

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
    <div className="min-w-0 space-y-5 text-left">
      {/* Inputs */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor={roleId} className="text-sm font-semibold">
              Your role
            </label>
            <input
              id={roleId}
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Marketing Manager"
              className={inputClass}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor={audienceId} className="text-sm font-semibold">
              Who you help
            </label>
            <input
              id={audienceId}
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. B2B SaaS teams"
              className={inputClass}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor={resultId} className="text-sm font-semibold">
              Result you deliver
            </label>
            <input
              id={resultId}
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g. grow pipeline from LinkedIn"
              className={inputClass}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor={skillsId} className="text-sm font-semibold">
              Skills (comma-separated)
            </label>
            <input
              id={skillsId}
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. SEO, content marketing, demand generation"
              className={inputClass}
            />
          </div>
          {usingSample ? (
            <p className="flex items-center gap-1 text-xs text-[#3d3450] sm:col-span-2">
              <Lightbulb className="h-3.5 w-3.5 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              Showing examples for a Marketing Manager helping B2B SaaS teams. Add your details.
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold">Headline formula</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormula("all")}
              aria-pressed={formula === "all"}
              className={`${CHIP_CLASS} ${formula === "all" ? "!border-[var(--poskoo-ink)] !bg-[var(--poskoo-ink)] !text-white" : ""}`}
            >
              All
            </button>
            {HEADLINE_FORMULAS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormula(item.id)}
                aria-pressed={formula === item.id}
                className={`${CHIP_CLASS} ${formula === item.id ? "!border-[var(--poskoo-ink)] !bg-[var(--poskoo-ink)] !text-white" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>Headlines</p>
          <p aria-live="polite" className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{all.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Ready to copy.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Formulas</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
            {groups.length}
            <span className="text-base font-medium text-[#5f5873]"> / {HEADLINE_FORMULAS.length}</span>
          </p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{formula === "all" ? "All angles" : groups[0]?.label}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Over {LINKEDIN_HEADLINE_MOBILE_VISIBLE}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{overMobile}</p>
          <p className="mt-1 text-xs text-[#3d3450]">May be cut off in mobile feeds.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Over {LINKEDIN_HEADLINE_MAX}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{overMax}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Too long for LinkedIn.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Headlines */}
        <div className="min-w-0">
          {groups.map((group) => (
            <section key={group.id} className="mt-6 !p-0 first:mt-0">
              {formula === "all" && (
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                  {group.label}
                  <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-xs tabular-nums text-[var(--poskoo-violet)]">{group.headlines.length}</span>
                </h3>
              )}
              <ul className="mt-3 grid gap-2.5">
                {group.headlines.map((headline, i) => {
                  const id = `${group.id}-${i}`;
                  const tooLong = headline.length > LINKEDIN_HEADLINE_MAX;
                  const cutOff = !tooLong && headline.length > LINKEDIN_HEADLINE_MOBILE_VISIBLE;
                  return (
                    <li
                      key={headline}
                      className="flex flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 transition-colors hover:border-[var(--poskoo-ink)]/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-base font-medium leading-snug text-[#3d3450]">{headline}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className="tabular-nums text-[#5f5873]">
                            {headline.length} / {LINKEDIN_HEADLINE_MAX} characters
                          </span>
                          {tooLong ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">
                              too long
                            </span>
                          ) : cutOff ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                              may be cut off in mobile feeds
                            </span>
                          ) : (
                            <span className="rounded-full bg-[var(--poskoo-green)]/10 px-2 py-0.5 font-semibold text-[var(--poskoo-green)]">
                              fits in mobile feeds
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => copy(id, headline)}
                          aria-label={`${copied === id ? "Copied" : "Copy"} headline: ${headline}`}
                          className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition ${copied === id ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] hover:border-[var(--poskoo-ink)]"}`}
                        >
                          {copied === id ? (
                            <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copied === id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {/* Actions */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => copy("all", all.join("\n"))}
            disabled={all.length === 0}
            aria-label="Copy all headlines"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied === "all" ? (
              <Check className="h-5 w-5 text-[var(--poskoo-lime)]" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            {copied === "all" ? "Copied" : `Copy all (${all.length})`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <p className="text-xs leading-relaxed text-[#5f5873]">
            LinkedIn allows up to {LINKEDIN_HEADLINE_MAX} characters. Only about the first{" "}
            {LINKEDIN_HEADLINE_MOBILE_VISIBLE} show in many mobile feeds, so keep your main keyword early.
          </p>

          <Link
            href="/signup"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--poskoo-violet)] px-4 text-sm font-semibold !text-white transition-transform hover:-translate-y-0.5"
          >
            Schedule your posts with Poskoo <span aria-hidden="true">&nbsp;→</span>
          </Link>
          <Link href="/tools/linkedin-character-counter" className={ghostBtn}>
            Check your headline length
          </Link>
        </aside>
      </div>
    </div>
  );
}
