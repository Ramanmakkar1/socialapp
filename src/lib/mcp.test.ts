import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";
import { callMcpTool, MCP_TOOLS } from "./mcp.ts";
import { hashToken } from "./password.ts";

const U1 = "11111111-1111-4111-8111-111111111111";
const U2 = "22222222-2222-4222-8222-222222222222";
const POST_ID = "33333333-3333-4333-8333-333333333333";

async function withPool<T>(handlers: FakeHandler[], run: () => Promise<T>): Promise<T> {
  const { pool } = createFakePool(handlers);
  const restore = installFakePool(pool);
  try {
    return await run();
  } finally {
    restore();
  }
}

function text(result: { content: { text: string }[] }): string {
  return result.content[0]?.text ?? "";
}

function json(result: { content: { text: string }[] }): unknown {
  return JSON.parse(text(result));
}

// --- list_channels ---------------------------------------------------------

test("list_channels: returns only the key owner's channels", async () => {
  const handlers: FakeHandler[] = [
    {
      match: /from socialapp\.social_accounts where user_id=\$1 order by platform/,
      reply: (p) =>
        [
          { user_id: U1, platform: "instagram", username: "poskoo", status: "active" },
          { user_id: U2, platform: "instagram", username: "someone-else", status: "active" },
        ]
          .filter((r) => r.user_id === p[0])
          .map(({ platform, username, status }) => ({ platform, username, status })),
    },
    {
      match: /from socialapp\.youtube_channels where user_id=\$1 order by updated_at/,
      reply: (p) =>
        [{ user_id: U1, title: "Poskoo TV", status: "active" }]
          .filter((r) => r.user_id === p[0])
          .map(({ title, status }) => ({ title, status })),
    },
  ];
  const result = await withPool(handlers, () => callMcpTool("list_channels", {}, U1));
  assert.equal(result.isError, undefined);
  const channels = json(result) as { platform: string; username: string | null }[];
  assert.equal(channels.length, 2);
  assert.ok(channels.some((c) => c.platform === "instagram" && c.username === "poskoo"));
  assert.ok(channels.some((c) => c.platform === "youtube" && c.username === "Poskoo TV"));
  assert.ok(!channels.some((c) => c.username === "someone-else"));
});

// --- list_posts ------------------------------------------------------------

test("list_posts: scopes to the owner, filters by status, rejects bad status", async () => {
  const posts = [
    { id: "p1", user_id: U1, caption: "draft one", status: "draft", scheduled_at: null, platforms: ["instagram"] },
    { id: "p2", user_id: U1, caption: "scheduled one", status: "scheduled", scheduled_at: new Date("2026-12-01T09:00:00Z"), platforms: ["facebook"] },
    { id: "p3", user_id: U2, caption: "not mine", status: "draft", scheduled_at: null, platforms: ["threads"] },
  ];
  const handlers: FakeHandler[] = [
    {
      match: /from socialapp\.scheduled_posts p/,
      reply: (params) => {
        const status = params.length > 1 ? String(params[1]) : null;
        return posts
          .filter((p) => p.user_id === params[0] && (!status || p.status === status))
          .map((p) => ({ id: p.id, caption: p.caption, status: p.status, scheduled_at: p.scheduled_at, platforms: p.platforms }));
      },
    },
  ];
  const all = json(await withPool(handlers, () => callMcpTool("list_posts", {}, U1))) as { id: string }[];
  assert.deepEqual(all.map((p) => p.id).sort(), ["p1", "p2"]);

  const drafts = json(await withPool(handlers, () => callMcpTool("list_posts", { status: "draft" }, U1))) as { id: string }[];
  assert.deepEqual(drafts.map((p) => p.id), ["p1"]);

  const other = json(await withPool(handlers, () => callMcpTool("list_posts", {}, U2))) as { id: string }[];
  assert.deepEqual(other.map((p) => p.id), ["p3"]);

  const bad = await withPool(handlers, () => callMcpTool("list_posts", { status: "wip" }, U1));
  assert.match(text(bad), /status must be one of/);
});

// --- create_post -----------------------------------------------------------

const createHandlers = (connected: boolean): FakeHandler[] => [
  {
    match: /select 1 from socialapp\.social_accounts where user_id=\$1 and platform='instagram'/,
    reply: () => (connected ? [{ 1: 1 }] : []),
  },
  { match: /select count\(\*\)::int as n from socialapp\.scheduled_posts/, reply: () => [{ n: 0 }] },
  { match: /select exists \(select 1 from information_schema\.columns/, reply: () => [{ exists: false }] },
  { match: /^insert into scheduled_posts \(user_id/, reply: () => [{ id: POST_ID }] },
  { match: /^insert into post_targets \(post_id/, reply: () => [] },
];

test("create_post: requires a caption and a known channel", async () => {
  const noCaption = await withPool([], () => callMcpTool("create_post", {}, U1));
  assert.match(text(noCaption), /caption is required/);
  const badChannel = await withPool([], () => callMcpTool("create_post", { caption: "hi", channel: "tiktok" }, U1));
  assert.match(text(badChannel), /channel must be one of/);
});

test("create_post: with no channel given and none connected, says to connect one", async () => {
  const handlers: FakeHandler[] = [
    { match: /select platform from socialapp\.social_accounts/, reply: () => [] },
    { match: /select status from socialapp\.youtube_channels/, reply: () => [] },
  ];
  const result = await withPool(handlers, () =>
    callMcpTool("create_post", { caption: "hi", mediaUrl: "https://ex.com/a.jpg" }, U1),
  );
  assert.match(text(result), /No connected channel/);
});

test("create_post: schedules an Instagram post with the same rules as the calendar", async () => {
  let insertParams: unknown[] | null = null;
  const handlers = createHandlers(true);
  const insert = handlers.find((h) => h.match.toString().includes("insert into scheduled_posts"));
  if (insert) {
    insert.reply = (params) => {
      insertParams = params;
      return [{ id: POST_ID }];
    };
  }
  const at = new Date(Date.now() + 3600_000).toISOString();
  const result = await withPool(handlers, () =>
    callMcpTool(
      "create_post",
      { caption: "Hello world", mediaUrl: "https://ex.com/a.jpg", channel: "instagram", scheduleAt: at },
      U1,
    ),
  );
  assert.deepEqual(json(result), { ok: true, postId: POST_ID });
  assert.equal(insertParams?.[0], U1);
  assert.equal(insertParams?.[3], "scheduled");
});

test("create_post: “next slot” picks the next free slot from the channel schedules", async () => {
  const hour = String((new Date().getUTCHours() + 3) % 24).padStart(2, "0");
  let insertParams: unknown[] | null = null;
  const handlers: FakeHandler[] = [
    {
      match: /select platform, timezone, days, times from socialapp\.posting_schedules/,
      reply: () => [{ platform: "instagram", timezone: "UTC", days: [1, 2, 3, 4, 5, 6, 7], times: [`${hour}:00`] }],
    },
    ...createHandlers(true),
  ];
  const insert = handlers.find((h) => h.match.toString().includes("insert into scheduled_posts"));
  if (insert) {
    insert.reply = (params) => {
      insertParams = params;
      return [{ id: POST_ID }];
    };
  }
  const result = await withPool(handlers, () =>
    callMcpTool("create_post", { caption: "Hello world", mediaUrl: "https://ex.com/a.jpg", channel: "instagram", scheduleAt: "next slot" }, U1),
  );
  assert.deepEqual(json(result), { ok: true, postId: POST_ID });
  const scheduledAt = insertParams?.[2] as unknown as Date | string;
  assert.ok(new Date(scheduledAt).getTime() > Date.now() + 60_000);
});

test("create_post: an unconnected Instagram account is rejected, like in the calendar", async () => {
  const result = await withPool(createHandlers(false), () =>
    callMcpTool(
      "create_post",
      { caption: "Hello world", mediaUrl: "https://ex.com/a.jpg", channel: "instagram", scheduleAt: new Date(Date.now() + 3600_000).toISOString() },
      U1,
    ),
  );
  assert.match(text(result), /Connect Instagram/);
});

// --- add_idea --------------------------------------------------------------

test("add_idea: saves the idea for the owner and validates the text", async () => {
  let params: unknown[] | null = null;
  const handlers: FakeHandler[] = [
    {
      match: /insert into socialapp\.ideas/,
      reply: (p) => {
        params = p;
        return [{ id: "i1" }];
      },
    },
  ];
  const missing = await withPool([], () => callMcpTool("add_idea", {}, U1));
  assert.match(text(missing), /text is required/);
  const tooLong = await withPool(handlers, () => callMcpTool("add_idea", { text: "x".repeat(2001) }, U1));
  assert.match(text(tooLong), /2,000 characters/);

  const ok = await withPool(handlers, () =>
    callMcpTool("add_idea", { text: "A post about our new studio", mediaUrl: "https://ex.com/b.jpg", status: "todo" }, U1),
  );
  assert.deepEqual(json(ok), { ok: true, ideaId: "i1" });
  assert.equal(params?.[0], U1);
  assert.equal(params?.[3], "todo");
});

// --- get_analytics_summary -------------------------------------------------

test("get_analytics_summary: totals and top posts for the owner's published posts", async () => {
  let daysParam: unknown = null;
  const handlers: FakeHandler[] = [
    {
      match: /with rp as/,
      reply: (params) => {
        // getPostPerformance takes the day count as a [from, to) range now.
        daysParam = Math.round(((params[2] as Date).getTime() - (params[1] as Date).getTime()) / 86_400_000);
        return [
          { id: "p1", caption: "big one", publishedAt: "2026-11-01T09:00:00Z", platforms: ["instagram"], reach: 100, impressions: 150, likes: 10, comments: 2, saved: 3, linkClicks: 0 },
          { id: "p2", caption: "small one", publishedAt: "2026-11-02T09:00:00Z", platforms: ["instagram"], reach: 50, impressions: 60, likes: 4, comments: 1, saved: null, linkClicks: 0 },
        ];
      },
    },
  ];
  const result = json(await withPool(handlers, () => callMcpTool("get_analytics_summary", {}, U1))) as {
    days: number;
    publishedPosts: number;
    totalReach: number;
    totalLikes: number;
    topPosts: { caption: string; reach: number | null }[];
  };
  assert.equal(daysParam, 30);
  assert.equal(result.days, 30);
  assert.equal(result.publishedPosts, 2);
  assert.equal(result.totalReach, 150);
  assert.equal(result.totalLikes, 14);
  assert.equal(result.topPosts.length, 2);
  assert.equal(result.topPosts[0].caption, "big one");

  await withPool(handlers, () => callMcpTool("get_analytics_summary", { days: 90 }, U1));
  assert.equal(daysParam, 90);
});

// --- unknown tool ----------------------------------------------------------

test("callMcpTool: an unknown tool returns an error result", async () => {
  const result = await withPool([], () => callMcpTool("nope", {}, U1));
  assert.equal(result.isError, true);
  assert.match(text(result), /Unknown tool/);
});

// --- /api/mcp route: auth + JSON-RPC ---------------------------------------

const KEY = `poskoo_${"a".repeat(32)}`;

function mcpRequest(body: unknown, key?: string): Request {
  return new Request("http://localhost/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", ...(key ? { authorization: `Bearer ${key}` } : {}) },
    body: JSON.stringify(body),
  });
}

const routeHandlers: FakeHandler[] = [
  {
    match: /^select id, user_id from socialapp\.api_keys/,
    reply: (params) => (params[0] === hashToken(KEY) ? [{ id: "k1", user_id: U1 }] : []),
  },
  { match: /^update socialapp\.api_keys set last_used_at=now\(\)/, reply: () => [] },
  { match: /from socialapp\.social_accounts where user_id=\$1 order by platform/, reply: () => [] },
  { match: /from socialapp\.youtube_channels where user_id=\$1 order by updated_at/, reply: () => [] },
];

test("route: missing or invalid API keys get 401 with WWW-Authenticate", async () => {
  const { POST } = await import("../app/api/mcp/route.ts");
  const noKey = await withPool(routeHandlers, () => POST(mcpRequest({ id: 1, method: "initialize" })));
  assert.equal(noKey.status, 401);
  assert.equal(noKey.headers.get("www-authenticate"), "Bearer");
  const badKey = await withPool(routeHandlers, () => POST(mcpRequest({ id: 1, method: "initialize" }, "poskoo_bogus")));
  assert.equal(badKey.status, 401);
});

test("route: initialize, tools/list and tools/call work for a valid key", async () => {
  const { POST } = await import("../app/api/mcp/route.ts");
  const init = await withPool(routeHandlers, () => POST(mcpRequest({ id: 1, method: "initialize" }, KEY)));
  assert.equal(init.status, 200);
  const initBody = (await init.json()) as { result: { protocolVersion: string; serverInfo: { name: string } } };
  assert.equal(initBody.result.protocolVersion, "2025-06-18");
  assert.equal(initBody.result.serverInfo.name, "poskoo");

  const list = await withPool(routeHandlers, () => POST(mcpRequest({ id: 2, method: "tools/list" }, KEY)));
  const listBody = (await list.json()) as { result: { tools: { name: string }[] } };
  assert.deepEqual(
    listBody.result.tools.map((t) => t.name).sort(),
    ["add_idea", "create_post", "get_analytics_summary", "list_channels", "list_posts"],
  );
  assert.equal(listBody.result.tools.length, MCP_TOOLS.length);

  const call = await withPool(routeHandlers, () =>
    POST(mcpRequest({ id: 3, method: "tools/call", params: { name: "list_channels", arguments: {} } }, KEY)),
  );
  const callBody = (await call.json()) as { result: { content: { text: string }[] } };
  assert.deepEqual(JSON.parse(callBody.result.content[0].text), []);
});

test("route: notifications get 202, bad JSON gets 400, GET/DELETE are allowed", async () => {
  const { POST, GET, DELETE } = await import("../app/api/mcp/route.ts");
  const note = await withPool(routeHandlers, () => POST(mcpRequest({ method: "notifications/initialized" }, KEY)));
  assert.equal(note.status, 202);

  const bad = await withPool(routeHandlers, () =>
    POST(new Request("http://localhost/api/mcp", { method: "POST", headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" }, body: "not json" })),
  );
  assert.equal(bad.status, 400);

  assert.equal((await GET()).status, 405);
  assert.equal((await DELETE()).status, 204);
});

test("MCP requests are rate limited per API key, and keys do not share a bucket", async () => {
  const { mcpRateLimit, MCP_KEY_LIMIT_PER_MINUTE } = await import("./mcp.ts");
  const { resetRateLimits } = await import("./rateLimit.ts");
  resetRateLimits();
  const now = 1_000_000;
  for (let i = 0; i < MCP_KEY_LIMIT_PER_MINUTE; i++) assert.equal(mcpRateLimit("poskoo_a", "1.1.1.1", now).ok, true);
  const blocked = mcpRateLimit("poskoo_a", "2.2.2.2", now);
  assert.equal(blocked.ok, false);
  assert.equal(mcpRateLimit("poskoo_b", "3.3.3.3", now).ok, true);
  assert.equal(mcpRateLimit("poskoo_a", "2.2.2.2", now + 61_000).ok, true);
  resetRateLimits();
});
