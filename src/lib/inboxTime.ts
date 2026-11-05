import { extractMessageEvents } from "./messageParse.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Meta messaging timestamps are milliseconds. Allow at most one minute of clock
// skew, but never let that skew extend the reply window beyond receipt time.
export function messageEventTime(item: unknown, receivedAt: Date): Date | null {
  const timestamp = isRecord(item) ? item.timestamp : undefined;
  const receipt = receivedAt.getTime();
  if (typeof timestamp !== "number" || !Number.isSafeInteger(timestamp) || timestamp <= 0 ||
      !Number.isFinite(receipt) || timestamp > receipt + 60_000) return null;
  return new Date(Math.min(timestamp, receipt));
}

// Parse each item separately so its timestamp cannot be paired with another
// message after the existing parser filters malformed items and echoes.
export function extractTimedMessageEvents(payload: unknown, receivedAt: Date) {
  if (!isRecord(payload) || !Array.isArray(payload.entry)) return [];
  return payload.entry.flatMap((entry: unknown) => {
    if (!isRecord(entry) || !Array.isArray(entry.messaging)) return [];
    return entry.messaging.flatMap((item: unknown) =>
      extractMessageEvents({ entry: [{ id: entry.id, messaging: [item] }] })
        .map((message) => ({ ...message, eventAt: messageEventTime(item, receivedAt) }))
    );
  });
}
