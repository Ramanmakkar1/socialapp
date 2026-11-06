"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getPool, isDbConfigured, query } from "@/lib/db";
import { countChars, PLATFORM_LIMITS } from "@/lib/captionLimits";
import { checkCaption, type PlatformId } from "@/lib/platforms";
import { scheduledPostLimitError } from "@/lib/planLimits";
import { deletePostForUser, UUID_RE } from "@/lib/postMutations";

const ALLOWED_PLATFORMS: PlatformId[] = ["instagram", "facebook", "threads"];

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

type SavePostInput = {
  draftId?: string;
  caption: string;
  firstComment?: string;
  platforms: ("instagram" | "facebook" | "threads")[];
  overrides: Partial<Record<string, string>>;
  scheduledAt: string | null;
  mode: "draft" | "schedule";
  imageUrl?: string | null;
  mediaUrls?: string[];
  dmRuleId?: string | null;
  igFormat?: "feed" | "story";
};

type MediaItem = { type: "image" | "video"; url: string };

function parseMediaLink(
  trimmed: string,
): { ok: true; item: MediaItem } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error: "Media link must be a public https link to a .jpg, .png or .mp4 file.",
    };
  }
  const pathname = parsed.pathname.toLowerCase();
  let detectedType: "image" | "video" | null = null;
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg") || pathname.endsWith(".png")) {
    detectedType = "image";
  } else if (pathname.endsWith(".mp4") || pathname.endsWith(".mov")) {
    detectedType = "video";
  }
  if (parsed.protocol !== "https:" || trimmed.length > 2000 || !detectedType) {
    return {
      ok: false,
      error: "Media link must be a public https link to a .jpg, .png or .mp4 file.",
    };
  }
  return { ok: true, item: { type: detectedType, url: trimmed } };
}

function effectiveCaption(
  platform: PlatformId,
  caption: string,
  overrides: Partial<Record<string, string>>,
): string {
  if (Object.prototype.hasOwnProperty.call(overrides, platform)) {
    return overrides[platform] ?? "";
  }
  return caption;
}

export async function savePost(
  input: SavePostInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();

  if (
    input.draftId !== undefined &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.draftId)
  ) {
    return { ok: false, error: "Invalid draft." };
  }

  if (input.platforms.length === 0) {
    return { ok: false, error: "Select at least one platform." };
  }

  const platforms: PlatformId[] = [];
  for (const p of input.platforms) {
    if (!ALLOWED_PLATFORMS.includes(p)) {
      return { ok: false, error: "Invalid platform." };
    }
    if (p !== "instagram") {
      return {
        ok: false,
        error:
          "Facebook and Threads publishing is coming soon. For now, schedule this post for Instagram only.",
      };
    }
    platforms.push(p);
  }

  for (const platform of platforms) {
    const text = effectiveCaption(platform, input.caption, input.overrides);
    if (!text.trim()) {
      return { ok: false, error: "Add a caption for each selected platform." };
    }
    const check = checkCaption(platform, text);
    if (check.errors.length > 0) {
      return { ok: false, error: check.errors[0] ?? "Caption is too long." };
    }
  }

  const urlList =
    input.mediaUrls !== undefined
      ? input.mediaUrls.map((u) => u.trim()).filter((u) => u !== "")
      : input.imageUrl && input.imageUrl.trim() !== ""
        ? [input.imageUrl.trim()]
        : [];

  if (urlList.length > 10) {
    return { ok: false, error: "Up to 10 images per carousel." };
  }

  const mediaItems: MediaItem[] = [];
  for (const trimmed of urlList) {
    const parsed = parseMediaLink(trimmed);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }
    mediaItems.push(parsed.item);
  }

  if (mediaItems.length > 1 && mediaItems.some((m) => m.type === "video")) {
    return { ok: false, error: "Carousels can only have images for now." };
  }

  const igFormatRaw = input.igFormat;
  const igFormat = igFormatRaw === "story" ? "story" : "feed";
  const instagramSelected = platforms.includes("instagram");
  const firstComment = typeof input.firstComment === "string" ? input.firstComment.trim() : "";
  if (countChars(firstComment) > (PLATFORM_LIMITS.instagram.max ?? 2200)) {
    return { ok: false, error: "First comment must be 2,200 characters or fewer." };
  }

  if (igFormat === "story" && mediaItems.length > 1) {
    return { ok: false, error: "A Story takes one image or video." };
  }

  if (
    igFormat === "story" &&
    instagramSelected &&
    input.mode === "schedule" &&
    mediaItems.length !== 1
  ) {
    return {
      ok: false,
      error:
        mediaItems.length > 1
          ? "A Story takes one image or video."
          : "Instagram posts need an image or video link. Add one or untick Instagram.",
    };
  }

  if (platforms.includes("instagram") && input.mode === "schedule" && mediaItems.length === 0) {
    return {
      ok: false,
      error: "Instagram posts need an image or video link. Add one or untick Instagram.",
    };
  }

  let scheduledAt: Date | null = null;
  if (input.scheduledAt) {
    const parsed = new Date(input.scheduledAt);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid schedule time." };
    }
    scheduledAt = parsed;
  }

  if (input.mode === "schedule") {
    if (!scheduledAt) {
      return { ok: false, error: "Pick a schedule time." };
    }
    if (scheduledAt.getTime() <= Date.now() + 60_000) {
      return { ok: false, error: "Schedule time must be more than one minute from now." };
    }
  }

  if (input.mode === "schedule" && scheduledAt) {
    try {
      const connected = await query(
        "select 1 from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active' and access_token_enc is not null limit 1",
        [user.id],
      );
      if (connected.length === 0) {
        return {
          ok: false,
          error: "Connect Instagram in Settings before scheduling. You can save this post as a draft for now.",
        };
      }
      const limitError = await scheduledPostLimitError(user.id, scheduledAt, input.draftId ?? null);
      if (limitError) return { ok: false, error: limitError };
    } catch (err) {
      console.error("savePost: plan limit check failed", user.id, err instanceof Error ? err.message : err);
      return { ok: false, error: "Could not save post. Please try again." };
    }
  }

  const status = input.mode === "draft" ? "draft" : "scheduled";

  let dmRuleId: string | null = null;
  if (input.dmRuleId) {
    if (
      typeof input.dmRuleId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.dmRuleId)
    ) {
      return { ok: false, error: "Auto-DM rule not found" };
    }
    try {
      const owned = await query(
        "select 1 from socialapp.dm_rules where id = $1 and user_id = $2",
        [input.dmRuleId, user.id],
      );
      if (owned.length === 0) {
        return { ok: false, error: "Auto-DM rule not found" };
      }
    } catch {
      return { ok: false, error: "Auto-DM rule not found" };
    }
    dmRuleId = input.dmRuleId;
  }

  let client;
  try {
    client = await getPool().connect();
  } catch {
    return { ok: false, error: "Could not save post. Please try again." };
  }

  let id: string | undefined;
  try {
    await client.query("begin");

    if (input.draftId) {
      const locked = await client.query<{ status: string }>(
        "select status from scheduled_posts where id = $1 and user_id = $2 for update",
        [input.draftId, user.id],
      );
      if (locked.rows.length === 0) {
        await client.query("rollback");
        return {
          ok: false,
          error: "That draft wasn't found. It may have been deleted or belongs to another account.",
        };
      }
      if (locked.rows[0].status !== "draft") {
        await client.query("rollback");
        return {
          ok: false,
          error: "This post is no longer a draft. Manage it from your queue instead of the composer.",
        };
      }
      const strayTargets = await client.query(
        "select 1 from post_targets where post_id = $1 and status <> 'pending' limit 1",
        [input.draftId],
      );
      if (strayTargets.rows.length > 0) {
        await client.query("rollback");
        return {
          ok: false,
          error: "This draft can't be edited here because publishing has already started.",
        };
      }

      const postRes = await client.query<{ id: string }>(
        "update scheduled_posts set caption=$2, scheduled_at=$3, status=$4, media=$5::jsonb, dm_rule_id=$6, ig_format=$7, first_comment=$8, updated_at=now() where id=$1 returning id",
        [
          input.draftId,
          input.caption,
          scheduledAt,
          status,
          JSON.stringify(mediaItems),
          dmRuleId,
          instagramSelected ? igFormat : "feed",
          igFormat === "story" ? null : firstComment || null,
        ],
      );
      id = postRes.rows[0]?.id;
      if (!id) {
        await client.query("rollback");
        return { ok: false, error: "Could not save post." };
      }

      await client.query("delete from post_targets where post_id = $1", [id]);
    } else {
      const postRes = await client.query<{ id: string }>(
        "insert into scheduled_posts (user_id, caption, scheduled_at, status, media, dm_rule_id, ig_format, first_comment) values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8) returning id",
        [
          user.id,
          input.caption,
          scheduledAt,
          status,
          JSON.stringify(mediaItems),
          dmRuleId,
          instagramSelected ? igFormat : "feed",
          igFormat === "story" ? null : firstComment || null,
        ],
      );
      id = postRes.rows[0]?.id;
      if (!id) {
        await client.query("rollback");
        return { ok: false, error: "Could not save post." };
      }
    }

    for (const platform of platforms) {
      const customized = Object.prototype.hasOwnProperty.call(input.overrides, platform);
      const raw = customized ? input.overrides[platform] : undefined;
      const captionOverride = customized ? raw ?? "" : null;

      await client.query(
        "insert into post_targets (post_id, platform, caption_override) values ($1, $2, $3)",
        [id, platform, captionOverride],
      );
    }

    await client.query("commit");
  } catch {
    await client.query("rollback").catch(() => {});
    return { ok: false, error: "Could not save post." };
  } finally {
    client.release();
  }

  revalidatePath("/app/calendar");
  revalidatePath("/app");

  return { ok: true, id: id! };
}
