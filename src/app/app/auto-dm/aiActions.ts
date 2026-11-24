"use server";


import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { isAdmin } from "@/lib/admin";
import type { AiAvailability } from "@/components/AiOffNote";
import { generateDmIdeas, type DmIdeasResult } from "@/lib/ai";
import { consumeAiRequest } from "@/lib/aiQuota";
import { isDbConfigured, query } from "@/lib/db";
import { requireWorkspaceUser } from "@/lib/workspace";

export async function suggestDmMessages(input: {
  goal: string;
  keyword?: string;
  hasLink: boolean;
  emailGate?: boolean;
  tone?: string;
}): Promise<DmIdeasResult> {
  const user = await requireWorkspaceUser();
  const goal = typeof input?.goal === "string" ? input.goal.trim() : "";
  if (!goal || goal.length > 300) {
    return { ok: false, error: "Describe what the DM is for in 1-300 characters." };
  }
  const keyword =
    typeof input.keyword === "string" && input.keyword.trim() !== ""
      ? input.keyword.slice(0, 60)
      : undefined;
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
      const quota = await consumeAiRequest(user.id, "dm_ideas");
      if (!quota.ok) return { ok: false, error: quota.error };
    } catch (err) {
      console.error("ai quota check failed for user", user.id, err instanceof Error ? err.message : err);
      return { ok: false, error: "AI suggestions are not available right now. Please try again." };
    }
  }
  return generateDmIdeas({ goal, keyword, hasLink: input.hasLink, emailGate: input.emailGate, tone, brandVoice });
}

/** Whether AI is on (env or stored key), and whether this user may switch it on (admin). */
export async function dmAiAvailable(): Promise<AiAvailability> {
  const user = await requireWorkspaceUser();
  return { ready: await isFeatureReadyNow("ai"), isAdmin: isAdmin(user) };
}
