import { decryptToken, encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { refreshLongLivedToken } from "@/lib/instagram";
import { checkPageToken, type PageTokenCheck } from "@/lib/metaLogin";

type AccountRow = {
  id: string;
  access_token_enc: string;
  token_expires_at: Date;
};

export type RefreshResult = { refreshed: number; failed: number; expired: number; pagesChecked: number; pagesInvalid: number };

/**
 * Daily token job.
 * - Instagram-login accounts: long-lived user tokens (60 days) are refreshed before they expire.
 * - Facebook-login accounts: long-lived Page tokens do not expire, but Meta invalidates them when the
 *   user changes their password, removes the app or loses the Page. Each one is checked with
 *   debug_token; an invalid token marks the account 'expired' so Settings shows "Reconnect needed".
 */
export async function refreshExpiringTokens(
  limit = 50,
  checkPage: (token: string) => Promise<PageTokenCheck> = checkPageToken,
): Promise<RefreshResult> {
  const rows = await query<AccountRow>(
    `select id, access_token_enc, token_expires_at from socialapp.social_accounts where platform='instagram' and status='active' and auth_type='instagram_login' and access_token_enc is not null and token_expires_at is not null and token_expires_at < now() + interval '10 days' order by token_expires_at limit $1`,
    [limit]
  );

  let refreshed = 0;
  let failed = 0;
  let expired = 0;
  const nowMs = Date.now();

  for (const row of rows) {
    const expiresMs = new Date(row.token_expires_at).getTime();
    if (expiresMs < nowMs) {
      await query(`update socialapp.social_accounts set status='expired', updated_at=now() where id=$1`, [row.id]);
      expired++;
      continue;
    }

    try {
      const plain = decryptToken(row.access_token_enc);
      const { access_token, expires_in } = await refreshLongLivedToken(plain);
      await query(
        `update socialapp.social_accounts set access_token_enc=$2, token_expires_at=now() + ($3 || ' seconds')::interval, updated_at=now() where id=$1`,
        [row.id, encryptToken(access_token), String(expires_in || 5184000)]
      );
      refreshed++;
    } catch {
      console.error("refreshExpiringTokens: refresh failed for account", row.id);
      failed++;
    }
  }

  const pages = await query<{ id: string; access_token_enc: string }>(
    `select id, access_token_enc from socialapp.social_accounts where platform='instagram' and status='active' and auth_type='facebook_login' and access_token_enc is not null order by updated_at limit $1`,
    [limit]
  );
  let pagesChecked = 0;
  let pagesInvalid = 0;
  for (const row of pages) {
    let verdict: PageTokenCheck;
    try {
      verdict = await checkPage(decryptToken(row.access_token_enc));
    } catch {
      verdict = "invalid"; // unreadable stored token: the user has to connect again
    }
    pagesChecked++;
    if (verdict === "invalid") {
      await query(`update socialapp.social_accounts set status='expired', updated_at=now() where id=$1 and status='active'`, [row.id]);
      pagesInvalid++;
    } else if (verdict === "valid") {
      // Rotate the check order: the least recently checked accounts go first next run.
      await query(`update socialapp.social_accounts set updated_at=now() where id=$1`, [row.id]);
    }
  }

  return { refreshed, failed, expired, pagesChecked, pagesInvalid };
}
