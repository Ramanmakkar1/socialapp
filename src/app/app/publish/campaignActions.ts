"use server";

import { revalidatePath } from "next/cache";

import { isDbConfigured } from "@/lib/db";
import { createCampaignForUser, type CampaignBriefInput, type CampaignResult } from "@/lib/campaign";
import { requireWorkspaceUser } from "@/lib/workspace";

/** Calendar "Campaign from brief": AI drafts N posts at proposed times. Saves drafts only. */
export async function createCampaign(input: CampaignBriefInput): Promise<CampaignResult> {
  const user = await requireWorkspaceUser();
  if (!isDbConfigured()) return { ok: false, error: "The database isn't set up on this server yet." };
  try {
    const result = await createCampaignForUser(user.id, input && typeof input === "object" ? input : {});
    if (result.ok) revalidatePath("/app/publish");
    return result;
  } catch (err) {
    console.error("createCampaign failed", user.id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not create the campaign. Please try again." };
  }
}
