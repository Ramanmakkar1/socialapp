"use client";

import { useState, useTransition } from "react";
import { Check, MessageCircle } from "lucide-react";
import { rewindRuleAction } from "../auto-dm/actions";
import styles from "./rewind.module.css";

export type RewindRule = {
  id: string;
  name: string;
  keywords: string[];
  dmText: string;
  /** Why rewindRule() would refuse this rule (paused / no comment trigger); null = can run. */
  unavailable: string | null;
};

type Result =
  | { kind: "ok"; queued: number; scanned: number; failures: number }
  | { kind: "err"; error: string };

const STEPS = ["Select automation", "Scan comments", "Processing", "Complete"];

export default function RewindFlow({ rules }: { rules: RewindRule[] }) {
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
    <section className={styles.card} aria-labelledby="rewind-choose">
      <ol className={styles.stepper} aria-label="Rewind steps">
        {STEPS.map((label, index) => {
          const done = index < stepIndex || (index === 3 && stepIndex === 3);
          const current = index === stepIndex;
          return (
            <li key={label} className={`${styles.step} ${done ? styles.stepDone : ""} ${current ? styles.stepCurrent : ""}`} aria-current={current ? "step" : undefined}>
              <span className={styles.stepDot} aria-hidden="true">{done ? <Check width={13} height={13} /> : index + 1}</span>
              <span className={styles.stepLabel}>{label}</span>
            </li>
          );
        })}
      </ol>

      <h2 id="rewind-choose" className={styles.h2}>Choose an automation to rewind</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          run();
        }}
      >
        <fieldset className={styles.ruleList} disabled={pending}>
          <legend className="sr-only">Automation</legend>
          {rules.map((rule) => {
            const off = rule.unavailable !== null;
            const selected = ruleId === rule.id;
            return (
              <label key={rule.id} className={`${styles.rule} ${selected ? styles.ruleSelected : ""} ${off ? styles.ruleOff : ""}`}>
                <input
                  type="radio"
                  name="rewind-rule"
                  value={rule.id}
                  checked={selected}
                  disabled={off}
                  onChange={() => { setRuleId(rule.id); setResult(null); }}
                  className="sr-only"
                  aria-describedby={off ? `why-${rule.id}` : undefined}
                />
                <span className={styles.ruleIcon} aria-hidden="true"><MessageCircle width={18} height={18} /></span>
                <span className={styles.ruleText}>
                  <b>{rule.name}</b>
                  <span>
                    {rule.keywords.length ? `Keywords: ${rule.keywords.join(", ")}` : "Any comment"}
                    {rule.dmText ? ` · “${rule.dmText.slice(0, 70)}${rule.dmText.length > 70 ? "…" : ""}”` : ""}
                  </span>
                  {off && <span id={`why-${rule.id}`} className={styles.why}>{rule.unavailable}</span>}
                </span>
                {off ? <span className={styles.offPill}>Not available for Rewind</span> : <span className={styles.radio} aria-hidden="true" />}
              </label>
            );
          })}
        </fieldset>
        <div className={styles.runRow}>
          <p className={styles.hint}>Scans up to 25 latest posts and 50 comments per post; only comments from the past 7 days qualify.</p>
          <button type="submit" disabled={!ruleId || pending} className={styles.primary}>
            {pending ? "Scanning…" : "Send to past comments (7 days)"}
          </button>
        </div>
      </form>
      <div role="status" aria-live="polite" aria-atomic="true">
        {pending && <p className={styles.status}>Scanning past comments…</p>}
        {result?.kind === "ok" && (
          <p className={`${styles.status} ${styles.statusOk}`}>
            Queued {result.queued} DMs from {result.scanned} recent comments.
            {result.failures > 0 && (
              <span className={styles.warn}>
                {" "}Partial scan: {result.failures} account or post scans failed. Some comments could not be checked. Please try again.
              </span>
            )}
          </p>
        )}
        {result?.kind === "err" && <p className={`${styles.status} ${styles.statusErr}`}>{result.error}</p>}
      </div>
    </section>
  );
}
