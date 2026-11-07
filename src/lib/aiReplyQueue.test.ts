import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";

const params = {
  userId: "u1",
  socialAccountId: "a1",
  accountExternalId: "ig1",
  contactId: "c1",
  senderId: "s1",
  text: "Hi, how much is a session?",
  hasPendingGate: false,
};

function handlers(opts: { enabled: boolean; repliesToday: number }): FakeHandler[] {
  return [
    {
      match: /from socialapp\.social_accounts a join socialapp\.users u/,
      reply: () => [
        { ai_reply_enabled: opts.enabled, ai_reply_instructions: null, ai_booking_link: null, brand_voice: null },
      ],
    },
    { match: /count\(\*\)::int as n from socialapp\.dm_queue/, reply: () => [{ n: opts.repliesToday }] },
    { match: /select message, coalesce\(sent_at, created_at\) as at/, reply: () => [] },
    { match: /^insert into socialapp\.dm_queue/, reply: () => [] },
  ];
}

async function run(opts: { enabled: boolean; repliesToday: number }) {
  const { pool, calls } = createFakePool(handlers(opts));
  const restore = installFakePool(pool);
  const prevFetch = globalThis.fetch;
  const prevKey = process.env.ANTHROPIC_API_KEY;
  let fetches = 0;
  globalThis.fetch = (async () => {
    fetches += 1;
    return new Response(JSON.stringify({ content: [{ type: "text", text: "Thanks! A session is listed on our site." }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  process.env.ANTHROPIC_API_KEY = "test-key";
  try {
    const { maybeQueueAiReply } = await import("./aiReplyQueue.ts");
    const result = await maybeQueueAiReply(params);
    return { result, calls, fetches };
  } finally {
    globalThis.fetch = prevFetch;
    if (prevKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = prevKey;
    restore();
  }
}

test("maybeQueueAiReply: AI off returns false and makes no fetch", async () => {
  const { result, calls, fetches } = await run({ enabled: false, repliesToday: 0 });
  assert.equal(result, false);
  assert.equal(fetches, 0);
  assert.equal(calls.length, 1);
});

test("maybeQueueAiReply: 5 AI replies already today returns false", async () => {
  const { result, calls, fetches } = await run({ enabled: true, repliesToday: 5 });
  assert.equal(result, false);
  assert.equal(fetches, 0);
  assert.equal(calls.filter((c) => c.sql.startsWith("insert")).length, 0);
});

test("maybeQueueAiReply: happy path queues one ai_reply row", async () => {
  const { result, calls, fetches } = await run({ enabled: true, repliesToday: 0 });
  assert.equal(result, true);
  assert.equal(fetches, 1);
  const inserts = calls.filter((c) => c.sql.startsWith("insert into socialapp.dm_queue"));
  assert.equal(inserts.length, 1);
  assert.match(inserts[0].sql, /'ai_reply'/);
  assert.deepEqual(inserts[0].params, ["u1", "a1", "c1", "s1", "Thanks! A session is listed on our site."]);
});
