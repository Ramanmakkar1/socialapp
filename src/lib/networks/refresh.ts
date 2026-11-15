// Server only: daily token upkeep for the new networks (called from refreshExpiringTokens).
// TikTok / X / Bluesky access tokens live hours, so the publisher refreshes them on demand right
// before posting; this daily pass keeps the (rotating) refresh tokens alive and flags dead ones.
// Pinterest (30-day access) and LinkedIn (60-day access) are refreshed when they get close.
import { query } from "@/lib/db";
import { NetworkAuthError, type NetworkId } from "@/lib/networks/common";
import { NETWORKS } from "@/lib/networks/registry";
import { markAccountExpired, refreshUnderLock } from "@/lib/networks/store";

const REFRESHABLE: NetworkId[] = ["tiktok", "bluesky", "linkedin", "pinterest", "x", "gbp", "peertube"];

export type NetworkRefreshResult = { refreshed: number; failed: number; expired: number };

export async function refreshNetworkTokens(limit = 100): Promise<NetworkRefreshResult> {
  const out: NetworkRefreshResult = { refreshed: 0, failed: 0, expired: 0 };
  let rows: { id: string; platform: NetworkId; has_refresh: boolean; expired: boolean }[] = [];
  try {
    rows = await query(
      `select id, platform, (refresh_token_enc is not null) as has_refresh, (token_expires_at < now()) as expired from socialapp.social_accounts
       where platform = any($1::text[]) and status='active' and token_expires_at is not null
         and token_expires_at < now() + interval '5 days'
       order by token_expires_at limit $2`,
      [REFRESHABLE, limit],
    );
  } catch (err) {
    // Columns from migration 040 missing: nothing to refresh yet.
    console.error("refreshNetworkTokens: query failed", err instanceof Error ? err.message : err);
    return out;
  }
  for (const row of rows) {
    const adapter = NETWORKS[row.platform];
    if (!adapter?.refresh) continue;
    if (!row.has_refresh && row.platform !== "bluesky") {
      // No refresh token (e.g. LinkedIn apps without programmatic refresh): the member reconnects
      // once the access token has actually run out.
      if (row.expired) {
        await markAccountExpired(row.id).catch(() => undefined);
        out.expired += 1;
      }
      continue;
    }
    try {
      await refreshUnderLock(row.id, () => true, (a) => adapter.refresh!(a));
      out.refreshed += 1;
    } catch (err) {
      if (err instanceof NetworkAuthError && err.tokenDead) {
        await markAccountExpired(row.id).catch(() => undefined);
        out.expired += 1;
      } else {
        console.error(`refreshNetworkTokens: ${row.platform} refresh failed for account`, row.id);
        out.failed += 1;
      }
    }
  }
  return out;
}
