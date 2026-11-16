// Reconnect-needed e-mails for every network, once per expiry; the monthly DM-limit e-mail key.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { notifyDmLimitReached, notifyExpiredAccounts, utcMonthKey } from "./emailNotify.ts";
import { autoDmLimitBanner, autoDmLimitReached } from "./planLimits.ts";

let restore: (() => void) | null = null;
const realInfo = console.info;
afterEach(() => {
  restore?.();
  restore = null;
  console.info = realInfo;
});

function world(expired: { id: string; platform: string; username: string | null; updated_at: Date }[]) {
  const keys = new Set<string>();
  const mails: string[] = [];
  console.info = (msg?: unknown) => void mails.push(String(msg));
  const { pool, calls } = createFakePool([
    {
      match: /^select a\.id, a\.platform, a\.username, a\.updated_at, u\.email, u\.name/,
      reply: () => expired.map((e) => ({ ...e, email: "owner@example.com", name: "Sam" })),
    },
    { match: /^insert into socialapp\.email_sends/, reply: (p) => (keys.has(String(p[0])) ? [] : (keys.add(String(p[0])), [{ key: p[0] }])) },
    { match: /^select email, name from socialapp\.users where id=\$1/, reply: () => [{ email: "owner@example.com", name: "Sam" }] },
  ]);
  restore = installFakePool(pool);
  return { keys, mails, calls };
}

test("reconnect e-mails go out for every expired network once per expiry, and again after a new expiry", async () => {
  const at = new Date("2026-11-14T10:00:00Z");
  const accounts = [
    { id: "a-ig", platform: "instagram", username: "shop", updated_at: at },
    { id: "a-li", platform: "linkedin", username: "Sam Rivera", updated_at: at },
    { id: "a-tt", platform: "tiktok", username: null, updated_at: at },
  ];
  const w = world(accounts);
  assert.equal(await notifyExpiredAccounts(), 3);
  assert.equal(await notifyExpiredAccounts(), 0, "a second daily run sends nothing new");
  const subjects = w.mails.filter((m) => m.includes("[email:reconnect]")).join("\n");
  assert.match(subjects, /Reconnect Instagram/);
  assert.match(subjects, /Reconnect LinkedIn/);
  assert.match(subjects, /Reconnect TikTok/);
  const sql = w.calls.find((c) => c.sql.includes("from socialapp.social_accounts a"))!;
  assert.match(sql.sql, /a\.status = 'expired' and a\.updated_at > now\(\)/);
  // Reconnected and expired again later: a new episode, a new e-mail.
  accounts[1].updated_at = new Date("2026-11-15T09:00:00Z");
  assert.equal(await notifyExpiredAccounts(), 1);
});

test("monthly DM-limit e-mail: one per user per UTC month", async () => {
  const w = world([]);
  const nov = new Date("2026-11-20T12:00:00Z");
  await notifyDmLimitReached("user-1", { limit: 500, plan: "Free", canUpgrade: false }, nov);
  await notifyDmLimitReached("user-1", { limit: 500, plan: "Free", canUpgrade: false }, nov);
  await notifyDmLimitReached("user-1", { limit: 500, plan: "Free", canUpgrade: false }, new Date("2026-12-02T00:00:00Z"));
  assert.deepEqual([...w.keys], ["dm-limit:user-1:2026-11", "dm-limit:user-1:2026-12"]);
  assert.equal(w.mails.filter((m) => m.includes("[email:dm_limit]")).length, 2);
  assert.equal(utcMonthKey(new Date("2026-01-31T23:59:59Z")), "2026-01");
});

test("dashboard flag for paused auto-DMs uses the sender's rule (sent this month >= limit)", () => {
  assert.equal(autoDmLimitReached(499, 500), false);
  assert.equal(autoDmLimitReached(500, 500), true);
  assert.match(autoDmLimitBanner(1500, "Free"), /reached this month's 1,500 auto-DMs on the Free plan/);
});
