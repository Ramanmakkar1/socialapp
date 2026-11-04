import { decryptToken, encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { refreshLongLivedToken } from "@/lib/instagram";

type AccountRow = {
  id: string;
  access_token_enc: string;
  token_expires_at: Date;
};

export async function refreshExpiringTokens(limit = 50): Promise<{ refreshed: number; failed: number; expired: number }> {
  const rows = await query<AccountRow>(
    `select id, access_token_enc, token_expires_at from socialapp.social_accounts where platform='instagram' and status='active' and access_token_enc is not null and token_expires_at is not null and token_expires_at < now() + interval '10 days' order by token_expires_at limit $1`,
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

  return { refreshed, failed, expired };
}
