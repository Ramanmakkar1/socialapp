// Media library: owner scoping, lifecycle (library files survive publishing), alt text, quotas.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { cleanAlt, deleteAssets, isGif, keyBelongsTo, listStatement, purgedItem, recordAsset } from "./mediaLibrary.ts";
import { keysToDelete, releasedMediaJson } from "./mediaLifecycle.ts";
import { PLAN_MEDIA_LIMITS, MB, GB, libraryQuotaMessage } from "./mediaLimits.ts";
import { mediaItems } from "./networks/common.ts";

const OWNER = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";
const KEY = `${OWNER}/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.jpg`;
const URL_A = `https://poskoo.com/api/media/${KEY}?exp=1&sig=x`;

test("listStatement always scopes to the owner and live rows, whatever the filter", () => {
  for (const f of [{}, { q: "x" }, { kind: "video" as const }, { kind: "gif" as const }, { ids: ["33333333-3333-3333-3333-333333333333"] }]) {
    const { text, params } = listStatement(OWNER, f);
    assert.match(text, /where user_id=\$1 and deleted_at is null/);
    assert.equal(params[0], OWNER);
  }
});

test("listStatement escapes LIKE wildcards and caps the page size", () => {
  const { params } = listStatement(OWNER, { q: "50%_off", limit: 5000 });
  assert.ok(params.includes("%50\\%\\_off%"));
  assert.ok(params.includes(200));
});

test("listStatement drops ids that are not uuids", () => {
  const { params } = listStatement(OWNER, { ids: ["not-an-id", "33333333-3333-3333-3333-333333333333"] });
  assert.deepEqual(params[1], ["33333333-3333-3333-3333-333333333333"]);
});

test("keyBelongsTo: only originals in the owner's own folder", () => {
  assert.equal(keyBelongsTo(OWNER, KEY), true);
  assert.equal(keyBelongsTo(OTHER, KEY), false);
  assert.equal(keyBelongsTo(OWNER, KEY.replace(".jpg", ".thumb.jpg")), false);
});

test("recordAsset refuses a key from another workspace's folder (no query)", async () => {
  const { pool, calls } = createFakePool([]);
  const restore = installFakePool(pool);
  try {
    const r = await recordAsset({ ownerId: OTHER, key: KEY, name: "a.jpg", mime: "image/jpeg", kind: "image", bytes: 10 });
    assert.equal(r, null);
    assert.equal(calls.length, 0);
  } finally {
    restore();
  }
});

test("deleteAssets only touches the owner's rows and honours canDelete (members: own uploads)", async () => {
  const ME = "44444444-4444-4444-4444-444444444444";
  const mine = { id: "55555555-5555-5555-5555-555555555555", storage_key: KEY, original_name: "a.jpg", mime: "image/jpeg", kind: "image", bytes: 10, width: null, height: null, duration_sec: null, alt_text: "", thumb_key: null, uploaded_by_user_id: ME, created_at: new Date().toISOString() };
  const theirs = { ...mine, id: "66666666-6666-6666-6666-666666666666", storage_key: KEY.replace("aaaaaaaa-aaaa", "bbbbbbbb-bbbb"), uploaded_by_user_id: "77777777-7777-7777-7777-777777777777" };
  const { pool, calls } = createFakePool([
    { match: /^select \* from socialapp\.media_assets/, reply: (p) => (p[0] === OWNER ? [mine, theirs] : []) },
    { match: /^update socialapp\.media_assets set deleted_at/, reply: (p) => ((p[1] as string[]).includes(mine.id) ? [{ storage_key: mine.storage_key, thumb_key: null }] : []) },
    { match: /from socialapp\.(ideas|dm_rules|bio_pages|lead_magnets|products|media_assets) x/, reply: () => [] },
    { match: /from socialapp\.scheduled_posts/, reply: () => [] },
  ]);
  const restore = installFakePool(pool);
  try {
    const r = await deleteAssets(OWNER, [mine.id, theirs.id], (a) => a.uploadedBy === ME, "https://poskoo.com");
    assert.deepEqual(r, { deleted: 1, refused: 1 });
    const upd = calls.find((c) => c.sql.startsWith("update socialapp.media_assets set deleted_at"))!;
    assert.equal(upd.params[0], OWNER);
    assert.deepEqual(upd.params[1], [mine.id]);
    for (const c of calls) if (/socialapp\.(media_assets|scheduled_posts)/.test(c.sql)) assert.equal(c.params[0], OWNER);
  } finally {
    restore();
  }
});

test("publishing keeps library files: releasedMediaJson leaves library items untouched", () => {
  const media = [{ type: "image", url: URL_A }];
  const kept = releasedMediaJson(OWNER, media, () => null, null, new Set([KEY])) as Record<string, unknown>[];
  assert.equal(kept[0].purged, undefined);
  assert.equal(kept[0].url, URL_A);
  const released = releasedMediaJson(OWNER, media, () => null) as Record<string, unknown>[];
  assert.equal(released[0].purged, true);
});

test("publishing keeps library files: a live library reference blocks deletion", () => {
  const libraryText = `/api/media/${KEY}`;
  assert.deepEqual(keysToDelete([KEY], [libraryText]), []);
  assert.deepEqual(keysToDelete([KEY], []), [KEY]);
});

test("purgedItem falls back to placeholders", () => {
  assert.equal(purgedItem({ type: "video", url: URL_A }, null).thumb, "/media/video-placeholder.svg");
  assert.equal(purgedItem({ type: "image", url: URL_A }, "p.jpg").thumb, "p.jpg");
});

test("alt text: cleaned, capped, and carried to networks", () => {
  assert.equal(cleanAlt("  a\n  dog  "), "a dog");
  assert.equal(cleanAlt("x".repeat(1200)).length, 1000);
  assert.equal(cleanAlt(42), "");
  assert.deepEqual(mediaItems([{ type: "image", url: URL_A, alt: " A dog " }]), [{ type: "image", url: URL_A, alt: "A dog" }]);
  assert.deepEqual(mediaItems([{ type: "image", url: URL_A }]), [{ type: "image", url: URL_A }]);
});

test("library quotas per plan", () => {
  assert.equal(PLAN_MEDIA_LIMITS.Free.libraryBytes, 500 * MB);
  assert.equal(PLAN_MEDIA_LIMITS.Pro.libraryBytes, 10 * GB);
  assert.equal(PLAN_MEDIA_LIMITS.Agency.libraryBytes, 50 * GB);
  assert.match(libraryQuotaMessage(499 * MB, "Free"), /499 MB of 500 MB/);
});

test("isGif", () => {
  assert.equal(isGif({ name: "x.gif", mime: "image/png" }), true);
  assert.equal(isGif({ name: "x.png", mime: "image/png" }), false);
});
