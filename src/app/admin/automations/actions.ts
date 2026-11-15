"use server";

// Admin → Automations actions: requireAdmin(), validated input, audit-logged.
import { revalidatePath } from "next/cache";
import { adminAudit, requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/adminPaging";
import { isDbConfigured, query } from "@/lib/db";
import type { AdminActionState } from "../ui/ActionForm";

/**
 * Pauses an active Auto-DM rule (the same status the user's own pause switch sets in
 * /app/auto-dm; the send worker skips queued DMs of paused rules). Pause only: turning a
 * rule back on stays with its owner.
 */
export async function pauseRuleAdminAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const ruleId = formData.get("ruleId");
  if (!isUuid(ruleId)) return { ok: false, message: "Invalid rule." };
  if (!isDbConfigured()) return { ok: false, message: "Database not configured." };

  const rows = await query<{ user_id: string; name: string | null; email: string }>(
    `update socialapp.dm_rules r set status = 'paused', updated_at = now()
       from socialapp.users u
      where r.id = $1 and r.status = 'active' and u.id = r.user_id
      returning r.user_id, r.name, u.email`,
    [ruleId],
  );
  const rule = rows[0];
  if (!rule) return { ok: false, message: "Rule not found or already paused." };
  await adminAudit(admin, "dm_rule.pause", { userId: rule.user_id, email: rule.email, details: { ruleId, name: rule.name } });
  revalidatePath("/admin/automations");
  return { ok: true, message: "Paused. The owner can turn it back on in Auto-DM." };
}
