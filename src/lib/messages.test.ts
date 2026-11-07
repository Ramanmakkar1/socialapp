import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractEmail,
  extractMessageEvents,
  extractPhone,
} from "./messageParse.ts";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { createDmWorld, rule, sentPrompt, type WContact } from "../test-utils/dmWorld.ts";

test("extractMessageEvents on valid payload returns 1 event", () => {
  const body = {
    object: "instagram",
    entry: [
      {
        id: "17841400000000000",
        messaging: [
          {
            sender: { id: "123456789" },
            recipient: { id: "17841400000000000" },
            timestamp: 1234567890,
            message: { mid: "m_mid", text: "my email is a@b.com" },
          },
        ],
      },
    ],
  };
  const events = extractMessageEvents(body);
  assert.equal(events.length, 1);
  assert.equal(events[0].accountExternalId, "17841400000000000");
  assert.equal(events[0].senderId, "123456789");
  assert.equal(events[0].text, "my email is a@b.com");
  assert.equal(events[0].mid, "m_mid");
});

test("extractMessageEvents skips is_echo messages", () => {
  const body = {
    entry: [
      {
        id: "acc1",
        messaging: [
          {
            sender: { id: "user1" },
            message: { text: "echo", is_echo: true },
          },
        ],
      },
    ],
  };
  assert.deepEqual(extractMessageEvents(body), []);
});

test("extractMessageEvents skips payload without text", () => {
  const body = {
    entry: [
      {
        id: "acc1",
        messaging: [
          {
            sender: { id: "user1" },
            message: { mid: "m1" },
          },
        ],
      },
    ],
  };
  assert.deepEqual(extractMessageEvents(body), []);
});

test("extractMessageEvents malformed input returns []", () => {
  assert.deepEqual(extractMessageEvents(null), []);
  assert.deepEqual(extractMessageEvents({}), []);
  assert.deepEqual(extractMessageEvents({ entry: "x" }), []);
});

test("extractEmail finds and normalizes email", () => {
  assert.equal(
    extractEmail("my mail is John.Doe@Example.com."),
    "john.doe@example.com",
  );
  assert.equal(extractEmail("hi"), null);
});

test("extractPhone finds normalized phone", () => {
  assert.equal(extractPhone("call +1 (416) 555-0199"), "+14165550199");
  assert.equal(extractPhone("order 12"), null);
});


// ---- processMessageEvents: gated links, follow checks, idempotency ----


type World = ReturnType<typeof createDmWorld>;

async function inWorld(world: World, following: boolean | null | "throw", run: (fetches: string[]) => Promise<void>) {
  const { pool } = createFakePool(world.handlers);
  const restore = installFakePool(pool);
  const { encryptToken } = await import("./crypto.ts");
  for (const a of world.accounts) if (a.access_token_enc === "") a.access_token_enc = encryptToken("tok");
  const previousFetch = globalThis.fetch;
  const previousError = console.error;
  const fetches: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    fetches.push(String(input));
    if (following === "throw") throw new Error("network down");
    if (following === null) return new Response("{}", { status: 500 });
    return Response.json({ is_user_follow_business: following });
  }) as typeof fetch;
  console.error = () => {};
  try {
    await run(fetches);
  } finally {
    globalThis.fetch = previousFetch;
    console.error = previousError;
    restore();
  }
}

const ACCOUNT = { id: "account-1", user_id: "owner", external_id: "ig-acct", status: "active", access_token_enc: "", dm_cooldown_until: null };
const lead = (extra: Partial<WContact> = {}): WContact => ({
  id: "contact-lead", user_id: "owner", social_account_id: "account-1", external_id: "lead",
  username: "lead", email: null, phone: null, source_rule_id: "rule-a", ...extra,
});
const reply = (text: string, mid = "m1") => ({ accountExternalId: "ig-acct", senderId: "lead", text, mid });
const kinds = (world: World) => world.queue.filter((q) => q.kind !== "comment_reply").map((q) => [q.rule_id, q.kind]);

test("follow check that Instagram does not answer queues a durable retry instead of being dropped (g)", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  for (const failure of [null, "throw"] as const) {
    const world = createDmWorld({
      accounts: [{ ...ACCOUNT }],
      rules: [rule({ id: "rule-a", follow_gate: true })],
      contacts: [lead()],
      queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
    });
    await inWorld(world, failure, async () => {
      // The webhook is acknowledged (no throw) because the retry is stored durably.
      assert.equal(await processMessageEvents([reply("done")]), 1);
      const retry = world.queue.find((q) => q.kind === "follow_check");
      assert.ok(retry, "follow_check row queued");
      assert.equal(retry.status, "pending");
      assert.ok(retry.next_attempt_at > Date.now(), "retry waits (backoff)");
      assert.match(retry.message, /^Thanks! Here.s your link: /);
      // Replying again while the check is pending does not queue a second one.
      assert.equal(await processMessageEvents([reply("done", "m2")]), 0);
      assert.equal(world.queue.filter((q) => q.kind === "follow_check").length, 1);
    });
  }
});

test("follow gate: follower gets the link once, non-follower gets at most two nudges", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const following = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", follow_gate: true })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
  });
  await inWorld(following, true, async () => {
    await processMessageEvents([reply("done")]);
    await processMessageEvents([reply("done again", "m2")]);
    assert.deepEqual(kinds(following), [["rule-a", "gated_link"]]);
  });
  const notFollowing = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", follow_gate: true })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
  });
  await inWorld(notFollowing, false, async () => {
    for (let i = 0; i < 4; i++) await processMessageEvents([reply("done", `m${i}`)]);
    assert.deepEqual(kinds(notFollowing), [["rule-a", "follow_nudge"], ["rule-a", "follow_nudge"]]);
  });
});

test("concurrent webhooks for the same reply queue exactly one gated link (h)", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", email_gate: true })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
  });
  // Both deliveries pass the duplicate check before either inserts (lock not modelled):
  // the insert itself must be idempotent.
  world.barrier.size = 2;
  await inWorld(world, true, async () => {
    const results = await Promise.all([
      processMessageEvents([reply("me@example.com", "m1")]),
      processMessageEvents([reply("me@example.com", "m1")]),
    ]);
    assert.deepEqual(results, [1, 1]);
    assert.deepEqual(kinds(world), [["rule-a", "gated_link"]]);
  });
});

test("the reply unlocks the automation the contact actually replied to, not their first rule (i)", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", email_gate: true }), rule({ id: "rule-b", email_gate: true })],
    // Contact was first captured by rule A (source_rule_id), then commented on rule B's post.
    contacts: [lead({ source_rule_id: "rule-a" })],
    queue: [sentPrompt("pa", "contact-lead", "rule-a", 1000), sentPrompt("pb", "contact-lead", "rule-b", 2000)],
  });
  await inWorld(world, true, async () => {
    await processMessageEvents([reply("here you go: me@example.com")]);
    assert.deepEqual(kinds(world), [["rule-b", "gated_link"]]);
    assert.match(world.queue.find((q) => q.kind === "gated_link")!.message, /coderuleb$/);
    // Answering again then unlocks the older, still-open prompt (A), never B twice.
    await processMessageEvents([reply("me@example.com", "m2")]);
    assert.deepEqual(kinds(world), [["rule-b", "gated_link"], ["rule-a", "gated_link"]]);
  });
});

test("a returning lead asking for a second automation's link gets it (k)", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", email_gate: true }), rule({ id: "rule-b", email_gate: true })],
    // Already a lead: gave the email for A and got A's link.
    contacts: [lead({ email: "me@example.com" })],
    queue: [
      sentPrompt("pa", "contact-lead", "rule-a", 1000),
      { ...sentPrompt("la", "contact-lead", "rule-a", 1500), kind: "gated_link", comment_id: null },
      sentPrompt("pb", "contact-lead", "rule-b", 3000),
    ],
  });
  await inWorld(world, true, async () => {
    // Email already known, so a plain reply is enough for B.
    assert.equal(await processMessageEvents([reply("done")]), 1);
    assert.deepEqual(kinds(world), [["rule-a", "gated_link"], ["rule-b", "gated_link"]]);
  });
});

test("no automation without a delivered prompt; paused or other-account rules only capture details", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const cases = [
    { name: "prompt not sent", rules: [rule({ id: "rule-a", email_gate: true })], prompt: { status: "failed" } },
    { name: "paused rule", rules: [rule({ id: "rule-a", email_gate: true, status: "paused" })], prompt: {} },
    { name: "rule scoped to another account", rules: [rule({ id: "rule-a", email_gate: true, social_account_id: "account-2" })], prompt: {} },
    { name: "ungated rule", rules: [rule({ id: "rule-a" })], prompt: {} },
  ];
  for (const c of cases) {
    const world = createDmWorld({
      accounts: [{ ...ACCOUNT }],
      rules: c.rules,
      contacts: [lead()],
      queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000, c.prompt)],
    });
    await inWorld(world, true, async () => {
      assert.equal(await processMessageEvents([reply("hello")]), 0, c.name);
      assert.equal(await processMessageEvents([reply("me@example.com")]), 1, c.name);
      assert.equal(world.contacts[0].email, "me@example.com", c.name);
      assert.deepEqual(kinds(world), [], c.name);
    });
  }
});

test("unknown sender: details are captured without unsolicited automation; other owners stay separate", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }, { ...ACCOUNT, id: "account-9", user_id: "other-owner", external_id: "ig-other" }],
    rules: [rule({ id: "rule-a", email_gate: true })],
  });
  await inWorld(world, true, async () => {
    assert.equal(await processMessageEvents([reply("hello")]), 0);
    // A plain DM now saves a bare contact row (needed for AI replies); no details, no DM queued.
    assert.equal(world.contacts.length, 1);
    assert.equal(world.contacts[0].email, null);
    assert.deepEqual(kinds(world), []);
    assert.equal(await processMessageEvents([reply("Email First@Example.com")]), 1);
    assert.equal(await processMessageEvents([reply("Call +1 (416) 555-0199", "m2")]), 1);
    assert.equal(world.contacts.length, 1);
    assert.equal(world.contacts[0].email, "first@example.com");
    assert.equal(world.contacts[0].phone, "+14165550199");
    await processMessageEvents([{ ...reply("x@y.com", "m3"), accountExternalId: "ig-other" }]);
    assert.equal(world.contacts.length, 2);
    assert.equal(world.contacts[1].user_id, "other-owner");
    assert.deepEqual(kinds(world), []);
  });
});

test("extractMessageEvents flags replies to a story", () => {
  const events = extractMessageEvents({
    entry: [{ id: "acc", messaging: [{ sender: { id: "u" }, message: { mid: "m", text: "FREE", reply_to: { story: { id: "s1", url: "https://x" } } } }] }],
  });
  assert.equal(events[0].storyReply, true);
  assert.equal(extractMessageEvents({ entry: [{ id: "acc", messaging: [{ sender: { id: "u" }, message: { text: "hi" } }] }] })[0].storyReply, undefined);
});

test("story replies trigger story_reply automations once per day; other replies do not", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [
      rule({ id: "rule-story", keywords: ["free"], triggers: ["story_reply"], dm_text: "Here you go {{link}}" }),
      rule({ id: "rule-comment", keywords: ["free"], triggers: ["comment"] }),
    ],
  });
  await inWorld(world, true, async () => {
    const story = { ...reply("FREE 🔥", "s1"), storyReply: true };
    assert.equal(await processMessageEvents([story]), 1);
    assert.equal(await processMessageEvents([{ ...story, mid: "s2" }]), 1);
    // Not a story reply: no automation (comment rules only react to comments).
    assert.equal(await processMessageEvents([reply("free", "m9")]), 0);
    // Story reply that matches nothing: ignored.
    assert.equal(await processMessageEvents([{ ...reply("nice story", "s3"), storyReply: true }]), 0);
  });
  const sent = world.queue.filter((q) => q.kind === "story_reply");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].rule_id, "rule-story");
  assert.equal(sent[0].comment_id, null);
  assert.match(sent[0].message, /^Here you go .*coderulestory$/);
});

test("an email-gated story automation asks first, then the reply unlocks its link", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-story", keywords: ["guide"], triggers: ["story_reply"], email_gate: true })],
  });
  await inWorld(world, true, async () => {
    await processMessageEvents([{ ...reply("guide", "s1"), storyReply: true }]);
    const prompt = world.queue.find((q) => q.kind === "story_reply")!;
    assert.match(prompt.message, /email/i);
    prompt.status = "sent";
    prompt.sent_at = Date.now();
    await processMessageEvents([reply("me@example.com", "m2")]);
  });
  assert.deepEqual(kinds(world), [["rule-story", "story_reply"], ["rule-story", "gated_link"]]);
});

// Facebook Login for Business: the same webhook payloads (object "instagram", entry.id = IG account id).
const FB_ACCOUNT = { ...ACCOUNT, auth_type: "facebook_login" };

test("facebook login: a comment webhook with an emoji keyword queues one private reply for the commenter", async () => {
  const { extractCommentEvents, processCommentEvents } = await import("./comments.ts");
  const world = createDmWorld({ accounts: [{ ...FB_ACCOUNT }], rules: [rule({ id: "rule-a", keywords: ["🔥"] })] });
  const body = {
    object: "instagram",
    entry: [{ id: "ig-acct", time: Math.floor(Date.now() / 1000), changes: [{ field: "comments", value: { id: "c-1", text: "🔥🔥", from: { id: "fan", username: "fan" }, media: { id: "m1" } } }] }],
  };
  await inWorld(world, true, async () => {
    assert.equal(await processCommentEvents(extractCommentEvents(body)), 1);
    // Meta retries the same delivery: still exactly one private reply.
    assert.equal(await processCommentEvents(extractCommentEvents(body)), 0);
  });
  assert.equal(world.queue.length, 1);
  assert.equal(world.queue[0].comment_id, "c-1");
  assert.equal(world.queue[0].recipient_external_id, "fan");
  assert.equal(world.queue[0].kind, "comment_reply");
});

test("facebook login: a DM reply with an email is captured as a lead and unlocks the gated link", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...FB_ACCOUNT }],
    rules: [rule({ id: "rule-a", email_gate: true })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
  });
  await inWorld(world, true, async (fetches) => {
    assert.equal(await processMessageEvents([reply("sure, it's Jane@Example.com")]), 1);
    assert.equal(fetches.length, 0);
  });
  assert.equal(world.contacts[0].email, "jane@example.com");
  assert.deepEqual(kinds(world), [["rule-a", "gated_link"]]);
});

test("facebook login: the follower check for a follow-gated link asks graph.facebook.com", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...FB_ACCOUNT }],
    rules: [rule({ id: "rule-a", follow_gate: true })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
  });
  await inWorld(world, true, async (fetches) => {
    await processMessageEvents([reply("done")]);
    assert.equal(fetches.length, 1);
    assert.match(fetches[0], /^https:\/\/graph\.facebook\.com\/v23\.0\/lead\?fields=is_user_follow_business$/);
  });
  assert.deepEqual(kinds(world), [["rule-a", "gated_link"]]);
});
