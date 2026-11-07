import { decryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { graphBaseFor } from "@/lib/graphHost";

const FOLLOW_CHECK_TIMEOUT_MS = 6_000;

// User Profile API: does this IGSID follow the business? null = Instagram did not answer.
export async function isFollower(
  igsid: string,
  token: string,
  authType?: string | null,
): Promise<boolean | null> {
  try {
    const res = await fetch(
      `${graphBaseFor(authType)}/${encodeURIComponent(igsid)}?fields=is_user_follow_business`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(FOLLOW_CHECK_TIMEOUT_MS),
      },
    );
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as { is_user_follow_business?: unknown };
    if (body.is_user_follow_business === true) {
      return true;
    }
    if (body.is_user_follow_business === false) {
      return false;
    }
    return null;
  } catch {
    return null;
  }
}

export async function accountToken(accountId: string): Promise<{ token: string; authType: string | null } | null> {
  const rows = await query<{ access_token_enc: string | null; auth_type?: string | null }>(
    "select access_token_enc, auth_type from socialapp.social_accounts where id=$1",
    [accountId],
  );
  const enc = rows[0]?.access_token_enc;
  if (!enc) {
    return null;
  }
  try {
    return { token: decryptToken(enc), authType: rows[0]?.auth_type ?? null };
  } catch {
    console.error("accountToken: cannot decrypt token for account", accountId);
    return null;
  }
}
