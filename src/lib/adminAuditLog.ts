// Admin → Audit log: socialapp.admin_audit (033), written by adminAudit() in src/lib/admin.ts.
import { query } from "@/lib/db";
import { ADMIN_PAGE_SIZE, containsPattern, pageSlice, pageWindow } from "@/lib/adminPaging";

/** Actions the code writes today (the filter also lists any other action found in the table). */
export const KNOWN_AUDIT_ACTIONS = ["ai_key.save", "ai_key.remove", "ai_key.test", "user.resend_verification", "post.retry", "dm_rule.pause"] as const;

export type AuditRow = {
  id: string;
  admin_email: string;
  action: string;
  target_user_id: string | null;
  target_email: string | null;
  details: Record<string, unknown> | null;
  created_at: Date;
};

export type AuditFilter = { action: string; admin: string; target: string; page: number };

export async function listAudit(f: AuditFilter): Promise<{ rows: AuditRow[]; hasNext: boolean }> {
  const { limit, offset } = pageWindow(f.page);
  const rows = await query<AuditRow>(
    `select id::text, admin_email, action, target_user_id, target_email, details, created_at
       from socialapp.admin_audit
      where ($1::text is null or action = $1::text)
        and ($2::text is null or admin_email = $2::text)
        and ($3::text is null or target_email ilike $3::text)
      order by created_at desc, id desc
      limit $4 offset $5`,
    [f.action || null, f.admin || null, containsPattern(f.target), limit, offset],
  );
  return pageSlice(rows, ADMIN_PAGE_SIZE);
}

/** Filter choices: known actions plus whatever is in the table, and every admin who acted. */
export async function auditFilterOptions(): Promise<{ actions: string[]; admins: string[] }> {
  const [actions, admins] = await Promise.all([
    query<{ action: string }>("select distinct action from socialapp.admin_audit order by 1 limit 200"),
    query<{ admin_email: string }>("select distinct admin_email from socialapp.admin_audit order by 1 limit 200"),
  ]);
  return { actions: [...new Set([...KNOWN_AUDIT_ACTIONS, ...actions.map((a) => a.action)])].sort(), admins: admins.map((a) => a.admin_email) };
}

/** One-line JSON for the details column, capped so a big payload can't flood the table. */
export function detailsText(details: Record<string, unknown> | null | undefined, max = 200): string {
  if (!details || Object.keys(details).length === 0) return "";
  const s = JSON.stringify(details);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
