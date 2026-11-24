// Instagram reconnect ownership: an account owned by another Poskoo user is never taken over
// (Instagram Login and Facebook Login for Business paths).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";
import { INSTAGRAM_TAKEN_PATH, isInstagramTakenByOther, saveFacebookLoginAccount, saveInstagramLoginAccount } from "./metaAccounts.ts";

const realFetch = globalThis.fetch;
let restore: (() => void) | null = null;
afterEach(() => {
  globalThis.fetch = realFetch;
  restore?.();
  restore = null;
});

/** Fake DB with one existing owner (or none); `upsertRows` = rows the guarded upsert returns. */
function setup(owner: string | null, upsertRows: unknown[] = [{ id: "acc-1" }]) {
  const handlers: FakeHandler[] = [
    { match: /^select user_id from socialapp\.social_accounts where platform='instagram'/, reply: () => (owner ? [{ user_id: owner }] : []) },
    { match: /^insert into socialapp\.social_accounts/, reply: () => upsertRows },
    { match: /^update socialapp\.social_accounts set app_user_id/, reply: () => [] },
  ];
  const { pool, calls } = createFakePool(handlers);
  restore = installFakePool(pool);
  globalThis.fetch = (async () => Response.json({ success: true })) as typeof fetch;
  return calls;
}

const page = { pageId: "page-1", pageName: "Shop", pageToken: "page-token", igUserId: "ig-1", igUsername: "shop", igPicture: null };
const igInput = { igUserId: "ig-1", username: "shop", accessToken: "tok", expiresIn: 5_184_000, scopes: ["instagram_business_basic"], appUserId: "app-1" };

test("isInstagramTakenByOther: only another user's row counts as taken", async () => {
  setup("user-b");
  assert.equal(await isInstagramTakenByOther("user-a", "ig-1"), true);
  assert.equal(await isInstagramTakenByOther("user-b", "ig-1"), false);
});

test("Instagram Login: another user's account is refused and nothing is written", async () => {
  const calls = setup("user-b");
  assert.equal(await saveInstagramLoginAccount("user-a", igInput), "taken");
  assert.ok(!calls.some((c) => /^insert|^update/.test(c.sql)), "no write when the account belongs to someone else");
});

test("Instagram Login: reconnecting your own account updates it; the upsert never reassigns user_id", async () => {
  const calls = setup("user-a");
  assert.equal(await saveInstagramLoginAccount("user-a", igInput), "ok");
  const upsert = calls.find((c) => /^insert into socialapp\.social_accounts/.test(c.sql));
  assert.ok(upsert);
  assert.match(upsert.sql, /where social_accounts\.user_id = excluded\.user_id/);
  assert.doesNotMatch(upsert.sql, /set user_id=excluded\.user_id/);
  const appId = calls.find((c) => /set app_user_id/.test(c.sql));
  assert.ok(appId && /and user_id=\$2/.test(appId.sql), "the app-scoped id update is scoped to the owner");
});

test("Instagram Login: a race where another user wins the row (upsert updates nothing) is 'taken'", async () => {
  setup(null, []);
  assert.equal(await saveInstagramLoginAccount("user-a", igInput), "taken");
});

test("Instagram Login: a brand-new account is saved", async () => {
  setup(null);
  assert.equal(await saveInstagramLoginAccount("user-a", igInput), "ok");
});

test("Facebook Login: another user's account is refused, no write and no Page subscription", async () => {
  const calls = setup("user-b");
  let fetched = false;
  globalThis.fetch = (async () => {
    fetched = true;
    return Response.json({ success: true });
  }) as typeof fetch;
  const saved = await saveFacebookLoginAccount("user-a", page, ["instagram_basic"], "meta-1");
  assert.deepEqual(saved, { taken: true });
  assert.equal(fetched, false);
  assert.ok(!calls.some((c) => /^insert|^update/.test(c.sql)));
});

test("Facebook Login: own reconnect saves with the ownership-guarded upsert and subscribes the Page", async () => {
  const calls = setup("user-a");
  const saved = await saveFacebookLoginAccount("user-a", page, ["instagram_basic"], "meta-1");
  assert.deepEqual(saved, { subscribed: true });
  const upsert = calls.find((c) => /^insert into socialapp\.social_accounts/.test(c.sql));
  assert.ok(upsert);
  assert.match(upsert.sql, /where social_accounts\.user_id = excluded\.user_id/);
  assert.doesNotMatch(upsert.sql, /set user_id=excluded\.user_id/);
});

test("Facebook Login: race lost on the guarded upsert is 'taken'", async () => {
  setup(null, []);
  assert.deepEqual(await saveFacebookLoginAccount("user-a", page, [], null), { taken: true });
});

test("taken redirect reuses the Connect dialog's 'already connected to another Poskoo account' message", () => {
  assert.equal(INSTAGRAM_TAKEN_PATH, "/app/publish?net=instagram&connect_error=taken");
});
