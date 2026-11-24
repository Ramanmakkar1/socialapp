// When a failed publish is tried again by the worker on its own (target status 'retrying').
// Only failures where the network clearly did NOT accept the post are retried: a temporary
// error or a rate limit. A dropped connection ("ambiguous") is never retried automatically,
// because the post may already be live; the user checks their profile and presses Retry.
import type { PublishErrorKind } from "@/lib/publishErrors";

/** Temporary errors: every 10 minutes, 6 times (about an hour). */
export const RETRY_DELAY_MS = 10 * 60_000;
export const MAX_RETRY_ATTEMPTS = 6;
/** Rate limits: 1h, 2h, 4h, 8h, 16h, capped at 24h, 5 times. */
export const RATE_LIMIT_BASE_MS = 60 * 60_000;
export const RATE_LIMIT_MAX_MS = 24 * 60 * 60_000;
export const MAX_RATE_LIMIT_ATTEMPTS = 5;

/**
 * Milliseconds until the next automatic attempt, or null when the target must fail now.
 * `attempts` = automatic retries already made for this target (post_targets.attempt_count).
 */
export function nextRetryDelayMs(kind: PublishErrorKind, attempts: number): number | null {
  if (kind === "retry") return attempts < MAX_RETRY_ATTEMPTS ? RETRY_DELAY_MS : null;
  if (kind === "rate_limit") {
    if (attempts >= MAX_RATE_LIMIT_ATTEMPTS) return null;
    return Math.min(RATE_LIMIT_BASE_MS * 2 ** attempts, RATE_LIMIT_MAX_MS);
  }
  return null;
}

/** Appended to the reason once automatic retries run out. */
export function gaveUpNote(kind: PublishErrorKind, attempts: number): string {
  if (attempts === 0 || (kind !== "retry" && kind !== "rate_limit")) return "";
  return ` Poskoo tried ${attempts + 1} times. Press Retry to try again.`;
}
