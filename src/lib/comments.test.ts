import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { createDmWorld, rule, type WContact } from "../test-utils/dmWorld.ts";
import { commentTime, extractCommentEvents, processCommentEvents, type CommentEvent } from "./comments.ts";
import { messagingWindowError } from "./sendPolicy.ts";

const ACCOUNT = { id: "account-1", user_id: "owner", external_id: "ig-acct", status: "active", access_token_enc: "x", dm_cooldown_until: null };
const DAY = 86_400_000;

function comment(id: string, text: string, createdAt: string | null): CommentEvent {
  return { accountExternalId: "ig-acct", commentId: id, text, fromId: "fan", fromUsername: "fan", mediaId: "m1", createdAt };
}

async function inWorld(world: ReturnType<typeof createDmWorld>, run: () => Promise<void>) {
  const { pool } = createFakePool(world.handlers);
  const restore = installFakePool(pool);
  try {
    await run();
  } finally {
    restore();
  }
}

test("replayed comments keep their original comment time in the queue (j)", async () => {
  const world = createDmWorld({ accounts: [{ ...ACCOUNT }], rules: [rule({ id: "rule-a" })] });
  const sixDaysAgo = new Date(Date.now() - 6 * DAY).toISOString();
  const eightDaysAgo = new Date(Date.now() - 8 * DAY).toISOString();
  await inWorld(world, async () => {
    assert.equal(await processCommentEvents([comment("c-6", "LINK please", sixDaysAgo), comment("c-8", "link", eightDaysAgo)]), 2);
  });
  const six = world.queue.find((q) => q.comment_id === "c-6")!;
  const eight = world.queue.find((q) => q.comment_id === "c-8")!;
  assert.equal(new Date(six.created_at).toISOString(), sixDaysAgo);
  assert.equal(new Date(eight.created_at).toISOString(), eightDaysAgo);
  // The 7-day private-reply window is therefore measured from the comment, not the replay.
  assert.equal(messagingWindowError({ comment_id: "c-6", created_at: six.created_at }), null);
  assert.match(messagingWindowError({ comment_id: "c-8", created_at: eight.created_at }) ?? "", /7-day/);
});

test("post-specific rules only queue comments on selected media", async () => {
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-media", media_ids: ["m2"] })],
  });
  await inWorld(world, async () => {
    const otherPost = { ...comment("c-other", "link", null), mediaId: "m1" };
    const selectedPost = { ...comment("c-selected", "link", null), mediaId: "m2" };
    const missingPost = { ...comment("c-missing", "link", null), mediaId: null };
    assert.equal(await processCommentEvents([otherPost, selectedPost, missingPost]), 1);
  });
  assert.deepEqual(world.queue.map((item) => item.comment_id), ["c-selected"]);
});

test("empty media scopes match any post and a missing media column falls back safely", async () => {
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-any", media_ids: [] })],
    missingMediaColumn: true,
  });
  await inWorld(world, async () => {
    const otherPost = { ...comment("c-any", "link", null), mediaId: "another-post" };
    assert.equal(await processCommentEvents([otherPost]), 1);
  });
});

test("webhook comments take their time from the payload; times are never in the future", () => {
  const now = Math.floor(Date.now() / 1000);
  const events = extractCommentEvents({
    entry: [{ id: "ig-acct", time: now - 120, changes: [{ field: "comments", value: { id: "c1", text: "hi", from: { id: "fan" } } }] }],
  });
  assert.equal(events[0].createdAt, new Date((now - 120) * 1000).toISOString());
  assert.equal(commentTime("2026-01-02T03:04:05+0000"), "2026-01-02T03:04:05.000Z");
  assert.equal(commentTime(null), null);
  assert.equal(commentTime("garbage"), null);
  assert.ok(Date.parse(commentTime(Date.now() + DAY) ?? "") <= Date.now());
});

test("a returning lead with a known email gets the link directly from an email-gated automation (k)", async () => {
  const known: WContact = { id: "contact-fan", user_id: "owner", social_account_id: "account-1", external_id: "fan", username: "fan", email: "fan@example.com", phone: null, source_rule_id: "rule-a" };
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-b", email_gate: true, keywords: ["guide"] })],
    contacts: [known],
  });
  await inWorld(world, async () => {
    assert.equal(await processCommentEvents([comment("c-b", "GUIDE", null)]), 1);
  });
  const dm = world.queue[0];
  assert.match(dm.message, /coderuleb/);
  assert.doesNotMatch(dm.message, /email/i);
  assert.equal(dm.kind, "comment_link", "not treated as an open gate prompt later");
});

test("a new lead is still asked for the email first", async () => {
  const world = createDmWorld({ accounts: [{ ...ACCOUNT }], rules: [rule({ id: "rule-b", email_gate: true, keywords: ["guide"] })] });
  await inWorld(world, async () => {
    assert.equal(await processCommentEvents([comment("c-b", "guide!", null)]), 1);
  });
  assert.match(world.queue[0].message, /email/i);
  assert.doesNotMatch(world.queue[0].message, /coderuleb/);
});
