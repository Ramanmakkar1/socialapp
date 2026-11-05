// Versioned, bounded, short-lived handoff of a caption between the free
// Instagram caption counter and the post preview tool.
//
// Payload lives in sessionStorage only: tab-scoped, cleared when the tab
// closes, never sent to a server and never placed in a URL. Caption text
// stays out of URLs by design — the URL only carries a `from` page hint.

const VERSION = 1;
const KEY = "poskoo:caption-handoff";
/** Handoffs expire 10 minutes after they are written. */
const TTL_MS = 10 * 60 * 1000;
/** Reject payloads larger than 64 KB so one caption cannot fill storage. */
const MAX_BYTES = 64 * 1024;
const SOURCE = "/tools/instagram-caption-counter";

export type CaptionHandoff = {
  v: typeof VERSION;
  caption: string;
  writtenAt: string;
  from: string;
};

export type HandoffError = "absent" | "blocked" | "malformed" | "expired" | "oversized";

type HandoffSuccess = { ok: true; caption: string };
type HandoffFailure = { ok: false; error: HandoffError };
export type HandoffResult = HandoffSuccess | HandoffFailure;

function isHandoff(value: unknown): value is CaptionHandoff {
  const record = value as Record<string, unknown>;
  return (
    typeof value === "object" &&
    value !== null &&
    record.v === VERSION &&
    typeof record.caption === "string" &&
    typeof record.writtenAt === "string" &&
    typeof record.from === "string"
  );
}

/** Write a caption to sessionStorage. Never throws; returns an error code on failure. */
export function writeCaptionHandoff(caption: string): { ok: true } | { ok: false; error: HandoffError } {
  const payload: CaptionHandoff = {
    v: VERSION,
    caption,
    writtenAt: new Date().toISOString(),
    from: SOURCE,
  };
  let serialized: string;
  try {
    serialized = JSON.stringify(payload);
  } catch {
    return { ok: false, error: "malformed" };
  }
  try {
    if (new TextEncoder().encode(serialized).byteLength > MAX_BYTES) return { ok: false, error: "oversized" };
    sessionStorage.setItem(KEY, serialized);
  } catch {
    return { ok: false, error: "blocked" };
  }
  return { ok: true };
}

/** Read and remove a valid handoff exactly once. Never throws. */
export function readCaptionHandoff(): HandoffResult {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    return { ok: false, error: "blocked" };
  }
  if (raw === null) return { ok: false, error: "absent" };
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { ok: false, error: "malformed" };
  }
  if (!isHandoff(payload)) return { ok: false, error: "malformed" };
  const written = new Date(payload.writtenAt).getTime();
  if (!Number.isFinite(written) || Date.now() - written > TTL_MS) return { ok: false, error: "expired" };
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Best-effort removal; a stale item is still overwritten or expired on next write.
  }
  return { ok: true, caption: payload.caption };
}

/** Remove any stored handoff without reading it. Never throws. */
export function clearCaptionHandoff(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
}
