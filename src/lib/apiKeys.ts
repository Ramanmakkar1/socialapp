// Server-only API keys for the Poskoo MCP server (src/app/api/mcp).
// Keys look like `poskoo_<32 hex>` and are stored as a sha256 hash; the UI only
// ever sees the prefix. All queries tolerate a missing api_keys table (migration
// not applied yet) so the app keeps working.
//
// can_publish (migration 048): draft-only keys let an assistant create drafts and paused Auto-DM
// rules for the owner to approve; publishing keys may also schedule posts and switch rules on.
// Before 048 runs every key behaves as before (can publish).
import { randomBytes } from "node:crypto";
import { query } from "@/lib/db";
import { hashToken } from "@/lib/password";

export type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: Date;
  last_used_at: Date | null;
  revoked_at: Date | null;
  /** Missing before migration 048 (treated as true). */
  can_publish?: boolean | null;
};

function isMissingColumn(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "42703";
}

/** A fresh key: `poskoo_` + 32 hex chars (128 bits of entropy). */
export function generateApiKey(): string {
  return `poskoo_${randomBytes(16).toString("hex")}`;
}

/** Creates a key for `userId` and returns it once; only the hash is stored. */
export async function createApiKey(
  userId: string,
  name: string,
  canPublish = false,
): Promise<{ key: string } | { error: string }> {
  const cleanName = name.trim().slice(0, 60) || "MCP";
  const key = generateApiKey();
  try {
    try {
      await query(
        "insert into socialapp.api_keys (user_id, name, key_hash, key_prefix, can_publish) values ($1, $2, $3, $4, $5)",
        [userId, cleanName, hashToken(key), key.slice(0, 12), canPublish],
      );
    } catch (err) {
      if (!isMissingColumn(err)) throw err;
      await query(
        "insert into socialapp.api_keys (user_id, name, key_hash, key_prefix) values ($1, $2, $3, $4)",
        [userId, cleanName, hashToken(key), key.slice(0, 12)],
      );
    }
  } catch (err) {
    console.error("createApiKey failed", userId, err instanceof Error ? err.message : err);
    return { error: "Could not create the API key. Please try again." };
  }
  return { key };
}

/** The user's keys, newest first (revoked ones included so they can be cleaned up). */
export async function listApiKeys(userId: string): Promise<ApiKeyRow[]> {
  try {
    // to_jsonb(k)->'can_publish' is null (not an error) before migration 048.
    return await query<ApiKeyRow>(
      "select id, name, key_prefix, created_at, last_used_at, revoked_at, (to_jsonb(k)->>'can_publish')::boolean as can_publish from socialapp.api_keys k where user_id=$1 order by created_at desc",
      [userId],
    );
  } catch {
    return [];
  }
}

/** Revokes one of the user's keys (idempotent). */
export async function revokeApiKey(userId: string, keyId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await query(
      "update socialapp.api_keys set revoked_at = now() where id=$1 and user_id=$2 and revoked_at is null",
      [keyId, userId],
    );
    return { ok: true };
  } catch (err) {
    console.error("revokeApiKey failed", userId, keyId, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not revoke the API key. Please try again." };
  }
}

/**
 * Resolves a raw key to its owner. Returns null for an unknown, revoked key or a
 * missing table. A valid key refreshes last_used_at (best effort).
 */
export async function userForApiKey(key: string): Promise<string | null> {
  return (await apiKeyAccess(key))?.userId ?? null;
}

export type ApiKeyAccess = { userId: string; canPublish: boolean };

/** Owner and permission of a raw key, or null (unknown, revoked, or no table). */
export async function apiKeyAccess(key: string): Promise<ApiKeyAccess | null> {
  if (typeof key !== "string" || key.length < 8 || key.length > 200) return null;
  try {
    const rows = await query<{ id: string; user_id: string; can_publish: boolean | null }>(
      "select id, user_id, (to_jsonb(k)->>'can_publish')::boolean as can_publish from socialapp.api_keys k where key_hash=$1 and revoked_at is null limit 1",
      [hashToken(key)],
    );
    const row = rows[0];
    if (!row) return null;
    query("update socialapp.api_keys set last_used_at=now() where id=$1", [row.id]).catch(() => {});
    return { userId: row.user_id, canPublish: row.can_publish !== false };
  } catch {
    return null;
  }
}
