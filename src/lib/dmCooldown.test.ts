import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";

test("manual DM: an Instagram rate limit persists the account cooldown and later sends respect it", async () => {
  const account = { id: "acc-1", external_id: "ig-1", access_token_enc: "" as string | null };
  let cooldown: Date | null = null;
  const { pool, calls } = createFakePool([
    { match: /^select dm_cooldown_until from socialapp\.social_accounts/, reply: () => [{ dm_cooldown_until: cooldown }] },
    {
      match: /^update socialapp\.social_accounts set dm_cooldown_until = greatest/,
      reply: (params) => {
        assert.equal(params[0], "acc-1");
        cooldown = new Date(Date.now() + Number(params[1]));
        return [];
      },
    },
  ]);
  const restore = installFakePool(pool);
  const previousFetch = globalThis.fetch;
  let fetches = 0;
  globalThis.fetch = (async () => {
    fetches += 1;
    return new Response(JSON.stringify({ error: { message: "Too many calls", code: 4 } }), { status: 400 });
  }) as typeof fetch;
  try {
    const { encryptToken } = await import("./crypto.ts");
    account.access_token_enc = encryptToken("tok");
    const { guardedDmSend } = await import("./dmCooldown.ts");
    const { sendDirectMessage } = await import("./igGraph.ts");

    const first = await guardedDmSend(account, () => sendDirectMessage(account, "user-9", "hello"));
    assert.equal(first.ok, false);
    assert.equal(first.ok ? false : first.rateLimited, true);
    assert.ok(cooldown && (cooldown as Date).getTime() > Date.now() + 10 * 60_000, "cooldown stored in the database");
    assert.equal(fetches, 1);

    // A new request (new process / instance) reads the stored cooldown and does not call Instagram.
    const second = await guardedDmSend(account, () => sendDirectMessage(account, "user-9", "hello again"));
    assert.equal(second.ok, false);
    assert.match(second.ok ? "" : second.error, /slow down/);
    assert.equal(fetches, 1);
    assert.ok(calls.some((c) => /dm_cooldown_until = greatest/.test(c.sql)));
  } finally {
    globalThis.fetch = previousFetch;
    restore();
  }
});

test("manual DM: sends normally when there is no cooldown and reports other errors plainly", async () => {
  const account = { id: "acc-2", external_id: "ig-2", access_token_enc: null as string | null };
  const { pool } = createFakePool([
    { match: /^select dm_cooldown_until/, reply: () => [{ dm_cooldown_until: new Date(Date.now() - 1000) }] },
  ]);
  const restore = installFakePool(pool);
  try {
    const { guardedDmSend } = await import("./dmCooldown.ts");
    let sent = 0;
    assert.deepEqual(await guardedDmSend(account, async () => { sent += 1; }), { ok: true });
    assert.equal(sent, 1);
    const failed = await guardedDmSend(account, async () => { throw new Error("socket hang up"); });
    assert.deepEqual(failed, { ok: false, error: "Instagram didn't accept the reply. Please try again." });
  } finally {
    restore();
  }
});
