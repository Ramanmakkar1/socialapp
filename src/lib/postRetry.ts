// Retrying a failed post: the one code path behind the calendar's "Retry" (src/app/app/publish/
// retryActions.ts, for the post's owner) and the admin's "Retry" (src/app/admin/posts/actions.ts).
// The post goes back to 'scheduled' (now, or its later scheduled time) and its failed targets to
// 'pending', in one transaction; the publish worker picks it up on its next run.
import { getPool } from "@/lib/db";
import { scheduledPostLimitError } from "@/lib/planLimits";

export type RetryResult = { ok: true } | { ok: false; error: string };

/** Retries `postId` owned by `userId`. The owner's monthly plan limit still applies. */
export async function retryFailedPost(postId: string, userId: string): Promise<RetryResult> {
  try {
    // A failed post does not count toward the monthly limit; retrying puts it back in the queue.
    const limitError = await scheduledPostLimitError(userId, new Date(), postId);
    if (limitError) return { ok: false, error: limitError };
  } catch (err) {
    console.error("retryPost: plan limit check failed", postId, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not retry post." };
  }
  let client;
  try {
    client = await getPool().connect();
  } catch {
    return { ok: false, error: "Could not retry post." };
  }

  try {
    await client.query("begin");

    const postRes = await client.query<{ id: string }>(
      "update scheduled_posts set status='scheduled', scheduled_at = greatest(coalesce(scheduled_at, now()), now()), updated_at = now() where id=$1 and user_id=$2 and status='failed' returning id",
      [postId, userId],
    );
    if (!postRes.rows[0]) {
      await client.query("rollback");
      return { ok: false, error: "Post not found." };
    }

    const targetRes = await client.query<{ id: string }>(
      // A manual retry starts the automatic-retry budget again (src/lib/publishRetry.ts).
      "update post_targets set status='pending', error=null, error_kind=null, error_raw=null, attempt_count=0, next_retry_at=null where post_id=$1 and status='failed' returning id",
      [postId],
    );
    if (targetRes.rowCount === 0) {
      await client.query("rollback");
      return { ok: false, error: "Could not retry post." };
    }

    await client.query("commit");
  } catch {
    await client.query("rollback").catch(() => {});
    return { ok: false, error: "Could not retry post." };
  } finally {
    client.release();
  }
  return { ok: true };
}

/**
 * "Retry now" on a post whose targets are waiting for an automatic retry ('retrying'): bring the
 * next attempt forward to the worker's next run. Returns false when nothing was waiting.
 */
export async function retryWaitingNow(postId: string, userId: string): Promise<boolean> {
  const res = await getPool().query<{ id: string }>(
    `update socialapp.post_targets t set next_retry_at=now()
     from socialapp.scheduled_posts p
     where t.post_id=p.id and p.id=$1 and p.user_id=$2 and p.status='scheduled' and t.status='retrying'
     returning t.id`,
    [postId, userId],
  );
  return (res.rowCount ?? 0) > 0;
}
