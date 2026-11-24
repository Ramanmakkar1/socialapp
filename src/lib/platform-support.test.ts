import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPlatformCatalog, PLATFORM_CATALOG, platformCopy } from "@/lib/platform-support";

const allKeys = Object.fromEntries(PLATFORM_CATALOG.map((e) => [e.id, true]));
const base = { instagram: true, facebook: true, threads: true, youtube: true, linkedin: true, bluesky: true, mastodon: true };
// Networks that need no server keys: every non-social entry except the app networks (Twitch, Kick chat,
// WordPress.com), plus Bluesky / Mastodon and the keyless social token networks (Lemmy, Moltbook).
const tokenIds = PLATFORM_CATALOG.filter((e) => !["social"].includes(e.group) || ["bluesky", "mastodon", "lemmy", "moltbook"].includes(e.id)).map((e) => e.id);

test("no keys at all (a build without env) counts only the networks that need none", () => {
  const configured = Object.fromEntries(tokenIds.map((id) => [id, true]));
  for (const id of ["twitch", "wpcom", "kick"]) delete configured[id];
  const copy = platformCopy(buildPlatformCatalog(configured, {}), false);
  assert.deepEqual(copy.live.social, ["Bluesky", "Mastodon", "Lemmy", "Moltbook"]);
  // social 4 + chat 5 + blogs 11 (Medium joined the 10 blog/self-hosted networks on 2026-11-24)
  assert.equal(copy.liveCount, 4 + 5 + 11);
  assert.ok(!copy.answer.includes("reminders"), "no reminder copy while e-mail is off");
});

test("keys for the original networks give 25 live platforms (22 + Medium, Lemmy, Moltbook)", () => {
  const configured = { ...Object.fromEntries(tokenIds.map((id) => [id, true])), ...base, twitch: false, wpcom: false, kick: false };
  const copy = platformCopy(buildPlatformCatalog(configured, {}), true);
  assert.equal(copy.liveCount, 25);
  assert.equal(copy.liveCountText, "25 platforms");
  assert.ok(copy.answer.startsWith("Scheduling works today on 25 platforms: Instagram, Facebook Pages, Threads"));
  assert.ok(copy.answer.includes("for chat"));
  assert.ok(copy.answer.includes("reminders"));
});

test("approval channels need CHANNEL_STATUS_<ID>=ready on top of their keys", () => {
  const keysOnly = buildPlatformCatalog(allKeys, {});
  for (const id of ["tiktok", "pinterest", "gbp", "linkedin_pages"]) {
    const e = keysOnly.find((x) => x.id === id)!;
    assert.equal(e.live, false, `${id} must not be live on keys alone`);
    assert.equal(e.awaiting, true, `${id} must read as awaiting approval`);
  }
  const approved = buildPlatformCatalog(allKeys, {
    CHANNEL_STATUS_TIKTOK: "ready",
    CHANNEL_STATUS_PINTEREST: "ready",
    CHANNEL_STATUS_GBP: "ready",
    CHANNEL_STATUS_LINKEDIN_PAGES: "ready",
  });
  const soonApps = ["tumblr", "farcaster", "plurk", "twitch", "wpcom", "reddit", "dribbble", "vk", "kick", "whop"];
  const copy = platformCopy(approved.map((e) => (soonApps.includes(e.id) ? { ...e, live: false } : e)), true);
  assert.equal(copy.liveCount, 30, "the owner's target: 25 + TikTok, Pinterest, GBP, LinkedIn Pages and X");
});

test("an override never turns on a network without its keys, and pending overrides win", () => {
  const noKeys = buildPlatformCatalog({}, { CHANNEL_STATUS_X: "ready", CHANNEL_STATUS_TIKTOK: "ready" });
  assert.equal(noKeys.find((e) => e.id === "x")!.live, false);
  assert.equal(noKeys.find((e) => e.id === "tiktok")!.live, false);
  const pending = buildPlatformCatalog(allKeys, { CHANNEL_STATUS_X: "soon" });
  assert.equal(pending.find((e) => e.id === "x")!.live, false);
});

test("reminder-only channels are never counted", () => {
  assert.ok(!PLATFORM_CATALOG.some((e) => e.id === "ig_personal" || e.id === "fb_group"));
});
