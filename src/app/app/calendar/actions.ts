"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { checkCaption, type PlatformId } from "@/lib/platforms";

const ALLOWED_PLATFORMS: PlatformId[] = ["instagram", "facebook", "threads"];

export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  try {
    await query(
      "delete from scheduled_posts where id = $1 and user_id = $2 and status in ('draft','scheduled','failed')",
      [id, user.id],
    );
    revalidatePath("/app/calendar");
    revalidatePath("/app");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete post." };
  }
}

type SavePostInput = {
  caption: string;
  platforms: ("instagram" | "facebook" | "threads")[];
  overrides: Partial<Record<string, string>>;
  scheduledAt: string | null;
  mode: "draft" | "schedule";
  imageUrl?: string | null;
  mediaUrls?: string[];
  dmRuleId?: string | null;
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

  try {
    const rows = await query<{ id: string }>(
      "insert into scheduled_posts (user_id, caption, scheduled_at, status, media, dm_rule_id) values ($1, $2, $3, $4, $5::jsonb, $6) returning id",
      [user.id, input.caption, scheduledAt, status, JSON.stringify(mediaItems), dmRuleId],
    );
    const id = rows[0]?.id;
    if (!id) {
      return { ok: false, error: "Could not save post." };
    }

    for (const platform of platforms) {
      const customized = Object.prototype.hasOwnProperty.call(input.overrides, platform);
      const raw = customized ? input.overrides[platform] : undefined;
      const captionOverride =
        customized && raw !== undefined && raw.trim() !== "" ? raw : null;

      await query(
        "insert into post_targets (post_id, platform, caption_override) values ($1, $2, $3)",
        [id, platform, captionOverride],
      );
    }

    revalidatePath("/app/calendar");
    revalidatePath("/app");

    return { ok: true, id };
  } catch {
    return { ok: false, error: "Could not save post." };
  }
}
