// Pure send policy for the DM queue: no DB or network access.

export const MAX_ATTEMPTS = 5;

// Stays below Meta's ~200 automated DMs per hour per account.
export const HOURLY_LIMIT_PER_ACCOUNT = 180;

const BASE_DELAY_MS = 30_000;
const MAX_DELAY_MS = 60 * 60 * 1000;
const JITTER = 0.1;

const RATE_LIMIT_CODES = new Set([4, 17, 32, 613]);
const FATAL_CODES = new Set([10, 100, 551]);

export type MetaErrorClass = "retry" | "fatal" | "rate_limited";

function metaErrorCode(body: unknown): number | null {
  if (typeof body !== "object" || body === null) return null;
  const err = (body as { error?: unknown }).error;
  if (typeof err !== "object" || err === null) return null;
  const code = Number((err as { code?: unknown }).code);
  return Number.isFinite(code) ? code : null;
}

// status 0 (or any non-HTTP value) means a network error.
export function classifyMetaError(status: number, body: unknown): MetaErrorClass {
  const code = metaErrorCode(body);
  if (status === 429 || (code !== null && RATE_LIMIT_CODES.has(code))) {
    return "rate_limited";
  }
  if (!Number.isFinite(status) || status <= 0 || status >= 500) {
    return "retry";
  }
  if (code !== null && FATAL_CODES.has(code)) {
    return "fatal";
  }
  if (status === 408) return "retry";
  // Other 4xx errors (bad request, expired token, no permission) will not fix themselves.
  if (status >= 400) return "fatal";
  return "retry";
}

// Exponential backoff: 30s * 2^attempts, capped at 1 hour, with +/-10% jitter.
export function nextAttemptDelayMs(
  attempts: number,
  random: () => number = Math.random
): number {
  const n = Math.max(0, Math.floor(attempts));
  const base = Math.min(BASE_DELAY_MS * 2 ** n, MAX_DELAY_MS);
  const factor = 1 + (random() * 2 - 1) * JITTER;
  return Math.round(Math.min(base * factor, MAX_DELAY_MS));
}

export function remainingBudget(sentInLastHour: number): number {
  const sent = Number.isFinite(sentInLastHour) ? Math.max(0, sentInLastHour) : 0;
  return Math.max(0, HOURLY_LIMIT_PER_ACCOUNT - Math.floor(sent));
}
