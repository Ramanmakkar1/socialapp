"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { readDeliveryFields, readRuleIds } from "@/lib/digitalDelivery";
import { deleteLeadMagnet, saveLeadMagnet } from "@/lib/leadMagnets";

export type FormState = { errors?: string[] } | undefined;

export async function saveLeadMagnetAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = typeof form.get("id") === "string" && form.get("id") ? String(form.get("id")) : null;
  const { values, errors } = readDeliveryFields(form);
  if (errors.length > 0) return { errors };
  let savedId: string | null;
  try {
    savedId = await saveLeadMagnet(user.id, id, values, readRuleIds(form));
  } catch (err) {
    console.error("saveLeadMagnet failed for user", user.id, err instanceof Error ? err.message : err);
    return { errors: ["Could not save the lead magnet. Please try again."] };
  }
  if (!savedId) return { errors: ["This lead magnet no longer exists."] };
  revalidatePath("/app/lead-magnets");
  redirect(`/app/lead-magnets/${savedId}?saved=1`);
}

export async function deleteLeadMagnetAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(form.get("id") ?? "");
  try {
    await deleteLeadMagnet(user.id, id);
  } catch (err) {
    console.error("deleteLeadMagnet failed for user", user.id, err instanceof Error ? err.message : err);
    redirect(`/app/lead-magnets/${id}?error=delete`);
  }
  revalidatePath("/app/lead-magnets");
  redirect("/app/lead-magnets?deleted=1");
}
