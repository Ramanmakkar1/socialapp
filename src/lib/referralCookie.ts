// Server only: reads the first-touch referral cookie during sign-up and attributes the new user.
import { cookies } from "next/headers";
import { REF_COOKIE, attributeReferral } from "@/lib/referrals";

/** Call right after a user is created or signs in with Google. Never throws. */
export async function attributeReferralFromCookie(userId: string): Promise<void> {
  try {
    const jar = await cookies();
    const value = jar.get(REF_COOKIE)?.value;
    if (!value) return;
    const result = await attributeReferral(userId, value);
    // Attributed or refused for good: either way this browser's cookie has done its job.
    if (result.ok || result.reason === "self" || result.reason === "already") jar.delete(REF_COOKIE);
  } catch (err) {
    console.error("referral attribution skipped", err instanceof Error ? err.message : err);
  }
}
