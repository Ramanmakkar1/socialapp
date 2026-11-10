// Posts the rule's public reply under a comment after the private DM is sent.
// The templates page promises it (src/app/instagram-auto-dm/templates); this is the backend.

export const PUBLIC_REPLY_MAX = 300;

/** Trim and cap a public reply. Returns null when there is nothing to post. */
export function cleanPublicReply(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return Array.from(trimmed).slice(0, PUBLIC_REPLY_MAX).join("");
}

/** Newline-delimited variants stored in the existing public_reply field. */
export function publicReplyVariants(raw: unknown): string[] {
  const cleaned = cleanPublicReply(raw);
  return cleaned ? cleaned.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) : [];
}

export function choosePublicReply(raw: unknown, random = Math.random): string | null {
  const variants = publicReplyVariants(raw);
  if (variants.length === 0) return null;
  const index = Math.min(variants.length - 1, Math.floor(random() * variants.length));
  return variants[index];
}

/**
 * Reply publicly only once, on the first DM for a comment: only comment-driven
 * kinds with both a comment and a rule. Manual replies, follow checks/nudges,
 * gated links and story/DM rows never post a public reply.
 */
export function shouldPublicReply(row: {
  kind: string;
  comment_id: string | null;
  rule_id: string | null;
}): boolean {
  if (!row.comment_id || !row.rule_id) return false;
  return row.kind === "comment_reply" || row.kind === "comment_link";
}

/**
 * POST {base}/{commentId}/replies with the public reply text.
 * Never throws; network and HTTP failures come back as { ok: false, error }.
 */
export async function sendPublicCommentReply(
  base: string,
  commentId: string,
  token: string,
  message: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${base}/${encodeURIComponent(commentId)}/replies`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return { ok: true };
    const text = (await res.text().catch(() => "")).slice(0, 300);
    return { ok: false, error: `HTTP ${res.status}: ${text}`.split(token).join("***") };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `network: ${message}`.split(token).join("***") };
  }
}
