"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import type { PlatformId } from "@/lib/platforms";
import { nextSlot, nextSlotForChannel, type ChannelSchedule } from "@/lib/postingSchedule";
import { deletePostForUser, reorderQueueForUser, sharePostNow, UUID_RE } from "@/lib/postMutations";
import { ALLOWED_PLATFORMS, savePostForUser, type SavePostInput } from "@/lib/savePost";
import { hashtagGroupValidationError, parseHashtagGroup, type SavedHashtagGroup } from "@/lib/hashtagSets";
import { parseTags } from "@/lib/tagFilter";
import { TEMPLATES_LIST_SQL, templateDeleteResult, templateValidationError, type PostTemplate } from "@/lib/templates";

export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  try {
    const result = await deletePostForUser(id, user.id);
    if (!result.ok) return result;
    revalidatePath("/app/calendar");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    console.error("deletePost failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not delete post." };
  }
}

export async function savePost(
  input: SavePostInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  const result = await savePostForUser(user.id, input);
  if (result.ok) {
    revalidatePath("/app/calendar");
    revalidatePath("/app");
  }
  return result;
}

// Drag reorder of the publishing queue: reassigns queue_order and the publish times.
export async function reorderQueue(orderedIds: string[]): Promise<{ ok: boolean; error?: string }> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }
  const user = await requireUser();
  try {
    const result = await reorderQueueForUser(orderedIds, user.id);
    if (!result.ok) return result;
    revalidatePath("/app/calendar");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    console.error("reorderQueue failed", err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not reorder the queue." };
  }
}

// "Next available": the next free slot across the user's channel schedules for the given
// platforms. The composer fills its time picker with the result.
export async function nextAvailableSlot(
  platforms: string[],
): Promise<{ ok: true; iso: string; timeZone: string } | { ok: false; error: string }> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }
  const user = await requireUser();
  const valid = platforms.filter((p) => (ALLOWED_PLATFORMS as string[]).includes(p));
  if (valid.length === 0) {
    return { ok: false, error: "Select at least one platform." };
  }
  let rows: { platform: string; timezone: string; days: number[]; times: string[] }[];
  try {
    rows = await query(
      "select platform, timezone, days, times from socialapp.posting_schedules where user_id=$1",
      [user.id],
    );
  } catch {
    rows = [];
  }
  const schedules: ChannelSchedule[] = rows
    .filter((row) => valid.includes(row.platform))
    .map((row) => ({
      platform: row.platform as PlatformId,
      timezone: row.timezone,
      days: row.days ?? [],
      times: row.times ?? [],
    }));
  const nowMs = Date.now();
  const slotMs = nextSlot(schedules, nowMs);
  const schedule = schedules.find((candidate) => nextSlotForChannel(candidate, nowMs) === slotMs);
  if (slotMs === null || !schedule) {
    return {
      ok: false,
      error: "Set a posting schedule in Settings → Channels first, then use “Next available”.",
    };
  }
  return { ok: true, iso: new Date(slotMs).toISOString(), timeZone: schedule.timezone || "UTC" };
}

// "Share now": publish a queued post immediately by making it due for the publisher.
export async function shareNow(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }
  const user = await requireUser();
  try {
    const result = await sharePostNow(id, user.id);
    if (!result.ok) return result;
    revalidatePath("/app/calendar");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    console.error("shareNow failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not share this post now." };
  }
}

export async function listTemplates(): Promise<PostTemplate[]> {
  if (!isDbConfigured()) return [];
  try {
    const user = await requireUser();
    return await query<PostTemplate>(TEMPLATES_LIST_SQL, [user.id]);
  } catch {
    // A pending migration must not hide the post composer.
    return [];
  }
}

export async function saveTemplate(input: {
  name: string;
  caption: string;
  firstComment?: string;
  tags?: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isDbConfigured()) return { ok: false, error: "Database not configured" };
  const validationError = templateValidationError(input);
  if (validationError) return { ok: false, error: validationError };
  const user = await requireUser();
  try {
    await query(
      "insert into socialapp.post_templates (user_id, name, caption, first_comment, tags) values ($1, $2, $3, $4, $5)",
      [user.id, input.name.trim(), input.caption, input.firstComment?.trim() || null, parseTags(input.tags)],
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the template. Please try again." };
  }
}

export async function deleteTemplate(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid template." };
  if (!isDbConfigured()) return { ok: false, error: "Database not configured" };
  const user = await requireUser();
  try {
    const res = await query<{ id: string }>(
      "delete from socialapp.post_templates where id=$1 and user_id=$2 returning id",
      [id, user.id],
    );
    return templateDeleteResult(res);
  } catch {
    return { ok: false, error: "Could not delete the template." };
  }
}

export async function listHashtagGroups(): Promise<SavedHashtagGroup[]> {
  if (!isDbConfigured()) return [];
  try {
    const user = await requireUser();
    return await query<SavedHashtagGroup>(
      "select id, name, hashtags, created_at from socialapp.hashtag_groups where user_id = $1 order by created_at desc",
      [user.id],
    );
  } catch {
    return [];
  }
}

export async function saveHashtagGroup(input: {
  name: string;
  hashtags: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isDbConfigured()) return { ok: false, error: "Database not configured" };
  const hashtags = parseHashtagGroup(input.hashtags);
  const validationError = hashtagGroupValidationError(input.name, hashtags);
  if (validationError) return { ok: false, error: validationError };
  const user = await requireUser();
  try {
    await query(
      "insert into socialapp.hashtag_groups (user_id, name, hashtags) values ($1, $2, $3)",
      [user.id, input.name.trim(), hashtags],
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the hashtag group. Please try again." };
  }
}

export async function deleteHashtagGroup(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid hashtag group." };
  if (!isDbConfigured()) return { ok: false, error: "Database not configured" };
  const user = await requireUser();
  try {
    const res = await query<{ id: string }>(
      "delete from socialapp.hashtag_groups where id=$1 and user_id=$2 returning id",
      [id, user.id],
    );
    return res.length > 0 ? { ok: true } : { ok: false, error: "Hashtag group not found." };
  } catch {
    return { ok: false, error: "Could not delete the hashtag group." };
  }
}
