"use server";

import { requireUser } from "@/lib/auth";
import { generateCaptionIdeas, isAiConfigured, type CaptionIdeasResult } from "@/lib/ai";
import { isDbConfigured, query } from "@/lib/db";

export async function suggestCaptions(input: {
  topic: string;
  draft?: string;
  tone?: string;
}): Promise<CaptionIdeasResult> {
  const user = await requireUser();
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
  return generateCaptionIdeas({ topic, draft, tone, brandVoice });
}

export async function aiAvailable(): Promise<boolean> {
  await requireUser();
  return isAiConfigured();
}
