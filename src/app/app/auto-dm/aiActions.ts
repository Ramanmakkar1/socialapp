"use server";

import { requireUser } from "@/lib/auth";
import { generateDmIdeas, isAiConfigured, type DmIdeasResult } from "@/lib/ai";
import { isDbConfigured, query } from "@/lib/db";

export async function suggestDmMessages(input: {
  goal: string;
  keyword?: string;
  hasLink: boolean;
  emailGate?: boolean;
  tone?: string;
}): Promise<DmIdeasResult> {
  const user = await requireUser();
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
  return generateDmIdeas({ goal, keyword, hasLink: input.hasLink, emailGate: input.emailGate, tone, brandVoice });
}

export async function dmAiAvailable(): Promise<boolean> {
  await requireUser();
  return isAiConfigured();
}
