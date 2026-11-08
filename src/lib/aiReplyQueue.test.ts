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
    { match: /kind='manual_reply' and status='sent'/, reply: () => [] },
    { match: /select message, coalesce\(sent_at, created_at\) as at/, reply: () => [] },
    { match: /order by received_at desc limit 50/, reply: () => [] },
    { match: /^select pg_advisory_xact_lock/, reply: () => [{}] },
    { match: /^select 1 from socialapp\.dm_queue where contact_id=\$1 and kind='ai_reply'/, reply: () => [] },
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

function metaPayload(messages: { mid: string | null; text: string; timestamp: number }[]) {
  return {
    entry: [
      {
        id: "ig1",
        messaging: messages.map((m) => ({
          sender: { id: "s1" },
          message: { mid: m.mid, text: m.text },
          timestamp: m.timestamp,
        })),
      },
    ],
  };
}

// Runs the full flow with the given stored inbound events and sent replies, and
// returns the messages array the AI request was built with.
async function runWithInbound(
  inbound: { mid: string | null; text: string; timestamp: number }[],
  sent: { message: string; at: Date }[]
) {
  const { pool } = createFakePool([
    {
      match: /order by received_at desc limit 50/,
      reply: () => (inbound.length ? [{ payload: metaPayload(inbound), received_at: new Date("2026-11-07T10:00:00Z") }] : []),
    },
    { match: /select message, coalesce\(sent_at, created_at\) as at/, reply: () => sent },
    ...handlers({ enabled: true, repliesToday: 0 }),
  ]);
  const restore = installFakePool(pool);
  const prevFetch = globalThis.fetch;
  const prevKey = process.env.ANTHROPIC_API_KEY;
  let body: { messages?: { role: string; content: string }[] } | null = null;
  globalThis.fetch = (async (_url: unknown, init?: { body?: string }) => {
    if (init?.body) body = JSON.parse(init.body) as { messages?: { role: string; content: string }[] };
    return new Response(JSON.stringify({ content: [{ type: "text", text: "Thanks! A session is listed on our site." }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  process.env.ANTHROPIC_API_KEY = "test-key";
  try {
    const { maybeQueueAiReply } = await import("./aiReplyQueue.ts");
    const result = await maybeQueueAiReply(params);
    const sentBody = body as { messages?: { role: string; content: string }[] } | null;
    return { result, messages: sentBody?.messages ?? [] };
  } finally {
    globalThis.fetch = prevFetch;
    if (prevKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = prevKey;
    restore();
  }
}

test("maybeQueueAiReply: history includes the person's earlier messages, not just our sent replies", async () => {
  const at = (h: number, m: number) => new Date(Date.UTC(2026, 10, 7, h, m)).getTime();
  const { result, messages } = await runWithInbound(
    [{ mid: "m1", text: "I'm Sam, do you do weddings?", timestamp: at(9, 59) }],
    [{ message: "We do! What date are you thinking?", at: new Date(Date.UTC(2026, 10, 7, 10, 5)) }],
  );
  assert.equal(result, true);
  assert.deepEqual(messages, [
    { role: "user", content: "I'm Sam, do you do weddings?" },
    { role: "assistant", content: "We do! What date are you thinking?" },
    { role: "user", content: params.text },
  ]);
});

test("maybeQueueAiReply: current message is not duplicated when it is already stored", async () => {
  const { result, messages } = await runWithInbound(
    [{ mid: "m2", text: params.text, timestamp: new Date("2026-11-07T10:00:00Z").getTime() }],
    [],
  );
  assert.equal(result, true);
  assert.equal(messages.map((m) => m.content).join("\n").split(params.text).length - 1, 1);
});

test("maybeQueueAiReply: echo of our own message returns false without any query", async () => {
  const { pool, calls } = createFakePool([]);
  const restore = installFakePool(pool);
  try {
    const { maybeQueueAiReply } = await import("./aiReplyQueue.ts");
    assert.equal(await maybeQueueAiReply({ ...params, senderId: params.accountExternalId }), false);
    assert.equal(calls.length, 0);
  } finally {
    restore();
  }
});
