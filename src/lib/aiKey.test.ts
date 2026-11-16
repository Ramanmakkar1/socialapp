import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { bustAnthropicKeyCache, resolveAnthropicKey, saveStoredAnthropicKey, validateAnthropicKey } from "./aiKey.ts";
import { encryptToken } from "./crypto.ts";
import { featureReadiness, isFeatureReady } from "./featureReadiness.ts";
import { isFeatureReadyNow, planReadinessNow } from "./featureReadinessNow.ts";

// Obviously fake, never a real key.
const FAKE_KEY = `sk-ant-test-${"x".repeat(32)}wxyz`;

function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>) {
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    saved[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  return fn().finally(() => {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    bustAnthropicKeyCache();
  });
}

test("validateAnthropicKey accepts sk-ant- keys and rejects paste mistakes", () => {
  assert.deepEqual(validateAnthropicKey(`  ${FAKE_KEY}\n`), { ok: true, key: FAKE_KEY });
  assert.equal(validateAnthropicKey("").ok, false);
  assert.equal(validateAnthropicKey("sk-live-abc").ok, false);
  assert.equal(validateAnthropicKey(`${FAKE_KEY} extra`).ok, false);
  assert.equal(validateAnthropicKey(undefined).ok, false);
});

test("a stored key makes AI ready (featureReadiness flag)", () => {
  assert.equal(isFeatureReady("ai", { ANTHROPIC_API_KEY_STORED: "1" }), true);
  assert.equal(isFeatureReady("ai_replies", { ANTHROPIC_API_KEY_STORED: "1" }), false);
  assert.equal(isFeatureReady("ai_replies", { ANTHROPIC_API_KEY_STORED: "1", AI_REPLIES_ENABLED: "1" }), true);
  assert.match(featureReadiness("ai", {}).missing.join(" "), /ANTHROPIC_API_KEY/);
});

test("resolveAnthropicKey: env var wins and never touches the database", async () => {
  const { pool, calls } = createFakePool([]);
  const restore = installFakePool(pool);
  try {
    await withEnv({ ANTHROPIC_API_KEY: "env-key" }, async () => {
      assert.equal(await resolveAnthropicKey(), "env-key");
      assert.equal(calls.length, 0);
    });
  } finally {
    restore();
  }
});

test("resolveAnthropicKey: falls back to the stored key, cached, and readiness follows it", async () => {
  bustAnthropicKeyCache();
  let enc = "";
  const { pool, calls } = createFakePool([
    { match: /from socialapp\.app_settings/, reply: () => [{ value_enc: enc, hint: "wxyz", updated_at: new Date(), updated_by: "a@b.c" }] },
  ]);
  const restore = installFakePool(pool); // also sets a test TOKEN_ENCRYPTION_KEY
  enc = encryptToken(FAKE_KEY);
  try {
    await withEnv({ ANTHROPIC_API_KEY: undefined, NEXT_PHASE: undefined }, async () => {
      assert.equal(await resolveAnthropicKey(), FAKE_KEY);
      assert.equal(await isFeatureReadyNow("ai"), true);
      assert.deepEqual(await planReadinessNow(), { paidPlans: false, ai: true });
      assert.equal(calls.length, 1, "second and third reads come from the in-memory cache");
    });
  } finally {
    restore();
  }
});

test("missing table / build phase fail closed to 'not configured'", async () => {
  bustAnthropicKeyCache();
  const { pool } = createFakePool([]); // every query throws, like a missing app_settings table
  const restore = installFakePool(pool);
  try {
    await withEnv({ ANTHROPIC_API_KEY: undefined, NEXT_PHASE: undefined }, async () => {
      assert.equal(await resolveAnthropicKey(), null);
      assert.equal(await isFeatureReadyNow("ai"), false);
    });
    await withEnv({ ANTHROPIC_API_KEY: undefined, NEXT_PHASE: "phase-production-build" }, async () => {
      assert.equal(await resolveAnthropicKey(), null);
    });
  } finally {
    restore();
  }
});

test("saveStoredAnthropicKey stores ciphertext + last 4 only, and busts the cache", async () => {
  bustAnthropicKeyCache();
  let params: unknown[] = [];
  const { pool } = createFakePool([
    { match: /insert into socialapp\.app_settings/, reply: (p) => { params = p; return []; } },
  ]);
  const restore = installFakePool(pool);
  globalThis.__poskooAnthropicKeyCache = { at: Date.now(), value: null };
  try {
    await saveStoredAnthropicKey(FAKE_KEY, "admin@example.com");
    assert.equal(params[0], "anthropic_api_key");
    assert.ok(typeof params[1] === "string" && !(params[1] as string).includes(FAKE_KEY));
    assert.equal(params[2], "wxyz");
    assert.equal(globalThis.__poskooAnthropicKeyCache, undefined);
  } finally {
    restore();
  }
});
