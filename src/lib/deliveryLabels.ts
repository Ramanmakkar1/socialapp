// Display helpers for the DM delivery log and activity page.

/**
 * Number of send attempts to show. The send worker counts the successful try, but rows written
 * before that (or skipped before any try) can say 0: a sent DM always took at least one attempt,
 * and a row that was never tried shows null ("—" / "Not tried yet").
 */
export function displayAttempts(status: string, attempts: number): number | null {
  const n = Number.isFinite(attempts) && attempts > 0 ? Math.floor(attempts) : 0;
  if (status === "sent") return Math.max(1, n);
  return n > 0 ? n : null;
}

export function attemptsText(status: string, attempts: number): string {
  const n = displayAttempts(status, attempts);
  if (n === null) return status === "skipped" ? "Not sent" : "Not tried yet";
  return `${n} ${n === 1 ? "attempt" : "attempts"}`;
}

/** "@username", or a short, stable label from the Instagram user id when the username is unknown. */
export function recipientLabel(username: string | null | undefined, externalId: string | null | undefined): string {
  const u = username?.trim().replace(/^@/, "");
  if (u) return `@${u}`;
  const id = externalId?.trim();
  return id ? `User …${id.slice(-4)}` : "Unknown user";
}
