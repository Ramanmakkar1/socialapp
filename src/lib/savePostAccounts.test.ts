// resolvePickedAccounts: the per-account targeting check behind savePostForUser.
import assert from "node:assert/strict";
import { test } from "node:test";
import { resolvePickedAccounts } from "./savePost.ts";

const U = "3230f748-f38f-46ea-b7f0-1e11e21b1487";
const A1 = "11111111-1111-4111-8111-111111111111";
const A2 = "22222222-2222-4222-8222-222222222222";
const YT = "33333333-3333-4333-8333-333333333333";

type Call = { sql: string; params: unknown[] };

function fakeRun(owned: string[]) {
  const calls: Call[] = [];
  const run = (async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    const ids = (params.find(Array.isArray) as string[] | undefined) ?? [];
    return ids.filter((id) => owned.includes(id)).map((id) => ({ id }));
  }) as unknown as Parameters<typeof resolvePickedAccounts>[4];
  return { run, calls };
}

test("one target per picked account; networks left out keep the old single-target behaviour", async () => {
  const { run, calls } = fakeRun([A1, A2, YT]);
  const r = await resolvePickedAccounts(U, ["instagram", "youtube", "threads"], { instagram: [A1, A2, A1], youtube: [YT] }, true, run);
  assert.ok(r.ok);
  assert.deepEqual(r.targets.instagram, [
    { socialAccountId: A1, youtubeChannelId: null },
    { socialAccountId: A2, youtubeChannelId: null },
  ]);
  assert.deepEqual(r.targets.youtube, [{ socialAccountId: null, youtubeChannelId: YT }]);
  assert.equal(r.targets.threads, undefined);
  assert.match(calls[0].sql, /platform=\$2.*status='active'/);
  assert.deepEqual(calls[0].params.slice(0, 2), [U, "instagram"]);
  assert.match(calls[1].sql, /youtube_channels/);
});

test("Facebook Pages are checked against the Instagram (Facebook login) rows that hold the Page", async () => {
  const { run, calls } = fakeRun([A1]);
  const r = await resolvePickedAccounts(U, ["facebook"], { facebook: [A1] }, false, run);
  assert.ok(r.ok);
  assert.match(calls[0].sql, /platform='instagram' and auth_type='facebook_login' and page_id is not null/);
  assert.doesNotMatch(calls[0].sql, /status='active'/, "drafts may keep an account that needs reconnecting");
});

test("someone else's account, a bad id or an empty pick is refused", async () => {
  const { run } = fakeRun([A1]);
  const notMine = await resolvePickedAccounts(U, ["instagram"], { instagram: [A1, A2] }, true, run);
  assert.equal(notMine.ok, false);
  assert.match(!notMine.ok ? notMine.error : "", /needs reconnecting/);
  const bad = await resolvePickedAccounts(U, ["instagram"], { instagram: ["not-a-uuid"] }, true, run);
  assert.deepEqual(bad, { ok: false, error: "Invalid account." });
  const empty = await resolvePickedAccounts(U, ["instagram"], { instagram: [] }, true, run);
  assert.deepEqual(empty, { ok: false, error: "Pick at least one Instagram account." });
});
