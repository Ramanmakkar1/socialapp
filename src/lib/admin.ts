// Super-admin helpers: the admin allow-list, requireAdmin() and the audit log.
// The admin panel is invisible to everyone else: non-admins get a 404 (not a 403).
import { notFound } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

// Built-in admins (Raman) — always allowed, no env needed.
export const BUILTIN_ADMINS = ["townmedialabs@gmail.com", "raman@townmedialabs.ca"];

// The full allow-list: built-ins plus the comma-separated ADMIN_EMAILS env.
export function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...BUILTIN_ADMINS, ...fromEnv])];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export type AdminDecision = "admin" | "guest" | "non_admin";

// Pure decision used by requireAdmin() so it can be tested without a request context.
// Admin = allow-listed email AND that email proved (email_verified_at: Google sign-in, e-mailed code or reset).
// A password sign-up with an admin's address is never an admin: sign-up proves nothing.
export function adminDecision(user: CurrentUser | null): AdminDecision {
  if (!user) return "guest";
  return isAdminEmail(user.email) && user.emailVerified === true ? "admin" : "non_admin";
}

// For UI (e.g. the "Admin" link): same rule as requireAdmin().
export function isAdmin(user: CurrentUser | null): boolean {
  return adminDecision(user) === "admin";
}

// The logged-in admin, or a 404 for guests and non-admins alike. Call it in the admin layout AND
// in every admin page, route handler and server action (layouts are not a security boundary).
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || adminDecision(user) !== "admin") {
    notFound();
  }
  return user;
}

export type AuditTarget = {
  userId?: string | null;
  email?: string | null;
  details?: Record<string, unknown>;
};

// Records an admin action in socialapp.admin_audit. Best-effort: an audit failure
// never breaks the action itself.
export async function adminAudit(admin: CurrentUser, action: string, target?: AuditTarget): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await query(
      "insert into socialapp.admin_audit (admin_email, action, target_user_id, target_email, details) values ($1, $2, $3, $4, $5)",
      [admin.email, action, target?.userId ?? null, target?.email ?? null, JSON.stringify(target?.details ?? {})]
    );
  } catch {
    // audit is best-effort
  }
}
