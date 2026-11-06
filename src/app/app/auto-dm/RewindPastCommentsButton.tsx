"use client";

import { useState, useTransition } from "react";
import { rewindRuleAction } from "./actions";
import ui from "@/components/ui/ui.module.css";

type Props = {
  ruleId: string;
};

export function RewindPastCommentsButton({ ruleId }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { kind: "ok"; queued: number; scanned: number; failures: number } | { kind: "err"; error: string } | null
  >(null);

  function run() {
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
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className={`${ui.btn} ${ui.btnGhost} ${ui.sm}`}
      >
        {pending ? "Scanning…" : "Send to past comments (7 days)"}
      </button>
      <span className="text-xs text-[var(--poskoo-ink)]">
        Scans up to 25 latest posts and 50 comments per post; only comments from the past 7 days qualify.
      </span>
      <span role="status" aria-live="polite" aria-atomic="true">
        {pending && <span className="sr-only">Scanning past comments.</span>}
        {result?.kind === "ok" && (
          <span className="text-sm text-[var(--poskoo-ink)]">
            Queued {result.queued} DMs from {result.scanned} recent comments.
            {result.failures > 0 && (
              <span className="text-[var(--poskoo-coral)]">
                {" "}Partial scan: {result.failures} account or post scans failed. Some comments could not be checked. Please try again.
              </span>
            )}
          </span>
        )}
        {result?.kind === "err" && (
          <span className="text-sm text-[var(--poskoo-coral)]">
            {result.error}
          </span>
        )}
      </span>
    </span>
  );
}
