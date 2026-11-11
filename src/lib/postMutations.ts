// Server only: guarded delete / reschedule for scheduled posts.
// Each change is ONE conditional statement, so it cannot race the publisher's claim
// (the claim locks the post row and flips it to 'publishing' in the same transaction).
import { getPool, query } from "@/lib/db";
import { reassignQueueTimes } from "@/lib/postingSchedule";

export type MutationResult = { ok: true } | { ok: false; error: string };

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PostState = {
  status: string;
  scheduled_at: Date | string | null;
  publishing: boolean;
  published: boolean;
  started: boolean;
};

async function postState(id: string, userId: string): Promise<PostState | null> {
  const rows = await query<PostState>(
    `select p.status, p.scheduled_at,
       exists(select 1 from socialapp.post_targets t where t.post_id=p.id and t.status='publishing') as publishing,
       exists(select 1 from socialapp.post_targets t where t.post_id=p.id and t.status='published') as published,
       exists(select 1 from socialapp.post_targets t where t.post_id=p.id and t.status <> 'pending') as started
     from socialapp.scheduled_posts p where p.id=$1 and p.user_id=$2`,
    [id, userId],
  );
  return rows[0] ?? null;
}

function blockedReason(state: PostState | null, verb: "deleted" | "moved"): string {
  if (!state) return "Post not found. It may have been deleted already.";
  if (state.status === "publishing" || state.publishing) {
    return `This post is being published right now, so it can't be ${verb}. Check back in a few minutes.`;
  }
  if (state.status === "published" || state.published) {
    return verb === "deleted"
      ? "This post is already published on Instagram. Delete it in Instagram if you want it gone."
      : "This post is already published, so it can't be moved.";
  }
  if (verb === "moved") {
    if (state.status === "failed") return "This post failed to publish. Use Retry instead of moving it.";
    if (state.started) return "Publishing has already started for this post, so it can't be moved.";
    return "This post changed while you were moving it. Reload and try again.";
  }
  return "Could not delete post.";
}

/** Deletes a draft / scheduled / failed post, never one the publisher has claimed or published (bug b). */
export async function deletePostForUser(id: string, userId: string): Promise<MutationResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid post." };
  const deleted = await query<{ id: string }>(
    `delete from socialapp.scheduled_posts p
     where p.id=$1 and p.user_id=$2 and p.status in ('draft','scheduled','failed')
       and not exists (select 1 from socialapp.post_targets t where t.post_id=p.id and t.status in ('publishing','published'))
     returning p.id`,
    [id, userId],
  );
  if (deleted.length > 0) return { ok: true };
  return { ok: false, error: blockedReason(await postState(id, userId), "deleted") };
}

/** UTC instant for `dateKey` keeping the post's time of day (UTC, same as the calendar grid). */
export function movedInstant(current: Date | string | null, dateKey: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  let hours = 12;
  let minutes = 0;
  let seconds = 0;
  if (current) {
    const old = new Date(current);
    if (!Number.isNaN(old.getTime())) {
      hours = old.getUTCHours();
      minutes = old.getUTCMinutes();
      seconds = old.getUTCSeconds();
    }
  }
  const [y, mo, d] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(y, mo - 1, d, hours, minutes, seconds));
  if (Number.isNaN(next.getTime()) || next.toISOString().slice(0, 10) !== dateKey) return null;
  return next;
}

/**
 * Moves a scheduled post or draft to another day. Blocked once the publisher has claimed it
 * or any target left 'pending', and only applied if the time did not change underneath us (bug c).
 */
export async function reschedulePostForUser(
  id: string,
  userId: string,
  dateKey: string,
  beforeUpdate?: (next: Date, state: PostState) => Promise<string | null>,
): Promise<MutationResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid post." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return { ok: false, error: "Invalid day." };
  const state = await postState(id, userId);
  if (!state) return { ok: false, error: blockedReason(null, "moved") };
  if ((state.status !== "scheduled" && state.status !== "draft") || state.started) {
    return { ok: false, error: blockedReason(state, "moved") };
  }
  const next = movedInstant(state.scheduled_at, dateKey);
  if (!next) return { ok: false, error: "Invalid day." };
  if (next.getTime() <= Date.now() + 60_000) return { ok: false, error: "Pick a day in the future." };
  if (beforeUpdate) {
    const problem = await beforeUpdate(next, state);
    if (problem) return { ok: false, error: problem };
  }
  const previous = state.scheduled_at ? new Date(state.scheduled_at).toISOString() : null;
  const rows = await query<{ id: string }>(
    `update socialapp.scheduled_posts p set scheduled_at=$3, updated_at=now()
     where p.id=$1 and p.user_id=$2 and p.status in ('scheduled','draft')
       and p.scheduled_at is not distinct from $4::timestamptz
       and not exists (select 1 from socialapp.post_targets t where t.post_id=p.id and t.status <> 'pending')
     returning p.id`,
    [id, userId, next.toISOString(), previous],
  );
  if (rows.length > 0) return { ok: true };
  return { ok: false, error: blockedReason(await postState(id, userId), "moved") };
}

export const SHARE_DRAFT_ERROR = "Drafts can't be shared right away. Open the draft and schedule it first.";

/**
 * "Share now": make a scheduled post due immediately so the publisher claims it on its next tick.
 * One conditional statement, so it cannot race the publisher's claim (which flips status to
 * 'publishing' in the same transaction). Only scheduled posts qualify: a draft has not passed the
 * scheduling checks (connected account, media) yet. `beforeShare` runs the monthly plan-limit check
 * for "now" (the post moves into the current month), exactly like saving or rescheduling.
 */
export async function sharePostNow(
  id: string,
  userId: string,
  beforeShare?: (now: Date) => Promise<string | null>,
): Promise<MutationResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid post." };
  const state = await postState(id, userId);
  if (state?.status === "draft") return { ok: false, error: SHARE_DRAFT_ERROR };
  if (state && state.status === "scheduled" && beforeShare) {
    const problem = await beforeShare(new Date());
    if (problem) return { ok: false, error: problem };
  }
  const rows = await query<{ id: string }>(
    `update socialapp.scheduled_posts p
     set scheduled_at = now(), status = 'scheduled', updated_at = now()
     where p.id=$1 and p.user_id=$2 and p.status = 'scheduled'
       and not exists (select 1 from socialapp.post_targets t where t.post_id=p.id and t.status in ('publishing','published'))
     returning p.id`,
    [id, userId],
  );
  if (rows.length > 0) return { ok: true };
  return { ok: false, error: blockedReason(await postState(id, userId), "moved") };
}

/**
 * Drag reorder of the publishing queue. Locks the rows, refuses if any is mid-publish, then
 * reassigns queue_order and the publish times (reassignQueueTimes) so the new order is the
 * publish order. Status is preserved (a draft stays a draft, just with a planned time).
 */
export async function reorderQueueForUser(orderedIds: string[], userId: string): Promise<MutationResult> {
  if (orderedIds.length === 0) return { ok: true };
  if (orderedIds.length > 100) return { ok: false, error: "Too many posts to reorder at once." };
  if (orderedIds.some((id) => !UUID_RE.test(id))) return { ok: false, error: "Invalid post." };

  let client;
  try {
    client = await getPool().connect();
  } catch {
    return { ok: false, error: "Could not reorder the queue." };
  }
  try {
    await client.query("begin");
    const res = await client.query<{ id: string; status: string; scheduled_at: Date | string | null }>(
      `select id, status, scheduled_at from socialapp.scheduled_posts
       where user_id=$1 and id = any($2::uuid[]) and status in ('draft','scheduled')
       for update`,
      [userId, orderedIds],
    );
    const found = new Set(res.rows.map((r) => r.id));
    if (orderedIds.some((id) => !found.has(id))) {
      await client.query("rollback");
      return { ok: false, error: "A post in the queue can no longer be reordered. Reload and try again." };
    }
    for (const row of res.rows) {
      const started = await client.query(
        "select 1 from socialapp.post_targets t where t.post_id=$1 and t.status <> 'pending' limit 1",
        [row.id],
      );
      if (started.rows.length > 0) {
        await client.query("rollback");
        return { ok: false, error: "A post in the queue is being published. Reload and try again." };
      }
    }
    const byId = new Map(res.rows.map((r) => [r.id, r]));
    const ordered = orderedIds.map((id) => {
      const row = byId.get(id)!;
      return { id: row.id, scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).getTime() : null };
    });
    const times = reassignQueueTimes(ordered, Date.now());
    for (let i = 0; i < ordered.length; i++) {
      const post = ordered[i];
      const instant = times.get(post.id);
      if (instant === undefined) continue;
      await client.query(
        "update socialapp.scheduled_posts set scheduled_at=$2, queue_order=$3, updated_at=now() where id=$1",
        [post.id, new Date(instant).toISOString(), i],
      );
    }
    await client.query("commit");
    return { ok: true };
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error("reorderQueueForUser failed", err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not reorder the queue." };
  } finally {
    client.release();
  }
}
