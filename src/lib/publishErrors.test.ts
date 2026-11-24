import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyPublishError, failureAction } from "./publishErrors.ts";
import { gaveUpNote, MAX_RETRY_ATTEMPTS, nextRetryDelayMs, RATE_LIMIT_MAX_MS, RETRY_DELAY_MS } from "./publishRetry.ts";

test("known Instagram codes map to the right category with a plain reason, raw text kept", () => {
  const raw = 'HTTP 400: Invalid parameter (code 2207009 subcode)';
  const c = classifyPublishError("instagram", raw);
  assert.equal(c.kind, "bad_body");
  assert.match(c.message, /Instagram.*aspect ratio/i);
  assert.equal(c.raw, raw);
  assert.equal(classifyPublishError("instagram", "HTTP 400: An unknown error occurred").kind, "retry");
  assert.equal(classifyPublishError("instagram", "HTTP 400: code 2207042").kind, "rate_limit");
  assert.equal(classifyPublishError("instagram", "Error validating access token: Session has expired").kind, "refresh_token");
  assert.equal(classifyPublishError("instagram", "Session key is malformed").kind, "reconnect");
});

test("per-network tables: TikTok, X, Discord, YouTube, Threads", () => {
  assert.equal(classifyPublishError("tiktok", "TikTok publish failed: reached_active_user_cap").kind, "reconnect");
  assert.equal(classifyPublishError("tiktok", "TikTok publish failed: spam_risk_too_many_posts").kind, "rate_limit");
  assert.equal(classifyPublishError("tiktok", "TikTok publish failed: access_token_invalid").kind, "refresh_token");
  assert.equal(classifyPublishError("x", "X post failed: Too Many Requests").kind, "rate_limit");
  assert.equal(classifyPublishError("x", "X post failed: maximum of 4 items").kind, "bad_body");
  assert.equal(classifyPublishError("discord", "Discord send failed: code 50013").kind, "bad_body");
  assert.equal(classifyPublishError("youtube", "YouTube session start HTTP 403: quotaExceeded").kind, "rate_limit");
  assert.equal(classifyPublishError("threads", "HTTP 400: 4279009").kind, "retry");
});

test("HTTP status from the adapters decides when no rule matches", () => {
  assert.equal(classifyPublishError("bluesky", "Bluesky post failed: boom", { status: 503 }).kind, "retry");
  assert.equal(classifyPublishError("bluesky", "Bluesky post failed: slow down", { status: 429 }).kind, "rate_limit");
  assert.equal(classifyPublishError("bluesky", "Bluesky post failed: x", { status: 0 }).kind, "ambiguous");
  assert.equal(classifyPublishError("bluesky", "Bluesky post failed: nope", { tokenDead: true, status: 401 }).kind, "refresh_token");
});

test("a dropped connection is ambiguous (never auto-retried); unmatched text is unknown", () => {
  assert.equal(classifyPublishError("instagram", "network: The operation was aborted due to timeout").kind, "ambiguous");
  const u = classifyPublishError("mastodon", "Mastodon post failed: something odd");
  assert.equal(u.kind, "unknown");
  assert.equal(u.message, "Mastodon post failed: something odd");
  // The network is named once: added when the raw text doesn't already say it.
  assert.equal(classifyPublishError("bluesky", "boom").message, "Bluesky: boom");
});

test("network-specific rules win over the adapter's tokenDead hint", () => {
  // TikTok returns 401 for the active-user cap; refreshing cannot fix it.
  assert.equal(classifyPublishError("tiktok", "reached_active_user_cap", { tokenDead: true }).kind, "reconnect");
});

test("failureAction picks the button for the Why-it-failed popover", () => {
  assert.equal(failureAction("refresh_token"), "reconnect");
  assert.equal(failureAction("reconnect"), "reconnect");
  assert.equal(failureAction("bad_body"), "edit");
  assert.equal(failureAction("ambiguous"), "retry");
  assert.equal(failureAction(null), "retry");
});

test("retry schedule: 10 minutes x6 for temporary errors, 1h doubling capped at 24h for rate limits", () => {
  assert.equal(nextRetryDelayMs("retry", 0), RETRY_DELAY_MS);
  assert.equal(nextRetryDelayMs("retry", MAX_RETRY_ATTEMPTS - 1), RETRY_DELAY_MS);
  assert.equal(nextRetryDelayMs("retry", MAX_RETRY_ATTEMPTS), null);
  assert.equal(nextRetryDelayMs("rate_limit", 0), 60 * 60_000);
  assert.equal(nextRetryDelayMs("rate_limit", 2), 4 * 60 * 60_000);
  assert.equal(nextRetryDelayMs("rate_limit", 4), 16 * 60 * 60_000);
  assert.equal(nextRetryDelayMs("rate_limit", 5), null);
  assert.ok((nextRetryDelayMs("rate_limit", 4) ?? 0) <= RATE_LIMIT_MAX_MS);
  for (const kind of ["bad_body", "ambiguous", "unknown", "refresh_token", "reconnect"] as const) {
    assert.equal(nextRetryDelayMs(kind, 0), null, kind);
  }
  assert.equal(gaveUpNote("retry", 0), "");
  assert.match(gaveUpNote("retry", 6), /tried 7 times/);
});
