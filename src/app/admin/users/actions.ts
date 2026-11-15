"use server";

// Admin → Users actions. Each one calls requireAdmin() (404 for everyone else), validates its
// input and writes an admin_audit row. Only actions the app already supports live here:
// there is no plan override, no account disable flag and no impersonation in the codebase.
import { revalidatePath } from "next/cache";
import { adminAudit, requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/adminPaging";
import { isDbConfigured, query } from "@/lib/db";
import { sendVerification } from "@/lib/emailNotify";
import { isFeatureReady } from "@/lib/featureReadiness";
import { rateLimit, tooManyMessage } from "@/lib/rateLimit";
import type { AdminActionState } from "../ui/ActionForm";

/** Re-sends the verification e-mail (same sendVerification + rate-limit key as the user's own "Resend"). */
export async function resendVerificationAdminAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const userId = formData.get("userId");
  if (!isUuid(userId)) return { ok: false, message: "Invalid user." };
  if (!isDbConfigured()) return { ok: false, message: "Database not configured." };
  if (!isFeatureReady("email")) return { ok: false, message: "E-mail isn't switched on (SMTP_HOST is not set), so nothing can be sent." };

  const rows = await query<{ id: string; email: string; name: string | null; verified: boolean }>(
    "select id, email, name, (email_verified_at is not null) as verified from socialapp.users where id = $1",
    [userId],
  );
  const user = rows[0];
  if (!user) return { ok: false, message: "User not found." };
  if (user.verified) return { ok: false, message: "This email is already verified." };

  const limited = rateLimit(`verify-send:${user.id}`, 3, 15 * 60 * 1000);
  if (!limited.ok) return { ok: false, message: tooManyMessage(limited.retryAfterMs) };

  let sent = false;
  try {
    sent = await sendVerification(user);
  } catch (err) {
    console.error("admin resend verification failed", err instanceof Error ? err.message.slice(0, 160) : "error");
  }
  await adminAudit(admin, "user.resend_verification", { userId: user.id, email: user.email, details: { sent } });
  revalidatePath(`/admin/users/${user.id}`);
  return sent ? { ok: true, message: `Sent a new code to ${user.email}.` } : { ok: false, message: "The e-mail couldn't be sent. Check SMTP and try again." };
}
