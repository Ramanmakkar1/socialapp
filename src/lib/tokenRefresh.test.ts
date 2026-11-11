import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";

const day = 86_400_000;

function world(threadsRows: (enc: (s: string) => string) => unknown[]) {
  const updates: { sql: string; params: unknown[] }[] = [];
  let selectSql = "";
  const handlers = (enc: (s: string) => string) => [
    { match: /auth_type='instagram_login'/, reply: () => [] },
    { match: /auth_type='facebook_login'/, reply: () => [] },
    {
      match: /^select .*platform='threads'/,
      reply: (_p: unknown[], sql: string) => {
        selectSql = sql;
        return threadsRows(enc);
      },
    },
    { match: /^update socialapp\.social_accounts/, reply: (params: unknown[], sql: string) => { updates.push({ sql, params }); return []; } },
  ];
  return { updates, handlers, selectSql: () => selectSql };
}

test("Threads tokens inside the 10-day window are refreshed and the new token + expiry are stored encrypted", async () => {
  const { encryptToken, decryptToken } = await import("./crypto.ts");
  const w = world((enc) => [{ id: "t1", access_token_enc: enc("old-threads"), token_expires_at: new Date(Date.now() + 3 * day) }]);
  const { pool } = createFakePool(w.handlers(encryptToken));
  const restore = installFakePool(pool);
  try {
    const { refreshExpiringTokens } = await import("./tokenRefresh.ts");
    const seen: string[] = [];
    const result = await refreshExpiringTokens(50, {
      checkPage: async () => "valid",
      refreshThreads: async (token) => {
        seen.push(token);
        return { access_token: "new-threads", expires_in: 5_184_000 };
      },
    });
    assert.deepEqual(seen, ["old-threads"]);
    assert.equal(result.threadsRefreshed, 1);
    assert.match(w.selectSql(), /status='active'/);
    assert.match(w.selectSql(), /interval '10 days'/);
    const upd = w.updates.find((u) => u.sql.includes("access_token_enc=$2"));
    assert.ok(upd);
    assert.equal(upd.params[0], "t1");
    assert.equal(decryptToken(String(upd.params[1])), "new-threads");
    assert.equal(upd.params[2], "5184000");
  } finally {
    restore();
  }
});

test("an already-expired Threads token marks the account 'expired' without calling Threads", async () => {
  const { encryptToken } = await import("./crypto.ts");
  const w = world((enc) => [{ id: "t-old", access_token_enc: enc("x"), token_expires_at: new Date(Date.now() - day) }]);
  const { pool } = createFakePool(w.handlers(encryptToken));
  const restore = installFakePool(pool);
  try {
    const { refreshExpiringTokens } = await import("./tokenRefresh.ts");
    let called = false;
    const result = await refreshExpiringTokens(50, {
      checkPage: async () => "valid",
      refreshThreads: async () => {
        called = true;
        return { access_token: "n", expires_in: 1 };
      },
    });
    assert.equal(called, false);
    assert.equal(result.threadsExpired, 1);
    assert.deepEqual(w.updates.filter((u) => u.sql.includes("status='expired'")).map((u) => u.params[0]), ["t-old"]);
  } finally {
    restore();
  }
});

test("a failed Threads refresh is counted and the stored token is left alone for the next run", async () => {
  const { encryptToken } = await import("./crypto.ts");
  const w = world((enc) => [{ id: "t2", access_token_enc: enc("tok"), token_expires_at: new Date(Date.now() + 2 * day) }]);
  const { pool } = createFakePool(w.handlers(encryptToken));
  const restore = installFakePool(pool);
  const origError = console.error;
  console.error = () => {};
  try {
    const { refreshExpiringTokens } = await import("./tokenRefresh.ts");
    const result = await refreshExpiringTokens(50, {
      checkPage: async () => "valid",
      refreshThreads: async () => {
        throw new Error("Threads token refresh failed (400)");
      },
    });
    assert.equal(result.threadsFailed, 1);
    assert.equal(result.threadsRefreshed, 0);
    assert.equal(w.updates.length, 0);
  } finally {
    console.error = origError;
    restore();
  }
});
