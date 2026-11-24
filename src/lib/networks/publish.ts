// Server only: the publish worker loop for the new networks. publisher.ts claims due targets per
// platform and hands them here with its helpers, so claiming / status rules stay in one place.
import { getPool } from "@/lib/db";
import { NETWORK_IDS, NETWORK_LABEL, NetworkAuthError, mediaItems, obj, type NetAccount, type NetworkId, type PublishOutcome } from "@/lib/networks/common";
import { NETWORKS } from "@/lib/networks/registry";
import { holdTargetMedia } from "@/lib/mediaLifecycle";
import { expiresWithin, loadActiveAccount, loadUserAccount, markAccountExpired, refreshUnderLock } from "@/lib/networks/store";
import { classifyPublishError, type PublishErrorKind } from "@/lib/publishErrors";
import { markReminded } from "@/lib/networks/reminderSend";
import { requirePlanFeature } from "@/lib/planFeatures";

export type ClaimedNetworkRow = {
  id: string;
  post_id: string;
  caption_override: string | null;
  caption: string;
  media: unknown;
  user_id: string;
  net_options?: unknown;
  /** The exact account picked in the composer (null on rows saved before multi-account). */
  social_account_id?: string | null;
  /** true = the user picked an account; a null id then means that account was removed. */
  account_locked?: boolean | null;
  attempt_count?: number | null;
};

export type MarkFailedInfo = { kind?: PublishErrorKind; raw?: string; attempts?: number };

export type NetworkPublishDeps = {
  claim: (limit: number, platform: NetworkId) => Promise<ClaimedNetworkRow[]>;
  /** Fails the target, or schedules an automatic retry when `info.attempts` is given and the kind allows it. */
  markFailed: (targetId: string, postId: string, error: string, token: string, info?: MarkFailedInfo) => Promise<unknown>;
  refreshPostStatus: (postId: string) => Promise<void>;
  /** Test seams. */
  loadAccount?: (userId: string, platform: NetworkId, accountId?: string | null) => Promise<NetAccount | null>;
  /** Force a token refresh after the network rejected the token (refresh-once-then-retry). */
  forceRefresh?: (account: NetAccount) => Promise<NetAccount>;
  ensureFresh?: (account: NetAccount) => Promise<NetAccount>;
  publish?: (platform: NetworkId, input: Parameters<(typeof NETWORKS)[NetworkId]["publish"]>[0]) => Promise<PublishOutcome>;
  markPublished?: (targetId: string, externalId: string, accountId: string) => Promise<void>;
  markExpired?: (accountId: string) => Promise<void>;
  holdMedia?: (targetId: string) => Promise<void>;
  markReminded?: (targetId: string, accountId: string) => Promise<void>;
  planGate?: typeof requirePlanFeature;
};

function reconnect(label: string): string {
  return `${label} access expired or was removed. Reconnect ${label} in Settings, then retry.`;
}

/** Refresh the access token first when it is (nearly) expired. Throws NetworkAuthError when the user must reconnect. */
export async function ensureFreshAccount(account: NetAccount): Promise<NetAccount> {
  const adapter = NETWORKS[account.platform];
  if (!adapter.refresh || !expiresWithin(account, adapter.refreshSkewSec)) return account;
  return refreshUnderLock(
    account.id,
    (a) => expiresWithin(a, adapter.refreshSkewSec),
    (a) => adapter.refresh!(a),
  );
}

/** Refresh now, whatever the stored expiry says (the network just rejected the token). */
export async function forceRefreshAccount(account: NetAccount): Promise<NetAccount> {
  const adapter = NETWORKS[account.platform];
  if (!adapter.refresh) throw new NetworkAuthError("no_refresh", "this network has no token refresh", true);
  return refreshUnderLock(account.id, () => true, (a) => adapter.refresh!(a));
}

async function defaultMarkPublished(targetId: string, externalId: string, accountId: string): Promise<void> {
  await getPool().query(
    `update socialapp.post_targets set status='published', external_post_id=$2, published_at=now(), error=null,
     error_kind=null, error_raw=null, next_retry_at=null, social_account_id=$3 where id=$1`,
    [targetId, externalId, accountId],
  );
}

async function defaultLoadAccount(userId: string, platform: NetworkId, accountId?: string | null): Promise<NetAccount | null> {
  return accountId ? loadUserAccount(userId, platform, accountId) : loadActiveAccount(userId, platform);
}

export const PICKED_ACCOUNT_GONE =
  "The account picked for this post was disconnected or removed. Reconnect it in Settings, or edit the post and pick another account.";

export type NetworkPublishResult = { published: number; failed: number; reminded?: number };

export async function publishNetworkTargets(limit: number, deps: NetworkPublishDeps, platforms: NetworkId[] = NETWORK_IDS): Promise<NetworkPublishResult> {
  const result: NetworkPublishResult = { published: 0, failed: 0 };
  const loadAccount = deps.loadAccount ?? defaultLoadAccount;
  const forceRefresh = deps.forceRefresh ?? forceRefreshAccount;
  const ensureFresh = deps.ensureFresh ?? ensureFreshAccount;
  const publish = deps.publish ?? ((platform, input) => NETWORKS[platform].publish(input));
  const markPublished = deps.markPublished ?? defaultMarkPublished;
  const markExpired = deps.markExpired ?? markAccountExpired;

  for (const platform of platforms) {
    const label = NETWORK_LABEL[platform];
    // One post per claim (up to `limit`), so nothing sits claimed while earlier posts publish and
    // gets "recovered" as interrupted by an overlapping run (see claimEach in publisher.ts).
    for (let n = 0; n < limit; n += 1) {
      let rows: ClaimedNetworkRow[] = [];
      try {
        rows = await deps.claim(1, platform);
      } catch (err) {
        console.error(`publisher: claiming ${platform} targets failed`, err instanceof Error ? err.message : err);
        break;
      }
      if (rows.length === 0) break;
      for (const row of rows) {
        let token = "";
        try {
          if (platform === "x") {
            const gate = await (deps.planGate ?? requirePlanFeature)(row.user_id, "x_posting");
            if (!gate.ok) {
              await deps.markFailed(row.id, row.post_id, gate.error, token);
              result.failed += 1;
              continue;
            }
          }
          if (row.account_locked === true && !row.social_account_id) {
            await deps.markFailed(row.id, row.post_id, PICKED_ACCOUNT_GONE, token, { kind: "reconnect" });
            result.failed += 1;
            continue;
          }
          let account = await loadAccount(row.user_id, platform, row.social_account_id ?? null);
          if (!account) {
            const message = row.social_account_id
              ? `The ${label} account picked for this post needs reconnecting. Reconnect it in Settings, then retry.`
              : `No ${label} account connected. Connect ${label} in Settings, then retry.`;
            await deps.markFailed(row.id, row.post_id, message, token, { kind: "reconnect" });
            result.failed += 1;
            continue;
          }
          try {
            account = await ensureFresh(account);
          } catch (err) {
            const dead = err instanceof NetworkAuthError ? err.tokenDead : false;
            if (dead) await markExpired(account.id).catch(() => undefined);
            const message = err instanceof Error ? err.message : String(err);
            await deps.markFailed(
              row.id,
              row.post_id,
              dead ? reconnect(label) : `${label}: could not refresh access. Poskoo will try again.`,
              account.accessToken,
              dead ? { kind: "reconnect", raw: message } : { kind: "retry", raw: message, attempts: row.attempt_count ?? 0 },
            );
            result.failed += 1;
            continue;
          }
          token = account.accessToken;
          const options = obj(row.net_options);
          const input = {
            text: row.caption_override ?? row.caption,
            media: mediaItems(row.media),
            options,
            idempotencyKey: row.id,
          };
          let outcome = await publish(platform, { account, ...input });
          // The network rejected the token: refresh it once and try again (a 401 means nothing was posted).
          if (!outcome.ok && NETWORKS[platform].refresh && classifyPublishError(platform, outcome.error, outcome).kind === "refresh_token") {
            try {
              account = await forceRefresh(account);
              token = account.accessToken;
              outcome = await publish(platform, { account, ...input });
            } catch {
              // Refresh failed: fall through with the original rejection (marks the account expired).
            }
          }
          if (outcome.ok && outcome.reminded) {
            // Reminder channels: the e-mail went out; the owner posts it and marks it as posted.
            await (deps.markReminded ?? markReminded)(row.id, account.id);
            await deps.refreshPostStatus(row.post_id);
            result.reminded = (result.reminded ?? 0) + 1;
          } else if (outcome.ok) {
            await markPublished(row.id, outcome.url ?? outcome.id, account.id);
            if (outcome.mediaPending) await (deps.holdMedia ?? holdTargetMedia)(row.id);
            await deps.refreshPostStatus(row.post_id);
            result.published += 1;
          } else {
            const c = classifyPublishError(platform, outcome.error, outcome);
            if (c.kind === "refresh_token" || c.kind === "reconnect") await markExpired(account.id).catch(() => undefined);
            const message = c.kind === "refresh_token" ? reconnect(label) : c.message;
            await deps.markFailed(row.id, row.post_id, message, token, { kind: c.kind, raw: c.raw, attempts: row.attempt_count ?? 0 });
            result.failed += 1;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await deps.markFailed(row.id, row.post_id, `${label} publishing failed: ${message}`, token).catch(() => undefined);
          result.failed += 1;
        }
      }
    }
  }
  return result;
}
