"use server";

import { requireUser } from "@/lib/auth";
import { generateCaptionIdeas, isAiConfigured, type CaptionIdeasResult } from "@/lib/ai";

export async function suggestCaptions(input: {
  topic: string;
  draft?: string;
  tone?: string;
}): Promise<CaptionIdeasResult> {
  await requireUser();
  const topic = typeof input?.topic === "string" ? input.topic.trim() : "";
  if (!topic || topic.length > 300) {
    return { ok: false, error: "Describe the post in 1-300 characters." };
  }
  const draft = typeof input.draft === "string" ? input.draft.slice(0, 2000) : undefined;
  const tone = typeof input.tone === "string" ? input.tone.slice(0, 50) : undefined;
  return generateCaptionIdeas({ topic, draft, tone });
}

export async function aiAvailable(): Promise<boolean> {
  await requireUser();
  return isAiConfigured();
}
