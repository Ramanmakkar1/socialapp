// A visitor who opens a team invite while logged out gets this cookie, so that after they log in or
// sign up (password or Google) they land back on /invite/<token> to accept it. Client-safe: no DB.
export const INVITE_COOKIE = "pf_invite";
export const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** /invite/<token> for a well-formed token (base64url, as minted by src/lib/team.ts), else null. */
export function invitePath(raw: string | null | undefined): string | null {
  return typeof raw === "string" && /^[A-Za-z0-9_-]{20,64}$/.test(raw) ? `/invite/${raw}` : null;
}
