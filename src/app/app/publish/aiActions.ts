"use server";


import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { isAdmin } from "@/lib/admin";
import type { AiAvailability } from "@/components/AiOffNote";
import { generateCaptionIdeas, generateNetworkVariants, type CaptionIdeasResult, type VariantsResult } from "@/lib/ai";
import { isKnownPlatform } from "@/lib/captionFit";
import type { PlatformId } from "@/lib/platforms";
import { consumeAiRequest } from "@/lib/aiQuota";
import { isDbConfigured, query } from "@/lib/db";
import { requireWorkspaceUser } from "@/lib/workspace";

export async function suggestCaptions(input: {
  topic: string;
  draft?: string;
  tone?: string;
}): Promise<CaptionIdeasResult> {
  const user = await requireWorkspaceUser();
  const topic = typeof input?.topic === "string" ? input.topic.trim() : "";
  if (!topic || topic.length > 300) {
    return { ok: false, error: "Describe the post in 1-300 characters." };
  }
  const draft = typeof input.draft === "string" ? input.draft.slice(0, 2000) : undefined;
  const tone = typeof input.tone === "string" ? input.tone.slice(0, 50) : undefined;
  let brandVoice: string | undefined;
  if (isDbConfigured()) {
    try {
      const rows = await query<{ brand_voice: string | null }>(
        "select brand_voice from socialapp.users where id=$1",
        [user.id],
      );
      const v = rows[0]?.brand_voice?.trim();
      if (v) brandVoice = v.slice(0, 500);
    } catch {
      /* column may not exist yet; ignore */
    }
  }
  if (!(await isFeatureReadyNow("ai"))) {
    return {
      ok: false,
      error:
        "AI ideas aren't switched on on this server yet. You can still write and schedule everything yourself.",
    };
  }
  // Per-user limits: a short burst limit and a monthly quota (src/lib/aiQuota.ts).
  if (isDbConfigured()) {
    try {
      const quota = await consumeAiRequest(user.id, "caption_ideas");
      if (!quota.ok) return { ok: false, error: quota.error };
    } catch (err) {
      console.error("ai quota check failed for user", user.id, err instanceof Error ? err.message : err);
      return { ok: false, error: "AI suggestions are not available right now. Please try again." };
    }
  }
  return generateCaptionIdeas({ topic, draft, tone, brandVoice });
}

/** Whether AI is on (env or stored key), and whether this user may switch it on (admin). */
export async function aiAvailable(): Promise<AiAvailability> {
  const user = await requireWorkspaceUser();
  return { ready: await isFeatureReadyNow("ai"), isAdmin: isAdmin(user) };
}

async function brandVoiceFor(userId: string): Promise<string | undefined> {
  if (!isDbConfigured()) return undefined;
  try {
    const rows = await query<{ brand_voice: string | null }>("select brand_voice from socialapp.users where id=$1", [userId]);
    return rows[0]?.brand_voice?.trim().slice(0, 500) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Composer "Tailor per network": one caption per selected network, fitted to each network's limits.
 * The composer puts them in the per-network fields (post_targets.caption_override at save time).
 */
export async function tailorCaptions(input: { caption: string; platforms: string[] }): Promise<VariantsResult> {
  const user = await requireWorkspaceUser();
  const caption = typeof input?.caption === "string" ? input.caption.trim() : "";
  if (!caption) return { ok: false, error: "Write the main caption first, then tailor it per network." };
  if (caption.length > 5000) return { ok: false, error: "The caption is too long to tailor (5,000 characters max)." };
  const platforms = (Array.isArray(input.platforms) ? input.platforms : []).filter(
    (p): p is PlatformId => typeof p === "string" && isKnownPlatform(p),
  );
  if (platforms.length === 0) return { ok: false, error: "Select at least one network." };
  if (!(await isFeatureReadyNow("ai"))) {
    return { ok: false, error: "AI isn't configured on this server yet. You can still customize each network by hand." };
  }
  if (isDbConfigured()) {
    try {
      const quota = await consumeAiRequest(user.id, "caption_variants");
      if (!quota.ok) return { ok: false, error: quota.error };
    } catch (err) {
      console.error("ai quota check failed for user", user.id, err instanceof Error ? err.message : err);
      return { ok: false, error: "AI suggestions are not available right now. Please try again." };
    }
  }
  // Mastodon servers can allow more than 500 characters (stored when the account was connected).
  const maxOverrides: Partial<Record<string, number>> = {};
  if (platforms.includes("mastodon") && isDbConfigured()) {
    try {
      const [row] = await query<{ max: number | null }>(
        "select (meta->>'maxChars')::int as max from socialapp.social_accounts where user_id=$1 and platform='mastodon' and status='active' order by created_at limit 1",
        [user.id],
      );
      if (row?.max) maxOverrides.mastodon = row.max;
    } catch {
      /* default 500 */
    }
  }
  return generateNetworkVariants({ caption, platforms, brandVoice: await brandVoiceFor(user.id), maxOverrides });
}
