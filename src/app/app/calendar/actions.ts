"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { checkCaption, type PlatformId } from "@/lib/platforms";

const ALLOWED_PLATFORMS: PlatformId[] = ["instagram", "facebook", "threads"];

type SavePostInput = {
  caption: string;
  platforms: ("instagram" | "facebook" | "threads")[];
  overrides: Partial<Record<string, string>>;
  scheduledAt: string | null;
  mode: "draft" | "schedule";
};

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

  try {
    const rows = await query<{ id: string }>(
      "insert into scheduled_posts (user_id, caption, scheduled_at, status) values ($1, $2, $3, $4) returning id",
      [user.id, input.caption, scheduledAt, status],
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
