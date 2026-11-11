// Server only: disconnect / delete a connected Instagram account's data (deauthorize + data-deletion callbacks, Disconnect button).
import { createHash } from "node:crypto";
import { getPool, query } from "@/lib/db";

export function hashExternalId(id: string): string {
  return createHash("sha256").update(`instagram:${id}`, "utf8").digest("hex");
}

// Accounts matching the Meta user id from a signed_request (professional id or app-scoped id).
export async function findAccountIdsByMetaUser(metaUserId: string): Promise<string[]> {
  try {
    const rows = await query<{ id: string }>(
      "select id from socialapp.social_accounts where platform='instagram' and (external_id=$1 or app_user_id=$1)",
      [metaUserId]
    );
    return rows.map((r) => r.id);
  } catch {
    // app_user_id column missing (migration 012 not applied yet): match the professional id only.
    const rows = await query<{ id: string }>(
      "select id from socialapp.social_accounts where platform='instagram' and external_id=$1",
      [metaUserId]
    );
    return rows.map((r) => r.id);
  }
}

// Deauthorize / Disconnect: keep the row (so history and rules stay), wipe the tokens.
export async function disconnectAccounts(accountIds: string[]): Promise<number> {
  if (accountIds.length === 0) return 0;
  const rows = await query<{ id: string }>(
    `update socialapp.social_accounts
     set status='disconnected', access_token_enc=null, refresh_token_enc=null, token_expires_at=null, updated_at=now()
     where id = any($1::uuid[]) returning id`,
    [accountIds]
  );
  // Extra secrets of the newer networks (Bluesky app password). Column from migration 040.
  await query("update socialapp.social_accounts set secret_enc=null where id = any($1::uuid[]) and secret_enc is not null", [accountIds]).catch(() => undefined);
  await query(
    "update socialapp.dm_queue set status='skipped', last_error='Instagram account disconnected' where social_account_id = any($1::uuid[]) and status='pending'",
    [accountIds]
  );
  return rows.length;
}

// Data deletion: remove tokens, posts, messages, contacts and raw webhook events for these accounts.
export async function deleteAccountData(accountIds: string[]): Promise<number> {
  if (accountIds.length === 0) return 0;
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const accounts = await client.query<{ id: string; user_id: string; external_id: string }>(
      "select id, user_id, external_id from socialapp.social_accounts where id = any($1::uuid[]) for update",
      [accountIds]
    );
    for (const a of accounts.rows) {
      await client.query("delete from socialapp.dm_queue where social_account_id=$1", [a.id]);
      await client.query("delete from socialapp.contacts where social_account_id=$1", [a.id]);
      // Posts that only targeted this account go away entirely; multi-platform posts lose this target.
      const posts = await client.query<{ post_id: string }>(
        "delete from socialapp.post_targets where social_account_id=$1 returning post_id",
        [a.id]
      );
      const postIds = posts.rows.map((r) => r.post_id);
      if (postIds.length > 0) {
        await client.query(
          `delete from socialapp.scheduled_posts p where p.id = any($1::uuid[]) and p.user_id=$2
           and not exists (select 1 from socialapp.post_targets t where t.post_id = p.id)`,
          [postIds, a.user_id]
        );
      }
      await client.query(
        "delete from socialapp.events where source='meta' and payload->'entry' @> jsonb_build_array(jsonb_build_object('id', $1::text))",
        [a.external_id]
      );
      await client.query("delete from socialapp.social_accounts where id=$1", [a.id]);
    }
    await client.query("commit");
    return accounts.rows.length;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}
