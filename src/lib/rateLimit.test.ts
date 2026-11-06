import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIp, rateLimit, resetRateLimits, tooManyMessage } from "./rateLimit.ts";

test("allows up to the limit per window, then blocks until the window resets", () => {
  resetRateLimits();
  const t0 = 1_000_000;
  for (let i = 0; i < 5; i++) assert.deepEqual(rateLimit("login:ip:a@b.c", 5, 60_000, t0), { ok: true });
  const blocked = rateLimit("login:ip:a@b.c", 5, 60_000, t0 + 1000);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.ok ? 0 : blocked.retryAfterMs, 59_000);
  assert.deepEqual(rateLimit("login:ip:other@b.c", 5, 60_000, t0 + 1000), { ok: true });
  assert.deepEqual(rateLimit("login:ip:a@b.c", 5, 60_000, t0 + 60_001), { ok: true });
});

test("client ip prefers Cloudflare, then the first forwarded address", () => {
  const h = (m: Record<string, string>) => ({ get: (n: string) => m[n] ?? null });
  assert.equal(clientIp(h({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" })), "1.1.1.1");
  assert.equal(clientIp(h({ "x-forwarded-for": "3.3.3.3, 10.0.0.1" })), "3.3.3.3");
  assert.equal(clientIp(h({})), "unknown");
  assert.equal(tooManyMessage(61_000), "Too many attempts. Please wait 2 minutes and try again.");
});
