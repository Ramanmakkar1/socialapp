// Client-safe: publish failure categories and what the user should do about each.
// The classifier itself (server only) is src/lib/publishErrors.ts.

/**
 * refresh_token — the access token was rejected; refresh it once, otherwise the user reconnects.
 * reconnect     — refreshing cannot help (account locked out, daily user cap…): reconnect.
 * bad_body      — the network refused this post's content/media: the user must edit it.
 * retry         — the network had a temporary problem: safe to try again automatically.
 * rate_limit    — too many requests / daily cap: try again later with a long backoff.
 * ambiguous     — the connection dropped mid-publish: the post may already be live, never auto-retry.
 * unknown       — nothing matched: shown as is, never auto-retried.
 */
export type PublishErrorKind = "refresh_token" | "reconnect" | "bad_body" | "retry" | "rate_limit" | "ambiguous" | "unknown";

/** What the user should do next, for the "Why it failed" popover. */
export type FailureAction = "reconnect" | "edit" | "retry";

export function failureAction(kind: string | null | undefined): FailureAction {
  if (kind === "refresh_token" || kind === "reconnect") return "reconnect";
  if (kind === "bad_body") return "edit";
  return "retry";
}

export const KIND_SUMMARY: Record<PublishErrorKind, string> = {
  refresh_token: "The account's access expired",
  reconnect: "The account needs to be reconnected",
  bad_body: "The network refused this post",
  retry: "The network had a temporary problem",
  rate_limit: "The network's posting limit was reached",
  ambiguous: "The connection dropped while posting",
  unknown: "Publishing failed",
};
