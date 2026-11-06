// Server only: guarded delete / reschedule for scheduled posts.
// Each change is ONE conditional statement, so it cannot race the publisher's claim
// (the claim locks the post row and flips it to 'publishing' in the same transaction).
import { query } from "@/lib/db";

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
