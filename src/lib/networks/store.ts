// Server only: social_accounts rows for the new networks (encrypted tokens + meta + secret_enc).
import { decryptToken, encryptToken } from "@/lib/crypto";
import { getPool, query } from "@/lib/db";
import { obj, type NetAccount, type NetworkId, type TokenSet } from "@/lib/networks/common";

export type SaveAccountInput = {
  externalId: string;
  username: string | null;
  tokens: TokenSet;
  scopes: string[];
  meta?: Record<string, unknown>;
  secret?: Record<string, string> | null;
};

/**
 * Insert or reconnect an account. A row owned by another Poskoo user is never taken over:
 * returns "taken" in that case so the callback can show an error.
 */
export async function saveNetworkAccount(userId: string, platform: NetworkId, input: SaveAccountInput): Promise<"ok" | "taken"> {
  const existing = await query<{ user_id: string }>(
    "select user_id from socialapp.social_accounts where platform=$1 and external_id=$2",
    [platform, input.externalId],
  );
  if (existing[0] && existing[0].user_id !== userId) return "taken";
  const t = input.tokens;
  await query(
    `insert into socialapp.social_accounts
       (user_id, platform, external_id, username, access_token_enc, refresh_token_enc, token_expires_at, refresh_expires_at, scopes, status, meta, secret_enc)
     values ($1, $2, $3, $4, $5, $6,
       case when $7::int > 0 then now() + ($7::int * interval '1 second') else null end,
       case when $8::int > 0 then now() + ($8::int * interval '1 second') else null end,
       $9, 'active', $10::jsonb, $11)
     on conflict (platform, external_id) do update set
       username=excluded.username, access_token_enc=excluded.access_token_enc, refresh_token_enc=excluded.refresh_token_enc,
       token_expires_at=excluded.token_expires_at, refresh_expires_at=excluded.refresh_expires_at, scopes=excluded.scopes,
       status='active', meta=excluded.meta, secret_enc=excluded.secret_enc, updated_at=now()
     where social_accounts.user_id = excluded.user_id`,
    [
      userId,
      platform,
      input.externalId,
      input.username,
      encryptToken(t.accessToken),
      t.refreshToken ? encryptToken(t.refreshToken) : null,
      Math.floor(t.expiresIn ?? 0),
      Math.floor(t.refreshExpiresIn ?? 0),
      input.scopes,
      JSON.stringify(input.meta ?? {}),
      input.secret ? encryptToken(JSON.stringify(input.secret)) : null,
    ],
  );
  return "ok";
}

type AccountRow = {
  id: string;
  platform: string;
  external_id: string;
  username: string | null;
  access_token_enc: string | null;
  refresh_token_enc: string | null;
  token_expires_at: Date | null;
  meta: unknown;
  secret_enc: string | null;
};

const ACCOUNT_COLUMNS =
  "id, platform, external_id, username, access_token_enc, refresh_token_enc, token_expires_at, meta, secret_enc";

/** Decrypt a stored row; null when the access token is missing or unreadable. */
export function rowToAccount(row: AccountRow): NetAccount | null {
  if (!row.access_token_enc) return null;
  try {
    const secret: Record<string, string> = {};
    if (row.secret_enc) {
      for (const [k, v] of Object.entries(obj(JSON.parse(decryptToken(row.secret_enc))))) {
        if (typeof v === "string") secret[k] = v;
      }
    }
    return {
      id: row.id,
      platform: row.platform as NetworkId,
      externalId: row.external_id,
      username: row.username,
      accessToken: decryptToken(row.access_token_enc),
      refreshToken: row.refresh_token_enc ? decryptToken(row.refresh_token_enc) : "",
      tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at) : null,
      meta: obj(row.meta),
      secret,
    };
  } catch {
    return null;
  }
}

/** The user's active account on this network (oldest first, like the other publishers). */
export async function loadActiveAccount(userId: string, platform: NetworkId): Promise<NetAccount | null> {
  const rows = await query<AccountRow>(
    `select ${ACCOUNT_COLUMNS} from socialapp.social_accounts
     where user_id=$1 and platform=$2 and status='active' order by created_at limit 1`,
    [userId, platform],
  );
  return rows[0] ? rowToAccount(rows[0]) : null;
}

/** One of the user's accounts on this network, picked in the composer; null when it is not active. */
export async function loadUserAccount(userId: string, platform: NetworkId, accountId: string): Promise<NetAccount | null> {
  const rows = await query<AccountRow>(
    `select ${ACCOUNT_COLUMNS} from socialapp.social_accounts
     where id=$1 and user_id=$2 and platform=$3 and status='active'`,
    [accountId, userId, platform],
  );
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function loadAccountById(id: string): Promise<NetAccount | null> {
  const rows = await query<AccountRow>(`select ${ACCOUNT_COLUMNS} from socialapp.social_accounts where id=$1 and status='active'`, [id]);
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function markAccountExpired(id: string): Promise<void> {
  await query("update socialapp.social_accounts set status='expired', updated_at=now() where id=$1 and status='active'", [id]);
}

export async function updateAccountMeta(id: string, meta: Record<string, unknown>): Promise<void> {
  await query("update socialapp.social_accounts set meta = meta || $2::jsonb, updated_at=now() where id=$1", [id, JSON.stringify(meta)]);
}

/**
 * Refresh the account's tokens under a row lock, so the publisher and the daily refresh job never
 * spend the same rotating refresh token twice (TikTok, X and Pinterest rotate refresh tokens).
 * `needsRefresh` is re-checked on the locked, freshly read row: when another run already
 * refreshed it, the stored tokens are returned unchanged.
 */
export async function refreshUnderLock(
  accountId: string,
  needsRefresh: (account: NetAccount) => boolean,
  refresh: (account: NetAccount) => Promise<TokenSet>,
): Promise<NetAccount> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const res = await client.query<AccountRow>(
      `select ${ACCOUNT_COLUMNS} from socialapp.social_accounts where id=$1 and status='active' for update`,
      [accountId],
    );
    const account = res.rows[0] ? rowToAccount(res.rows[0]) : null;
    if (!account) {
      await client.query("rollback");
      throw new Error("account not found or not active");
    }
    if (!needsRefresh(account)) {
      await client.query("commit");
      return account;
    }
    const t = await refresh(account);
    await client.query(
      `update socialapp.social_accounts set access_token_enc=$2,
         refresh_token_enc=coalesce($3, refresh_token_enc),
         token_expires_at=case when $4::int > 0 then now() + ($4::int * interval '1 second') else token_expires_at end,
         refresh_expires_at=case when $5::int > 0 then now() + ($5::int * interval '1 second') else refresh_expires_at end,
         updated_at=now()
       where id=$1`,
      [
        accountId,
        encryptToken(t.accessToken),
        t.refreshToken ? encryptToken(t.refreshToken) : null,
        Math.floor(t.expiresIn ?? 0),
        Math.floor(t.refreshExpiresIn ?? 0),
      ],
    );
    await client.query("commit");
    const expiresAt = t.expiresIn && t.expiresIn > 0 ? new Date(Date.now() + t.expiresIn * 1000) : account.tokenExpiresAt;
    return { ...account, accessToken: t.accessToken, refreshToken: t.refreshToken ?? account.refreshToken, tokenExpiresAt: expiresAt };
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** True when the access token is gone or expires within `skewSeconds`. */
export function expiresWithin(account: NetAccount, skewSeconds: number, nowMs = Date.now()): boolean {
  if (!account.tokenExpiresAt) return false;
  return account.tokenExpiresAt.getTime() - nowMs <= skewSeconds * 1000;
}
