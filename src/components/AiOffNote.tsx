import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

/** What the dashboard knows about AI for the signed-in user (from a server action or page). */
export type AiAvailability = { ready: boolean; isAdmin: boolean };

export const AI_SETTINGS_HREF = "/admin/settings#ai";

/**
 * Shown next to an AI button while AI isn't switched on: says why the button does nothing yet.
 * Admins get a link to paste the Anthropic API key; everyone else gets "coming soon" wording.
 * Works in server and client components (no hooks).
 */
export default function AiOffNote({ isAdmin, children, className = "" }: { isAdmin: boolean; children?: ReactNode; className?: string }) {
  return (
    <p role="status" className={`mt-2 flex items-start gap-1.5 rounded-lg bg-[var(--poskoo-band)] px-2.5 py-1.5 text-xs text-[var(--poskoo-muted)] ${className}`}>
      <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold text-[var(--poskoo-ink)]">AI isn&apos;t switched on yet.</strong>{" "}
        {isAdmin ? (
          <>
            Add an Anthropic API key in{" "}
            <Link href={AI_SETTINGS_HREF} className="font-medium text-[var(--poskoo-violet)] underline">Admin → Settings → AI</Link>{" "}
            to switch it on for everyone.
          </>
        ) : (
          <>It&apos;s coming soon.</>
        )}{" "}
        {children}
      </span>
    </p>
  );
}
