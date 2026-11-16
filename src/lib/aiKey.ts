// Server-only: where the Anthropic API key for the AI features comes from.
//
//   1. ANTHROPIC_API_KEY (env var) always wins.
//   2. Otherwise the key an admin pasted in /admin/settings, stored encrypted (TOKEN_ENCRYPTION_KEY,
//      same helper as social_accounts.access_token_enc) in socialapp.app_settings
//      (db/migrations/050_app_settings.sql).
//
// The stored key is cached in memory for 60 seconds (on globalThis, so every route bundle in the
// process shares it) and the cache is dropped on save / remove. During `next build` and without a
// database it is never read: the build fails closed to "AI not configured", and static pages pick
// the key up when they revalidate at runtime.
//
// Never log a key or put it in an error message; only the last 4 characters (`hint`) leave here.
import { decryptToken, encryptToken } from "@/lib/crypto";
import { isDbConfigured, query } from "@/lib/db";

export const ANTHROPIC_KEY_SETTING = "anthropic_api_key";
const CACHE_MS = 60_000;
// Keep serving the last known answer while a refresh is in flight so a page
// render (or an ISR regeneration) never waits on a cold/slow database.
const STALE_MS = 10 * 60_000;
// Hard cap on the stored-key lookup: a hung DB connection must not stall the
// homepage or any other static marketing page for seconds.
const DB_TIMEOUT_MS = 1_000;

type StoredKey = { key: string; hint: string; updatedAt: string | null; updatedBy: string | null };
type Cache = { at: number; value: StoredKey | null };

declare global {
  var __poskooAnthropicKeyCache: Cache | undefined;
}

export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function envKey(): string | null {
  return process.env.ANTHROPIC_API_KEY?.trim() || null;
}

/** Drops the cached stored key (call after saving or removing it). */
export function bustAnthropicKeyCache(): void {
  globalThis.__poskooAnthropicKeyCache = undefined;
}

function cacheStoredKey(value: StoredKey | null): void {
  globalThis.__poskooAnthropicKeyCache = { at: Date.now(), value };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("stored-key lookup timed out")), ms);
    (timer as unknown as { unref?: () => void }).unref?.();
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Reads the stored key. Throws on DB errors so the caller can keep the last known value. */
async function readStoredKey(): Promise<StoredKey | null> {
  const rows = await withTimeout(
    query<{ value_enc: string; hint: string | null; updated_at: Date | string | null; updated_by: string | null }>(
      "select value_enc, hint, updated_at, updated_by from socialapp.app_settings where key=$1",
      [ANTHROPIC_KEY_SETTING],
    ),
    DB_TIMEOUT_MS,
  );
  const row = rows[0];
  if (!row) return null;
  try {
    const key = decryptToken(row.value_enc).trim();
    if (!key) return null;
    return {
      key,
      hint: row.hint ?? key.slice(-4),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      updatedBy: row.updated_by,
    };
  } catch {
    // Wrong / rotated TOKEN_ENCRYPTION_KEY: treat as "no key" (never log the ciphertext).
    console.error("Stored Anthropic API key could not be decrypted (was TOKEN_ENCRYPTION_KEY changed?). Save it again in Admin → Settings.");
    return null;
  }
}

// One refresh at a time per process, so concurrent page renders share a single DB read.
let refreshingStoredKey: Promise<void> | null = null;

function refreshStoredKey(): Promise<void> {
  if (refreshingStoredKey) return refreshingStoredKey;
  refreshingStoredKey = readStoredKey()
    .then((value) => cacheStoredKey(value))
    .catch(() => {
      // Table missing (migration 050 not run yet), DB down or timed out: keep the
      // last known answer (a stored key still works) and retry after CACHE_MS.
      const cached = globalThis.__poskooAnthropicKeyCache;
      cacheStoredKey(cached ? cached.value : null);
    })
    .finally(() => {
      refreshingStoredKey = null;
    });
  return refreshingStoredKey;
}

async function loadStoredKey(): Promise<StoredKey | null> {
  if (isBuildPhase() || !isDbConfigured()) return null;
  const cached = globalThis.__poskooAnthropicKeyCache;
  if (cached) {
    const age = Date.now() - cached.at;
    if (age < CACHE_MS) return cached.value;
    if (age < CACHE_MS + STALE_MS) {
      // Stale-while-revalidate: answer immediately, refresh in the background.
      void refreshStoredKey();
      return cached.value;
    }
  }
  await refreshStoredKey();
  return globalThis.__poskooAnthropicKeyCache?.value ?? null;
}

/** The key to call Anthropic with: env var first, else the stored one, else null. */
export async function resolveAnthropicKey(): Promise<string | null> {
  return envKey() ?? (await loadStoredKey())?.key ?? null;
}

/** True when a stored key exists (ignores the env var). */
export async function hasStoredAnthropicKey(): Promise<boolean> {
  return (await loadStoredKey()) !== null;
}

export type AnthropicKeyStatus = {
  /** Which key the app uses right now. */
  source: "env" | "stored" | "none";
  /** Last 4 characters of the key in use (env or stored), never more. */
  hint: string | null;
  stored: { hint: string; updatedAt: string | null; updatedBy: string | null } | null;
  canStore: boolean;
  cannotStoreReason: string | null;
};

/** For the admin settings page. Reads the database fresh (no cache). */
export async function anthropicKeyStatus(): Promise<AnthropicKeyStatus> {
  bustAnthropicKeyCache();
  const stored = await loadStoredKey();
  const env = envKey();
  const reason = !isDbConfigured()
    ? "DATABASE_URL isn't set on this server."
    : !process.env.TOKEN_ENCRYPTION_KEY
      ? "TOKEN_ENCRYPTION_KEY isn't set on this server, so a key can't be stored encrypted."
      : null;
  return {
    source: env ? "env" : stored ? "stored" : "none",
    hint: env ? env.slice(-4) : stored?.hint ?? null,
    stored: stored ? { hint: stored.hint, updatedAt: stored.updatedAt, updatedBy: stored.updatedBy } : null,
    canStore: reason === null,
    cannotStoreReason: reason,
  };
}

/** Anthropic API keys look like sk-ant-…; reject obvious paste mistakes before storing. */
export function validateAnthropicKey(raw: unknown): { ok: true; key: string } | { ok: false; error: string } {
  const key = typeof raw === "string" ? raw.trim() : "";
  if (!key) return { ok: false, error: "Paste an Anthropic API key first." };
  if (key.length > 300 || /\s/.test(key)) return { ok: false, error: "That doesn't look like an Anthropic API key (no spaces, under 300 characters)." };
  if (!/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(key)) return { ok: false, error: "Anthropic API keys start with “sk-ant-”. Copy the whole key from console.anthropic.com → API keys." };
  return { ok: true, key };
}

export async function saveStoredAnthropicKey(key: string, updatedBy: string): Promise<void> {
  const enc = encryptToken(key);
  await query(
    "insert into socialapp.app_settings (key, value_enc, hint, updated_by, updated_at) values ($1, $2, $3, $4, now()) " +
      "on conflict (key) do update set value_enc=excluded.value_enc, hint=excluded.hint, updated_by=excluded.updated_by, updated_at=now()",
    [ANTHROPIC_KEY_SETTING, enc, key.slice(-4), updatedBy],
  );
  bustAnthropicKeyCache();
}

export async function removeStoredAnthropicKey(): Promise<boolean> {
  const rows = await query<{ key: string }>("delete from socialapp.app_settings where key=$1 returning key", [ANTHROPIC_KEY_SETTING]);
  bustAnthropicKeyCache();
  return rows.length > 0;
}

export type KeyTestResult = { ok: true; model: string } | { ok: false; error: string; status?: number };

/**
 * One minimal Messages API call (fast model, a few output tokens) to check the key works.
 * A 200 is success even if the reply is cut short. Errors are mapped to plain words; Anthropic's
 * own error message is shown for 400s (e.g. "credit balance is too low"), never the key.
 */
export async function testAnthropicKey(key: string, model = process.env.AI_MODEL || "claude-haiku-5-5"): Promise<KeyTestResult> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 32,
        output_config: { effort: "low" },
        messages: [{ role: "user", content: "Reply with OK." }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) return { ok: true, model };
    let message = "";
    try {
      const data = (await res.json()) as { error?: { message?: unknown } };
      if (typeof data?.error?.message === "string") message = data.error.message.replaceAll(key, "[key]").slice(0, 300);
    } catch {
      /* no JSON body */
    }
    if (res.status === 401) return { ok: false, status: 401, error: "Anthropic rejected the key (invalid or revoked)." };
    if (res.status === 403) return { ok: false, error: `The key isn't allowed to use ${model}.${message ? ` ${message}` : ""}` };
    if (res.status === 429) return { ok: false, error: "The key works but is rate-limited right now. Try again in a minute." };
    if (res.status === 529 || res.status >= 500) return { ok: false, error: `Anthropic is having trouble (HTTP ${res.status}). Try again shortly.` };
    return { ok: false, error: message || `Anthropic returned HTTP ${res.status}.` };
  } catch {
    return { ok: false, error: "Couldn't reach api.anthropic.com from this server." };
  }
}
