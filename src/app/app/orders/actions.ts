"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isUuid } from "@/lib/leadMagnets";
import { normalizeRejectReason } from "@/lib/upi";
import { decideUpiOrder } from "@/lib/upiOrders";
import { requireWorkspaceUser } from "@/lib/workspace";

/**
 * Seller confirms or rejects one of their Direct UPI orders. Only an order still awaiting
 * confirmation changes (conditional update), so a double click never e-mails twice.
 * Confirm -> paid -> the buyer gets the receipt with the access link; reject -> reason e-mail.
 */
export async function decideUpiOrderAction(form: FormData): Promise<void> {
  const user = await requireWorkspaceUser("admin");
  const id = String(form.get("id") ?? "");
  const decision = form.get("decision") === "confirm" ? "confirm" : "reject";
  if (!isUuid(id)) redirect("/app/orders?upi=missing");
  let reason: string | null = null;
  if (decision === "reject") {
    reason = normalizeRejectReason(String(form.get("reason") ?? ""));
    if (!reason) redirect("/app/orders?upi=reason");
  }
  let result: "paid" | "rejected" | null;
  try {
    result = await decideUpiOrder(user.id, id, decision, reason);
  } catch (err) {
    console.error("UPI decision failed for user", user.id, err instanceof Error ? err.message : err);
    redirect("/app/orders?upi=error");
  }
  if (result) {
    const { inBackground, notifyUpiDecided } = await import("@/lib/emailNotify");
    inBackground("upi_decided", () => notifyUpiDecided(id));
  }
  revalidatePath("/app", "layout");
  redirect(`/app/orders?upi=${result ?? "missing"}`);
}
