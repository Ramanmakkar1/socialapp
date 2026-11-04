// Meta App Review demo login. Enabled only when REVIEWER_EMAIL and REVIEWER_PASSWORD are both set.
import { createHash, timingSafeEqual } from "node:crypto";
import { createUser, type CurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { hashPassword, normalizeEmail } from "@/lib/password";

function reviewerCreds(): { email: string; password: string } | null {
  const email = (process.env.REVIEWER_EMAIL ?? "").trim();
  const password = process.env.REVIEWER_PASSWORD ?? "";
  if (!email || password.length < 8) return null;
  return { email: normalizeEmail(email), password };
}

export function isReviewerLoginEnabled(): boolean {
  return reviewerCreds() !== null;
}

function sameSecret(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

// Returns the reviewer user (created on first login, password kept in sync with the env) or null.
export async function reviewerLogin(email: string, password: string): Promise<CurrentUser | null> {
  const creds = reviewerCreds();
  if (!creds) return null;
  const emailOk = sameSecret(normalizeEmail(email), creds.email);
  const passOk = sameSecret(password, creds.password);
  if (!emailOk || !passOk) return null;
  const created = await createUser(creds.email, creds.password, "Meta App Reviewer");
  if (created) return created;
  const rows = await query<CurrentUser>(
    "update socialapp.users set password_hash=$2 where email=$1 returning id, email, name",
    [creds.email, await hashPassword(creds.password)]
  );
  return rows[0] ?? null;
}
