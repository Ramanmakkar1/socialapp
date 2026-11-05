import { decryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";

const GRAPH_BASE = "https://graph.instagram.com/v21.0";
const FOLLOW_CHECK_TIMEOUT_MS = 6_000;

export async function isFollower(
  igsid: string,
  token: string,
): Promise<boolean | null> {
  try {
    const res = await fetch(
      `${GRAPH_BASE}/${encodeURIComponent(igsid)}?fields=is_user_follow_business`,
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

export async function accountToken(accountId: string): Promise<string | null> {
  const rows = await query<{ access_token_enc: string | null }>(
    "select access_token_enc from socialapp.social_accounts where id=$1",
    [accountId],
  );
  const enc = rows[0]?.access_token_enc;
  if (!enc) {
    return null;
  }
  try {
    return decryptToken(enc);
  } catch {
    console.error("accountToken: cannot decrypt token for account", accountId);
    return null;
  }
}
