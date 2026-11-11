import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GB,
  MB,
  NETWORK_MEDIA_LIMITS,
  PLAN_MEDIA_LIMITS,
  checkMediaForTargets,
  formatBytes,
  maxBytesForTargets,
  mediaRuleFor,
  networkMediaCheck,
  pendingStorageLabel,
} from "./mediaLimits.ts";

test("plan table matches the owner's numbers", () => {
  assert.deepEqual(PLAN_MEDIA_LIMITS.Free, { imageBytes: 20 * MB, videoBytes: 250 * MB, pendingBytes: 2 * GB });
  assert.deepEqual(PLAN_MEDIA_LIMITS.Pro, { imageBytes: 30 * MB, videoBytes: 1 * GB, pendingBytes: 20 * GB });
  assert.deepEqual(PLAN_MEDIA_LIMITS.Agency, { imageBytes: 30 * MB, videoBytes: 2 * GB, pendingBytes: 100 * GB });
});

test("rule lookup: Instagram feed video is a Reel, Story format uses Story limits", () => {
  assert.equal(mediaRuleFor("instagram", "image"), "instagram_feed");
  assert.equal(mediaRuleFor("instagram", "video"), "instagram_reels");
  assert.equal(mediaRuleFor("instagram", "video", "story"), "instagram_story");
  assert.equal(mediaRuleFor("tiktok", "video"), "tiktok");
  assert.equal(mediaRuleFor("myspace", "video"), null);
  assert.equal(NETWORK_MEDIA_LIMITS.instagram_reels.videoBytes, 300 * MB);
  assert.equal(NETWORK_MEDIA_LIMITS.instagram_story.videoMaxSec, 60);
  assert.equal(NETWORK_MEDIA_LIMITS.x.videoMaxSec, 140);
  assert.equal(NETWORK_MEDIA_LIMITS.bluesky.imageBytes, 1_000_000);
});

test("friendly message for a Reel over Instagram's size", () => {
  const r = networkMediaCheck({ kind: "video", type: "video/mp4", size: 412 * MB }, "instagram_reels");
  assert.deepEqual(r.errors, ["This Reel is 412 MB. Instagram allows up to 300 MB. Compress it or trim it."]);
});

test("duration limits: too long, too short, unknown length skipped", () => {
  const long = networkMediaCheck({ kind: "video", type: "video/mp4", size: 10 * MB, durationSec: 75 }, "instagram_story");
  assert.match(long.errors[0], /This Story is 1 min 15 s long\. Instagram allows up to 1 min\. Trim it\./);
  const short = networkMediaCheck({ kind: "video", type: "video/mp4", size: 10 * MB, durationSec: 2 }, "tiktok");
  assert.match(short.errors[0], /needs at least 3 s/);
  assert.deepEqual(networkMediaCheck({ kind: "video", type: "video/mp4", size: 10 * MB }, "x").errors, []);
});

test("types: Instagram takes JPEG only, YouTube takes no images", () => {
  assert.match(networkMediaCheck({ kind: "image", type: "image/png", size: MB }, "instagram_feed").errors[0], /only accepts JPG images/);
  assert.match(networkMediaCheck({ kind: "image", type: "image/jpeg", size: MB }, "youtube").errors[0], /YouTube takes videos only/);
});

test("Bluesky images over 1 MB are a note (Poskoo shrinks them), not an error", () => {
  const r = networkMediaCheck({ kind: "image", type: "image/jpeg", size: 3 * MB }, "bluesky");
  assert.deepEqual(r.errors, []);
  assert.equal(r.warnings.length, 1);
});

test("multi-network: the strictest selected network wins and every problem is listed once", () => {
  const facts = { kind: "video" as const, type: "video/mp4", size: 200 * MB, durationSec: 200, width: 1920, height: 1080 };
  const r = checkMediaForTargets(facts, { plan: "Free", platforms: ["instagram", "x", "youtube", "mastodon"] });
  assert.ok(r.errors.some((e) => /X allows up to 2 min 20 s/.test(e)));
  assert.ok(r.errors.some((e) => /Mastodon allows up to 99 MB/.test(e)));
  assert.ok(!r.errors.some((e) => /YouTube/.test(e)));
  assert.ok(r.warnings.some((w) => /9:16/.test(w)), "Reels aspect warning for a 16:9 video");
  const ok = checkMediaForTargets({ ...facts, size: 50 * MB, durationSec: 30, width: 1080, height: 1920 }, { plan: "Free", platforms: ["instagram", "x", "tiktok"] });
  assert.deepEqual(ok, { errors: [], warnings: [] });
});

test("plan cap applies before network caps", () => {
  const r = checkMediaForTargets({ kind: "video", type: "video/mp4", size: 600 * MB }, { plan: "Free", platforms: ["youtube"] });
  assert.match(r.errors[0], /The Free plan allows videos up to 250 MB/);
  assert.deepEqual(checkMediaForTargets({ kind: "video", type: "video/mp4", size: 600 * MB }, { plan: "Pro", platforms: ["youtube"] }).errors, []);
});

test("max size hint follows the selection", () => {
  assert.equal(maxBytesForTargets("video", { plan: "Agency", platforms: [] }), 2 * GB);
  assert.equal(maxBytesForTargets("video", { plan: "Agency", platforms: ["instagram"] }), 300 * MB);
  assert.equal(maxBytesForTargets("video", { plan: "Agency", platforms: ["instagram"], igFormat: "story" }), 100 * MB);
  assert.equal(maxBytesForTargets("image", { plan: "Free", platforms: ["bluesky"] }), 20 * MB);
  assert.equal(formatBytes(1.5 * GB), "1.5 GB");
});

test("storage label", () => {
  assert.equal(pendingStorageLabel(0.4 * GB, "Free"), "Media storage: 0.4 / 2 GB");
});

test("Google Business Profile: one JPG/PNG photo, 10 KB-5 MB, at least 250x250, no video", async () => {
  const { networkMediaCheck } = await import("./mediaLimits.ts");
  assert.equal(networkMediaCheck({ kind: "image", type: "image/jpeg", size: 200_000, width: 800, height: 600 }, "gbp").errors.length, 0);
  assert.match(networkMediaCheck({ kind: "image", type: "image/jpeg", size: 5_000, width: 800, height: 600 }, "gbp").errors.join(" "), /at least 10 KB/);
  assert.match(networkMediaCheck({ kind: "image", type: "image/png", size: 200_000, width: 200, height: 600 }, "gbp").errors.join(" "), /250×250/);
  assert.match(networkMediaCheck({ kind: "image", type: "image/jpeg", size: 6_000_000 }, "gbp").errors.join(" "), /up to 5 MB/);
  assert.match(networkMediaCheck({ kind: "video", type: "video/mp4", size: 1_000_000 }, "gbp").errors.join(" "), /images only/);
});
