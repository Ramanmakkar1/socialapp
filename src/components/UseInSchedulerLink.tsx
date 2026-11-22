"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import { writeSignupDraft } from "@/lib/captionHandoff";

/**
 * Copy-first handoff from a free tool to signup.
 *
 * The caption is copied to the clipboard and also included as an encoded draft
 * query parameter. Signup does not read that parameter yet, so the visible copy
 * always tells people to paste the caption into their first post.
 */
export default function UseInSchedulerLink({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const draftHref = `/signup?draft=${encodeURIComponent(text)}`;
  const hasText = text.trim().length > 0;

  async function copy() {
    if (!hasText) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(false);
    } catch {
      setCopied(false);
      setError(true);
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={copy}
          disabled={!hasText}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-5 py-3 text-sm font-medium hover:text-[var(--poskoo-violet)] disabled:opacity-50"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy caption"}
        </button>
        <Link
          href={draftHref}
          onClick={() => writeSignupDraft(text)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--poskoo-violet)] px-5 py-3 text-sm font-semibold text-white"
        >
          Continue to sign up <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-[var(--poskoo-muted)]">
        {error
          ? "Could not copy automatically. Select your caption, copy it manually, then continue to sign up."
          : "Caption saved — it will be waiting in your first post after signup."}
      </p>
    </div>
  );
}
