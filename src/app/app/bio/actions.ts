"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDbConfigured } from "@/lib/db";
import { saveBioPage, type BioLinkInput } from "@/lib/bioPage";
import { requireWorkspaceUser } from "@/lib/workspace";

export async function saveBioPageAction(formData: FormData): Promise<void> {
  const user = await requireWorkspaceUser();
  if (!isDbConfigured()) redirect("/app/bio?error=not_configured");

  const ids = formData.getAll("link_id").map(String);
  const labels = formData.getAll("link_label").map(String);
  const urls = formData.getAll("link_url").map(String);
  const links: BioLinkInput[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]?.trim() ?? "";
    const url = urls[i]?.trim() ?? "";
    if (!label && !url) continue;
    links.push({ id: ids[i]?.trim() || undefined, label, url });
  }

  let error: string | null = null;
  try {
    await saveBioPage(user.id, {
      handle: String(formData.get("handle") ?? ""),
      displayName: String(formData.get("display_name") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      avatarUrl: String(formData.get("avatar_url") ?? ""),
      theme: String(formData.get("theme") ?? "sunrise"),
      published: formData.get("published") === "on",
      links,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "We couldn't save your page. Please try again.";
  }

  if (error) redirect(`/app/bio?error=${encodeURIComponent(error)}`);
  revalidatePath("/app/bio");
  redirect("/app/bio?saved=1");
}
