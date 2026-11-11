import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { REF_WINDOW_MS, normalizeCode, parseRefCookie, refCookieValue } from "./referralCode.ts";
import { attributeReferral, maskEmail, newReferralCode, qualifyReferrals, sameMailbox } from "./referrals.ts";

const NOW = Date.parse("2026-11-11T12:00:00Z");
const DAY = 86_400_000;
const REFERRER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

type U = { id: string; email: string; created_at: Date; referred_by_user_id: string | null };

function world(users: U[], codes: Record<string, string>) {
  const referrals: { referrer: string; referred: string; code: string }[] = [];
  const { pool } = createFakePool([
    {
      match: /^select rc\.user_id, u\.email from socialapp\.referral_codes/,
      reply: (p) => {
        const owner = codes[String(p[0])];
        const u = users.find((x) => x.id === owner);
        return u ? [{ user_id: u.id, email: u.email }] : [];
      },
    },
    {
      match: /^select email, created_at, referred_by_user_id from socialapp\.users/,
      reply: (p) => users.filter((u) => u.id === p[0]).map(({ email, created_at, referred_by_user_id }) => ({ email, created_at, referred_by_user_id })),
    },
    {
      match: /^insert into socialapp\.referrals/,
      reply: (p) => {
        if (referrals.some((r) => r.referred === p[1])) return [];
        referrals.push({ referrer: String(p[0]), referred: String(p[1]), code: String(p[2]) });
        return [{ id: `ref-${referrals.length}` }];
      },
    },
    {
      match: /^update socialapp\.users set referred_by_user_id/,
      reply: (p) => {
        const u = users.find((x) => x.id === p[0]);
        if (u && !u.referred_by_user_id) u.referred_by_user_id = String(p[1]);
        return [];
      },
    },
  ]);
  return { pool, referrals, users };
}

const referrer: U = { id: REFERRER, email: "jane.doe@gmail.com", created_at: new Date(NOW - 90 * DAY), referred_by_user_id: null };
const newUser = (id: string, email: string, ageMs = 60_000): U => ({ id, email, created_at: new Date(NOW - ageMs), referred_by_user_id: null });

async function inWorld<T>(w: ReturnType<typeof world>, fn: () => Promise<T>): Promise<T> {
  const restore = installFakePool(w.pool);
  try {
    return await fn();
  } finally {
    restore();
  }
}

test("referral cookie: valid for 60 days, rejects expired, future and malformed values", () => {
  assert.deepEqual(parseRefCookie(refCookieValue("ABCD2345", NOW - 59 * DAY), NOW), { code: "ABCD2345", issuedAt: NOW - 59 * DAY });
  assert.ok(parseRefCookie(refCookieValue("ABCD2345", NOW - REF_WINDOW_MS), NOW));
  assert.equal(parseRefCookie(refCookieValue("ABCD2345", NOW - REF_WINDOW_MS - 1), NOW), null);
  assert.equal(parseRefCookie(refCookieValue("ABCD2345", NOW + DAY), NOW), null);
  assert.equal(parseRefCookie("ABCD2345", NOW), null);
  assert.equal(parseRefCookie("AB.123", NOW), null);
  assert.equal(parseRefCookie("<script>.1731320000000", NOW), null);
  assert.equal(normalizeCode(" abcd2345 "), "ABCD2345");
  assert.equal(normalizeCode("abc"), null);
  assert.match(newReferralCode(), /^[A-HJ-NP-Z2-9]{8}$/);
});

test("attribution stores the referrer on a fresh sign-up", async () => {
  const w = world([referrer, newUser("u-new", "sam@example.com")], { ABCD2345: REFERRER });
  await inWorld(w, async () => {
    const result = await attributeReferral("u-new", refCookieValue("ABCD2345", NOW - 3 * DAY), NOW);
    assert.deepEqual(result, { ok: true, referrerUserId: REFERRER });
    assert.deepEqual(w.referrals, [{ referrer: REFERRER, referred: "u-new", code: "ABCD2345" }]);
    assert.equal(w.users.find((u) => u.id === "u-new")?.referred_by_user_id, REFERRER);
  });
});

test("self-referral is refused: same user, or the same mailbox (case, +tag, Gmail dots)", async () => {
  assert.ok(sameMailbox("Jane.Doe+promo@googlemail.com", "janedoe@gmail.com"));
  assert.ok(!sameMailbox("jane@example.com", "jane2@example.com"));
  assert.ok(!sameMailbox("j.ane@example.com", "jane@example.com"));
  const w = world([referrer, newUser("u-alt", "JaneDoe+2@gmail.com")], { ABCD2345: REFERRER });
  await inWorld(w, async () => {
    const cookie = refCookieValue("ABCD2345", NOW - DAY);
    assert.deepEqual(await attributeReferral(REFERRER, cookie, NOW), { ok: false, reason: "self" });
    assert.deepEqual(await attributeReferral("u-alt", cookie, NOW), { ok: false, reason: "self" });
    assert.equal(w.referrals.length, 0);
  });
});

test("duplicates: a user is attributed at most once (first touch kept)", async () => {
  const other: U = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", email: "other@example.com", created_at: new Date(NOW - 9 * DAY), referred_by_user_id: null };
  const w = world([referrer, other, newUser("u-new", "sam@example.com")], { ABCD2345: REFERRER, ZZZZ9999: other.id });
  await inWorld(w, async () => {
    assert.equal((await attributeReferral("u-new", refCookieValue("ABCD2345", NOW - DAY), NOW)).ok, true);
    assert.deepEqual(await attributeReferral("u-new", refCookieValue("ZZZZ9999", NOW - DAY), NOW), { ok: false, reason: "already" });
    assert.deepEqual(await attributeReferral("u-new", refCookieValue("ABCD2345", NOW - DAY), NOW), { ok: false, reason: "already" });
    assert.equal(w.referrals.length, 1);
    assert.equal(w.referrals[0].referrer, REFERRER);
  });
});

test("window and freshness: expired cookie, unknown code and existing accounts are not attributed", async () => {
  const w = world([referrer, newUser("u-new", "sam@example.com"), newUser("u-old", "old@example.com", 2 * 60 * 60 * 1000)], { ABCD2345: REFERRER });
  await inWorld(w, async () => {
    assert.deepEqual(await attributeReferral("u-new", refCookieValue("ABCD2345", NOW - 61 * DAY), NOW), { ok: false, reason: "no_cookie" });
    assert.deepEqual(await attributeReferral("u-new", refCookieValue("NOPE2345", NOW - DAY), NOW), { ok: false, reason: "unknown_code" });
    assert.deepEqual(await attributeReferral("u-old", refCookieValue("ABCD2345", NOW - DAY), NOW), { ok: false, reason: "not_new" });
    assert.deepEqual(await attributeReferral("u-new", undefined, NOW), { ok: false, reason: "no_cookie" });
    assert.equal(w.referrals.length, 0);
  });
});

test("qualification runs one guarded update and never throws", async () => {
  let seen: unknown[] = [];
  let sql = "";
  const ok = createFakePool([{ match: /^update socialapp\.referrals r set qualified_at/, reply: (p, s) => { seen = p; sql = s; return [{ id: "r1" }]; } }]);
  let restore = installFakePool(ok.pool);
  try {
    assert.equal(await qualifyReferrals(REFERRER), 1);
    assert.deepEqual(seen, [REFERRER, 500]);
    // One social account can qualify one referral ever.
    assert.match(sql, /not exists \( select 1 from socialapp\.referrals q where q\.qualified_platform = a\.platform and q\.qualified_external_id = a\.external_id \)/);
  } finally {
    restore();
  }
  const broken = createFakePool([]);
  restore = installFakePool(broken.pool);
  const prev = console.error;
  console.error = () => {};
  try {
    assert.equal(await qualifyReferrals(), 0);
  } finally {
    console.error = prev;
    restore();
  }
});

test("maskEmail hides most of the address", () => {
  assert.equal(maskEmail("jane.doe@example.com"), "ja•••@example.com");
  assert.equal(maskEmail("bad"), "•••");
});
