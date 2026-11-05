"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CommentKeywordTester from "@/components/CommentKeywordTester";
import AutomationMessagePreview from "@/components/AutomationMessagePreview";
import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";

// Illustrative destinations only: example.com is reserved for documentation.
const SCENARIOS = [
  { slug: "free-guide", label: "Guide", url: "https://example.com/your-free-guide" },
  { slug: "product-link", label: "Product link", url: "https://example.com/shop/your-product" },
] as const;

const DEMO = SCENARIOS.map((s) => ({
  ...s,
  template: DM_TEMPLATES.find((t) => t.slug === s.slug) as DmTemplate,
})).filter((s) => s.template);

function DemoScene() {
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" focusable="false" className="w-full max-w-sm">
      <ellipse cx="160" cy="140" rx="150" ry="8" fill="var(--brand)" opacity=".08" />
      <rect x="10" y="16" width="92" height="116" rx="14" fill="var(--surface)" stroke="var(--line)" />
      <rect x="20" y="26" width="72" height="54" rx="8" fill="var(--brand)" opacity=".18" />
      <circle cx="56" cy="48" r="11" fill="var(--brand-2)" />
      <path d="M40 80c0-14 32-14 32 0Z" fill="var(--brand)" />
      <rect x="20" y="90" width="52" height="6" rx="3" fill="var(--ink-2)" opacity=".4" />
      <rect x="20" y="102" width="36" height="6" rx="3" fill="var(--ink-2)" opacity=".25" />
      <path d="M122 46h62a10 10 0 0 1 10 10v14a10 10 0 0 1-10 10h-44l-12 9v-9a10 10 0 0 1-6-10V56a10 10 0 0 1 10-10Z" fill="var(--surface)" stroke="var(--line)" />
      <text x="158" y="68" textAnchor="middle" fill="var(--brand)" fontSize="13" fontWeight="700">GUIDE</text>
      <path d="M200 64h24" stroke="var(--brand-2)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 5" className="motion-safe:animate-pulse motion-reduce:animate-none" />
      <path d="m222 58 8 6-8 6" fill="none" stroke="var(--brand-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="236" y="16" width="74" height="116" rx="14" fill="var(--ink)" />
      <rect x="242" y="26" width="62" height="96" rx="10" fill="var(--surface)" />
      <rect x="248" y="40" width="50" height="30" rx="8" fill="var(--brand)" opacity=".2" />
      <rect x="254" y="48" width="36" height="5" rx="2.5" fill="var(--brand)" />
      <rect x="254" y="58" width="24" height="5" rx="2.5" fill="var(--brand)" opacity=".6" />
      <path d="m292 92 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--brand-2)" />
    </svg>
  );
}

const STEPS = ["Choose an offer", "Try a keyword", "Inspect the DM"];

export default function AutoDmDemo() {
  const id = useId();
  const [slug, setSlug] = useState<string>(DEMO[0]?.slug ?? "");
  const active = DEMO.find((s) => s.slug === slug) ?? DEMO[0];
  if (!active) return null;
  const t = active.template;

  return (
    <section aria-labelledby={`${id}-title`} className="mx-auto max-w-6xl px-4 pb-20">
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Try comment-to-DM <span className="gradient-text">before you sign up</span>
          </h2>
          <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2">
            Local simulation · nothing is sent or saved
          </span>
        </div>
        <ol className="mt-4 flex flex-wrap gap-2 text-sm text-ink-2">
          {STEPS.map((step, i) => (
            <li key={step} className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5">
              <span className="btn-primary grid h-6 w-6 place-items-center rounded-full text-xs font-semibold">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-4">
            <DemoScene />
            <fieldset>
              <legend className="text-sm font-semibold text-ink">1. Choose an offer</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {DEMO.map((s) => (
                  <label
                    key={s.slug}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface-2 p-3 text-sm transition-colors motion-reduce:transition-none has-[:checked]:border-brand has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40"
                  >
                    <input
                      type="radio"
                      name={`${id}-offer`}
                      value={s.slug}
                      checked={s.slug === active.slug}
                      onChange={() => setSlug(s.slug)}
                      className="mt-1 accent-[var(--brand)]"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">{s.label}</span>
                      <span className="block text-xs text-ink-2">
                        Keyword{s.template.keywords.length > 1 ? "s" : ""}: {s.template.keywords.join(", ")}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">2. Try a keyword</p>
              <CommentKeywordTester
                key={active.slug}
                keywords={t.keywords}
                matchType={t.matchMode === "exact" ? "exact" : "contains"}
                commentTrigger
              />
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold text-ink">3. Inspect the DM a matching comment receives</p>
            <AutomationMessagePreview
              key={active.slug}
              dmText={t.dmMessage}
              linkUrl={active.url}
              emailGate={t.askEmail}
              followGate={t.requireFollow}
            />
            <p className="mt-3 text-xs leading-relaxed text-ink-2">
              The link above is an illustrative example.com address. In your account, you add your own destination URL.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={`/instagram-auto-dm/templates#${t.slug}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium hover:border-brand"
              >
                View the {t.title} template
              </Link>
              <Link
                href="/signup"
                className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
