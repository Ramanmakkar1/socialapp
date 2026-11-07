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

function metaErrorMessage(body: unknown): string {
  if (typeof body !== "object" || body === null) return "";
  const err = (body as { error?: unknown }).error;
  if (typeof err !== "object" || err === null) return "";
  const msg = (err as { message?: unknown }).message;
  return typeof msg === "string" ? msg : "";
}

// status 0 (or any non-HTTP value) means a network error.
export function classifyMetaError(status: number, body: unknown): MetaErrorClass {
  const code = metaErrorCode(body);
  if (status === 429 || (code !== null && RATE_LIMIT_CODES.has(code)) || /too many|rate limit|limit reached/i.test(metaErrorMessage(body))) {
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

// Instagram messaging windows: a DM reply only within 24 h of the person's message,
// a private reply to a comment only within 7 days of the comment.
export const DM_WINDOW_MS = 24 * 60 * 60 * 1000;
export const COMMENT_REPLY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Returns a skip reason when the queued DM is outside the allowed window, otherwise null.
export function messagingWindowError(
  row: { comment_id: string | null; created_at?: Date | string | number | null },
  now: number = Date.now()
): string | null {
  if (row.created_at == null) return null;
  const created = new Date(row.created_at).getTime();
  if (!Number.isFinite(created)) return null;
  const age = now - created;
  if (row.comment_id) {
    return age > COMMENT_REPLY_WINDOW_MS ? "Outside Instagram's 7-day private reply window" : null;
  }
  return age > DM_WINDOW_MS ? "Outside Instagram's 24-hour messaging window" : null;
}

// Expired / revoked token (OAuth error 190 or HTTP 401): stop sending for this account.
export function isTokenError(status: number, body: unknown): boolean {
  if (status === 401) return true;
  const code = metaErrorCode(body);
  return code === 190 || code === 102;
}

export function remainingBudget(sentInLastHour: number): number {
  const sent = Number.isFinite(sentInLastHour) ? Math.max(0, sentInLastHour) : 0;
  return Math.max(0, HOURLY_LIMIT_PER_ACCOUNT - Math.floor(sent));
}
