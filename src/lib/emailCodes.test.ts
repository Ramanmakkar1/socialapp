import assert from "node:assert/strict";
import { test } from "node:test";
import { CODE_TTL_MS, MAX_CODE_ATTEMPTS, checkCode, codeMatches, generateCode, generateLinkToken, hashCode, normalizeCodeInput } from "./emailCodes.ts";

test("codes are 6 digits and tokens are long url-safe strings", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 300; i++) {
    const c = generateCode();
    assert.match(c, /^\d{6}$/);
    seen.add(c);
  }
  assert.ok(seen.size > 290, "codes should be random");
  const t = generateLinkToken();
  assert.match(t, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(t, generateLinkToken());
});

test("hashes never contain the code, are salted, and verify only the right code", () => {
  const h1 = hashCode("123456");
  const h2 = hashCode("123456");
  assert.ok(!h1.includes("123456"));
  assert.notEqual(h1, h2);
  assert.ok(codeMatches("123456", h1));
  assert.ok(codeMatches("123456", h2));
  assert.ok(!codeMatches("123457", h1));
  assert.ok(!codeMatches("12345", h1));
  assert.ok(!codeMatches("123456", "garbage"));
  assert.ok(!codeMatches("123456", ""));
});

test("input normalisation keeps digits only", () => {
  assert.equal(normalizeCodeInput(" 123 456 "), "123456");
  assert.equal(normalizeCodeInput("123-456"), "123456");
  assert.equal(normalizeCodeInput("1234567"), "123456");
});

test("checkCode: ok, wrong, expired, used, locked", () => {
  const now = 1_700_000_000_000;
  const row = { code_hash: hashCode("004211"), attempts: 0, expires_at: new Date(now + CODE_TTL_MS), used_at: null };
  assert.equal(checkCode(row, "004211", now), "ok");
  assert.equal(checkCode(row, "004 211", now), "ok");
  assert.equal(checkCode(row, "999999", now), "wrong");
  assert.equal(checkCode(row, "004211", now + CODE_TTL_MS), "expired");
  assert.equal(checkCode(row, "004211", now + CODE_TTL_MS + 1), "expired");
  assert.equal(checkCode({ ...row, used_at: new Date(now) }, "004211", now), "used");
  assert.equal(checkCode({ ...row, attempts: MAX_CODE_ATTEMPTS - 1 }, "004211", now), "ok");
  // After 5 wrong tries even the right code is refused.
  assert.equal(checkCode({ ...row, attempts: MAX_CODE_ATTEMPTS }, "004211", now), "locked");
  assert.equal(checkCode(null, "004211", now), "expired");
});

test("codes live 15 minutes and allow 5 attempts", () => {
  assert.equal(CODE_TTL_MS, 15 * 60 * 1000);
  assert.equal(MAX_CODE_ATTEMPTS, 5);
});
