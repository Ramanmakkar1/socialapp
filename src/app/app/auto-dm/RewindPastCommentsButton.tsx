"use client";

import { useState, useTransition } from "react";
import { rewindRuleAction } from "./actions";

type Props = {
  ruleId: string;
};

export function RewindPastCommentsButton({ ruleId }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { kind: "ok"; queued: number; scanned: number } | { kind: "err"; error: string } | null
  >(null);

  function run() {
    setResult(null);
    startTransition(async () => {
      const out = await rewindRuleAction(ruleId);
      if (out.ok) {
        setResult({ kind: "ok", queued: out.queued, scanned: out.scanned });
      } else {
        setResult({ kind: "err", error: out.error });
      }
    });
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-ink disabled:opacity-60"
      >
        {pending ? "Scanning…" : "Send to past comments (7 days)"}
      </button>
      <span className="text-xs text-ink-2">
        Scans up to 25 latest posts and 50 comments per post; only comments from the past 7 days qualify.
      </span>
      {result?.kind === "ok" && (
        <span className="text-sm text-ink-2">
          Queued {result.queued} DMs from {result.scanned} recent comments
        </span>
      )}
      {result?.kind === "err" && (
        <span className="text-sm text-warn" role="alert">
          {result.error}
        </span>
      )}
    </span>
  );
}
