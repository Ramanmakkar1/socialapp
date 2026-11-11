import assert from "node:assert/strict";
import { test } from "node:test";
import {
  IMAGE_PLACEHOLDER,
  VIDEO_PLACEHOLDER,
  keysToDelete,
  ownMediaKeys,
  pendingBytesFor,
  postMediaReleasable,
  releasedMediaJson,
  type TargetState,
} from "./mediaLifecycle.ts";

const U = "11111111-1111-1111-1111-111111111111";
const OTHER = "99999999-9999-9999-9999-999999999999";
const A = `${U}/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.mp4`;
const B = `${U}/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.jpg`;
const url = (key: string) => `https://poskoo.com/api/media/${key}?exp=1&sig=x`;
const NOW = Date.UTC(2026, 10, 11, 12);
const ago = (min: number) => new Date(NOW - min * 60_000).toISOString();

function t(platform: string, status: string, extra: Partial<TargetState> = {}): TargetState {
  return { platform, status, published_at: status === "published" ? ago(5) : null, ...extra };
}

test("all targets published: release", () => {
  assert.equal(postMediaReleasable("published", [t("instagram", "published"), t("threads", "published")], true, NOW), true);
});

test("partial / failed / pending targets keep the files (Retry works)", () => {
  assert.equal(postMediaReleasable("publishing", [t("instagram", "published"), t("tiktok", "publishing")], true, NOW), false);
  assert.equal(postMediaReleasable("failed", [t("instagram", "published"), t("facebook", "failed")], true, NOW), false);
  assert.equal(postMediaReleasable("scheduled", [t("instagram", "published"), t("facebook", "pending")], true, NOW), false);
  // Retry: the failed target is pending again, then publishes: now everything is published.
  assert.equal(postMediaReleasable("published", [t("instagram", "published"), t("facebook", "published")], false, NOW), true);
  assert.equal(postMediaReleasable("published", [], false, NOW), false);
});

test("holds: TikTok still processing, Facebook video download window", () => {
  const tiktokHeld = t("tiktok", "published", { media_hold_until: new Date(NOW + 3_600_000).toISOString() });
  assert.equal(postMediaReleasable("published", [tiktokHeld], true, NOW), false);
  assert.equal(postMediaReleasable("published", [tiktokHeld], true, NOW + 2 * 3_600_000), true);
  const fbVideo = t("facebook", "published", { published_at: ago(10) });
  assert.equal(postMediaReleasable("published", [fbVideo], true, NOW), false, "facebook video fetched in the background");
  assert.equal(postMediaReleasable("published", [fbVideo], false, NOW), true, "facebook photos are done");
  assert.equal(postMediaReleasable("published", [{ ...fbVideo, published_at: ago(61) }], true, NOW), true);
});

test("own keys only: other users' and outside links are never touched", () => {
  const media = [
    { type: "video", url: url(A) },
    { type: "image", url: url(`${OTHER}/cccccccc-cccc-cccc-cccc-cccccccccccc.jpg`) },
    { type: "image", url: "https://cdn.example.com/x.jpg" },
    { type: "image", url: url(B), purged: true },
  ];
  assert.deepEqual(ownMediaKeys(U, media), [A]);
});

test("reference counting: a file shared with an unpublished post stays", () => {
  const keep = [JSON.stringify([{ type: "video", url: url(A) }])];
  assert.deepEqual(keysToDelete([A, B], keep), [B]);
  assert.deepEqual(keysToDelete([A, B], []), [A, B]);
});

test("released JSON keeps type, adds poster / platform thumbnail / placeholder", () => {
  const media = [{ type: "video", url: url(A) }, { type: "image", url: url(B) }, { type: "image", url: "https://x.com/a.jpg" }];
  const withPoster = releasedMediaJson(U, media, (k) => (k === A ? "https://poskoo.com/api/media/A.thumb.jpg" : null)) as Record<string, unknown>[];
  assert.deepEqual(withPoster[0], { type: "video", url: url(A), thumb: "https://poskoo.com/api/media/A.thumb.jpg", purged: true });
  assert.deepEqual(withPoster[1], { type: "image", url: url(B), thumb: IMAGE_PLACEHOLDER, purged: true });
  assert.deepEqual(withPoster[2], media[2]);
  const yt = releasedMediaJson(U, [media[0]], () => null, "https://i.ytimg.com/vi/abc/hqdefault.jpg") as Record<string, unknown>[];
  assert.equal(yt[0].thumb, "https://i.ytimg.com/vi/abc/hqdefault.jpg");
  const none = releasedMediaJson(U, [media[0]], () => null) as Record<string, unknown>[];
  assert.equal(none[0].thumb, VIDEO_PLACEHOLDER);
});

test("quota counts unpublished-post files and fresh unattached uploads only", () => {
  const day = 86_400_000;
  const files = [
    { key: A, size: 100, mtimeMs: NOW - 30 * day }, // in a scheduled post: counts
    { key: A.replace(".mp4", ".thumb.jpg"), size: 5, mtimeMs: NOW - 30 * day }, // its poster: counts
    { key: B, size: 50, mtimeMs: NOW - 30 * day }, // only in a published post (held): not counted
    { key: `${U}/dddddddd-dddd-dddd-dddd-dddddddddddd.png`, size: 7, mtimeMs: NOW - day }, // fresh, unattached: counts
    { key: `${U}/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee.png`, size: 9, mtimeMs: NOW - 8 * day }, // old, unattached: not counted
  ];
  const posts = [
    { status: "scheduled", mediaText: JSON.stringify([{ url: url(A) }]) },
    { status: "published", mediaText: JSON.stringify([{ url: url(B) }]) },
  ];
  assert.equal(pendingBytesFor(files, posts, NOW), 112);
  assert.equal(pendingBytesFor(files, [{ status: "failed", mediaText: posts[1].mediaText }], NOW), 57);
});
