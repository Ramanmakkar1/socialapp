"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export async function saveBrandVoice(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = formData.get("brand_voice");
  const trimmed = typeof raw === "string" ? raw.trim().slice(0, 500) : "";
  const value = trimmed === "" ? null : trimmed;
  if (!isDbConfigured()) return;
  await query("update socialapp.users set brand_voice=$2 where id=$1", [user.id, value]);
  revalidatePath("/app/settings");
  redirect("/app/settings?voice=saved");
}
