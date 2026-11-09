"use client";

import { useState, useTransition } from "react";
import { rewindRuleAction } from "../auto-dm/actions";
import ui from "@/components/ui/ui.module.css";

type Rule = { id: string; name: string };

type Result =
  | { kind: "ok"; queued: number; scanned: number; failures: number }
  | { kind: "err"; error: string };

const STEPS = ["Select automation", "Scan comments", "Processing", "Complete"];

export default function RewindFlow({ rules }: { rules: Rule[] }) {
  const [ruleId, setRuleId] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);

  const stepIndex = pending ? 2 : result?.kind === "ok" ? 3 : result?.kind === "err" ? 2 : ruleId ? 1 : 0;

  function run() {
    if (!ruleId) return;
    setResult(null);
    startTransition(async () => {
      try {
        const out = await rewindRuleAction(ruleId);
        if (out.ok) {
          setResult({ kind: "ok", queued: out.queued, scanned: out.scanned, failures: out.failures });
        } else {
          setResult({ kind: "err", error: out.error });
        }
      } catch {
        setResult({ kind: "err", error: "Could not scan past comments. Please try again." });
      }
    });
  }

  return (
    <div className={`${ui.card} p-5`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Rewind steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`flex items-center gap-2 text-sm ${index <= stepIndex ? "font-semibold text-[var(--poskoo-ink)]" : "text-[var(--poskoo-muted)]"}`}
          >
            <span
              aria-hidden="true"
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index <= stepIndex ? "bg-[var(--poskoo-ink)] text-white" : "bg-[var(--poskoo-lilac)] text-[var(--poskoo-ink)]"}`}
            >
              {index + 1}
            </span>
            {label}
            {index < STEPS.length - 1 && <span aria-hidden="true" className="text-[var(--poskoo-muted)]">→</span>}
          </li>
        ))}
      </ol>
      <form
        className="mt-5 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          run();
        }}
      >
        <div className={ui.field} style={{ minWidth: "min(100%, 260px)" }}>
          <label htmlFor="rewind-rule" className={ui.label}>Automation</label>
          <select id="rewind-rule" value={ruleId} onChange={(event) => setRuleId(event.target.value)} className={ui.input} disabled={pending}>
            <option value="">Choose an automation…</option>
            {rules.map((rule) => <option key={rule.id} value={rule.id}>{rule.name}</option>)}
          </select>
        </div>
        <button type="submit" disabled={!ruleId || pending} className={`${ui.btn} ${ui.btnDark} ${ui.sm}`}>
          {pending ? "Scanning…" : "Send to past comments (7 days)"}
        </button>
      </form>
      <p className={`${ui.hint} mt-3`}>
        Scans up to 25 latest posts and 50 comments per post; only comments from the past 7 days qualify.
      </p>
      <span role="status" aria-live="polite" aria-atomic="true" className="block">
        {pending && <span className="mt-3 block text-sm text-[var(--poskoo-ink)]">Scanning past comments…</span>}
        {result?.kind === "ok" && (
          <span className="mt-3 block text-sm text-[var(--poskoo-ink)]">
            Queued {result.queued} DMs from {result.scanned} recent comments.
            {result.failures > 0 && (
              <span className="text-[var(--poskoo-coral)]">
                {" "}Partial scan: {result.failures} account or post scans failed. Some comments could not be checked. Please try again.
              </span>
            )}
          </span>
        )}
        {result?.kind === "err" && (
          <span className="mt-3 block text-sm text-[var(--poskoo-coral)]">{result.error}</span>
        )}
      </span>
    </div>
  );
}
