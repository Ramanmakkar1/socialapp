import assert from "node:assert/strict";
import { test } from "node:test";
import { PUBLIC_REPLY_MAX, choosePublicReply, cleanPublicReply, publicReplyVariants, shouldPublicReply } from "./publicReply.ts";

test("cleanPublicReply: non-strings and empty strings return null", () => {
  assert.equal(cleanPublicReply(null), null);
  assert.equal(cleanPublicReply(undefined), null);
  assert.equal(cleanPublicReply(42), null);
  assert.equal(cleanPublicReply({}), null);
  assert.equal(cleanPublicReply(""), null);
  assert.equal(cleanPublicReply("   "), null);
});

test("cleanPublicReply: trims and keeps the text", () => {
  assert.equal(cleanPublicReply("  Sent it to your DMs! 📩  "), "Sent it to your DMs! 📩");
});

test("cleanPublicReply: cuts a 400-char string to 300 without splitting emoji", () => {
  const long = "a".repeat(298) + "📩📩📩📩📩📩" + "b".repeat(96); // 400 code points
  assert.equal(Array.from(long).length, 400);
  const out = cleanPublicReply(long);
  assert.equal(typeof out, "string");
  assert.equal(Array.from(out as string).length, PUBLIC_REPLY_MAX);
  assert.equal(out, "a".repeat(298) + "📩📩");
});

test("public reply variants use one non-empty line per send", () => {
  const raw = "First reply ✅\n\n Second reply 📩 ";
  assert.deepEqual(publicReplyVariants(raw), ["First reply ✅", "Second reply 📩"]);
  assert.equal(choosePublicReply(raw, () => 0), "First reply ✅");
  assert.equal(choosePublicReply(raw, () => 0.99), "Second reply 📩");
  assert.equal(choosePublicReply("\n"), null);
});

test("shouldPublicReply: only comment_reply and comment_link with a comment and rule", () => {
  const base = { comment_id: "cmt-1", rule_id: "rule-1" };
  assert.equal(shouldPublicReply({ kind: "comment_reply", ...base }), true);
  assert.equal(shouldPublicReply({ kind: "comment_link", ...base }), true);
  assert.equal(shouldPublicReply({ kind: "manual_reply", ...base }), false);
  assert.equal(shouldPublicReply({ kind: "follow_check", ...base }), false);
  assert.equal(shouldPublicReply({ kind: "follow_nudge", ...base }), false);
  assert.equal(shouldPublicReply({ kind: "gated_link", ...base }), false);
  assert.equal(shouldPublicReply({ kind: "story_reply", ...base }), false);
});

test("shouldPublicReply: false when comment_id is null", () => {
  assert.equal(shouldPublicReply({ kind: "comment_reply", comment_id: null, rule_id: "rule-1" }), false);
  assert.equal(shouldPublicReply({ kind: "comment_link", comment_id: null, rule_id: "rule-1" }), false);
  assert.equal(shouldPublicReply({ kind: "comment_reply", comment_id: "cmt-1", rule_id: null }), false);
});
