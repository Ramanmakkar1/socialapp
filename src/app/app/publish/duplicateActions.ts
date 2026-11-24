"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getPool, isDbConfigured } from "@/lib/db";

export async function duplicatePost(id: string): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  let newId: string | undefined;
  try {
    const client = await getPool().connect();
    try {
      await client.query("begin");
      // Files of a published post are deleted after publishing (src/lib/mediaLifecycle.ts): the copy
      // leaves those out, so the composer asks for a fresh upload instead of showing a dead link.
      const result = await client.query<{ id: string }>(
        "insert into socialapp.scheduled_posts (caption, media, user_id, scheduled_at, status, ig_format, first_comment, dm_rule_id) select caption, (select coalesce(jsonb_agg(m), '[]'::jsonb) from jsonb_array_elements(media) m where coalesce(m->>'purged', '') <> 'true'), user_id, null, 'draft', ig_format, first_comment, dm_rule_id from socialapp.scheduled_posts where id=$1 and user_id=$2 returning id",
        [id, user.id],
      );
      if (!result.rows[0]) {
        await client.query("rollback");
        return { ok: false, error: "Post not found." };
      }
      await client.query(
        "insert into socialapp.post_targets (post_id, platform, social_account_id, youtube_channel_id, account_locked, caption_override, net_options, yt_metadata, status) select $2, platform, social_account_id, youtube_channel_id, account_locked, caption_override, net_options, yt_metadata, 'pending' from socialapp.post_targets where post_id=$1",
        [id, result.rows[0].id],
      );
      await client.query("commit");
      newId = result.rows[0].id;
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  } catch {
    return { ok: false, error: "Could not duplicate post." };
  }
  revalidatePath("/app/publish");
  return { ok: true, id: newId };
}
