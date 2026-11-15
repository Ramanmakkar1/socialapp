import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";
import { apiKeyAccess, createApiKey, generateApiKey, listApiKeys, revokeApiKey, userForApiKey } from "./apiKeys.ts";
import { hashToken } from "./password.ts";

const USER = "11111111-1111-4111-8111-111111111111";

async function withPool<T>(handlers: FakeHandler[], run: () => Promise<T>): Promise<T> {
  const { pool } = createFakePool(handlers);
  const restore = installFakePool(pool);
  try {
    return await run();
  } finally {
    restore();
  }
}

test("generateApiKey: poskoo_ + 32 hex chars, unique per call", () => {
  const a = generateApiKey();
  const b = generateApiKey();
  assert.match(a, /^poskoo_[0-9a-f]{32}$/);
  assert.notEqual(a, b);
});

test("createApiKey: stores only the hash and a 12-char prefix, returns the key once", async () => {
  let inserted: unknown[] | null = null;
  const result = await withPool(
    [
      {
        match: /^insert into socialapp\.api_keys/,
        reply: (params) => {
          inserted = params;
          return [];
        },
      },
    ],
    () => createApiKey(USER, "  Claude  "),
  );
  assert.ok("key" in result);
  assert.match(result.key, /^poskoo_[0-9a-f]{32}$/);
  assert.deepEqual(inserted, [USER, "Claude", hashToken(result.key), result.key.slice(0, 12), false]);
});

test("createApiKey: before migration 048 (no can_publish column) it still creates the key", async () => {
  const calls: string[] = [];
  const result = await withPool(
    [
      {
        match: /^insert into socialapp\.api_keys/,
        reply: (_params, sql) => {
          calls.push(sql);
          if (sql.includes("can_publish")) throw Object.assign(new Error("column does not exist"), { code: "42703" });
          return [];
        },
      },
    ],
    () => createApiKey(USER, "Claude", true),
  );
  assert.ok("key" in result);
  assert.equal(calls.length, 2);
});

test("apiKeyAccess: returns the owner and whether the key may publish (missing column = may publish)", async () => {
  const key = generateApiKey();
  const reply = (canPublish: boolean | null): FakeHandler[] => [
    { match: /^select id, user_id, .* from socialapp\.api_keys k where key_hash=\$1/, reply: () => [{ id: "k1", user_id: USER, can_publish: canPublish }] },
    { match: /^update socialapp\.api_keys set last_used_at=now\(\)/, reply: () => [] },
  ];
  assert.deepEqual(await withPool(reply(false), () => apiKeyAccess(key)), { userId: USER, canPublish: false });
  assert.deepEqual(await withPool(reply(true), () => apiKeyAccess(key)), { userId: USER, canPublish: true });
  assert.deepEqual(await withPool(reply(null), () => apiKeyAccess(key)), { userId: USER, canPublish: true });
});

test("createApiKey: a failed insert returns an error, not a key", async () => {
  const result = await withPool([], () => createApiKey(USER, "Claude"));
  assert.ok("error" in result);
});

test("userForApiKey: a valid key resolves its owner and refreshes last_used_at", async () => {
  const key = generateApiKey();
  let lastUsed: unknown[] | null = null;
  const handlers: FakeHandler[] = [
    {
      match: /^select id, user_id, .* from socialapp\.api_keys k where key_hash=\$1/,
      reply: (params) => (params[0] === hashToken(key) ? [{ id: "k1", user_id: USER }] : []),
    },
    {
      match: /^update socialapp\.api_keys set last_used_at=now\(\)/,
      reply: (params) => {
        lastUsed = params;
        return [];
      },
    },
  ];
  const owner = await withPool(handlers, () => userForApiKey(key));
  assert.equal(owner, USER);
  assert.deepEqual(lastUsed, ["k1"]);
});

test("userForApiKey: revoked, unknown and too-short keys resolve to null", async () => {
  const handlers: FakeHandler[] = [
    { match: /^select id, user_id, .* from socialapp\.api_keys/, reply: () => [] },
  ];
  assert.equal(await withPool(handlers, () => userForApiKey(generateApiKey())), null);
  assert.equal(await withPool(handlers, () => userForApiKey("short")), null);
});

test("userForApiKey: a missing api_keys table resolves to null", async () => {
  assert.equal(await withPool([], () => userForApiKey(generateApiKey())), null);
});

test("listApiKeys: a missing api_keys table yields an empty list", async () => {
  assert.deepEqual(await withPool([], () => listApiKeys(USER)), []);
});

test("revokeApiKey: revokes only the user's own key", async () => {
  let params: unknown[] | null = null;
  const result = await withPool(
    [
      {
        match: /^update socialapp\.api_keys set revoked_at = now\(\)/,
        reply: (p) => {
          params = p;
          return [];
        },
      },
    ],
    () => revokeApiKey(USER, "k1"),
  );
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(params, ["k1", USER]);
});
