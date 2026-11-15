import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AI_OFF_MESSAGE,
  campaignPostInputs,
  createCampaignForUser,
  parseCampaignBrief,
  planCampaignSlots,
  type CampaignBrief,
} from "./campaign.ts";
import { parseCampaignDrafts, replyText } from "./ai.ts";
import { fitCaption } from "./captionFit.ts";
import { checkCaption } from "./platforms.ts";

const NOW = Date.parse("2026-11-15T10:00:00Z");
const DAY = 86_400_000;

test("parseCampaignBrief: needs a goal and known channels, defaults to tomorrow for 7 days and 5 posts", () => {
  assert.equal(parseCampaignBrief({ goal: "", platforms: ["instagram"] }, NOW).ok, false);
  assert.equal(parseCampaignBrief({ goal: "Sell tickets", platforms: [] }, NOW).ok, false);
  const bad = parseCampaignBrief({ goal: "Sell tickets", platforms: ["myspace"] }, NOW);
  assert.equal(bad.ok, false);
  const ok = parseCampaignBrief({ goal: "Sell tickets", platforms: ["instagram", "x", "instagram"] }, NOW);
  assert.ok(ok.ok);
  assert.deepEqual(ok.brief.platforms, ["instagram", "x"]);
  assert.equal(ok.brief.startMs, Date.parse("2026-11-16T00:00:00Z"));
  assert.equal(ok.brief.endMs - ok.brief.startMs, 7 * DAY);
  assert.equal(ok.brief.postCount, 5);
});

test("parseCampaignBrief: end date is inclusive and validated; limits on posts and days", () => {
  const r = parseCampaignBrief({ goal: "Launch", platforms: ["x"], startDate: "2026-12-01", endDate: "2026-12-03" }, NOW);
  assert.ok(r.ok);
  assert.equal(r.brief.endMs - r.brief.startMs, 3 * DAY);
  assert.equal(parseCampaignBrief({ goal: "Launch", platforms: ["x"], startDate: "2026-12-05", endDate: "2026-12-01" }, NOW).ok, false);
  assert.equal(parseCampaignBrief({ goal: "Launch", platforms: ["x"], startDate: "2026-11-01" }, NOW).ok, false);
  assert.equal(parseCampaignBrief({ goal: "Launch", platforms: ["x"], postCount: 15 }, NOW).ok, false);
  assert.equal(parseCampaignBrief({ goal: "Launch", platforms: ["x"], days: 61 }, NOW).ok, false);
  const media = parseCampaignBrief({ goal: "Launch", platforms: ["x"], mediaUrls: ["http://no.jpg", "https://ok.example/a.jpg"] }, NOW);
  assert.ok(media.ok);
  assert.deepEqual(media.brief.mediaUrls, ["https://ok.example/a.jpg"]);
});

test("planCampaignSlots: no schedule spreads posts over the days at the best hours, never in the past or on taken minutes", () => {
  const start = Date.parse("2026-11-16T00:00:00Z");
  const slots = planCampaignSlots({ count: 4, startMs: start, endMs: start + 4 * DAY, nowMs: NOW, schedules: [], bestHoursUtc: [18], taken: [start + 18 * 3600_000] });
  assert.equal(slots.length, 4);
  assert.equal(new Set(slots).size, 4);
  assert.ok(slots.every((s) => s >= start && s > NOW));
  assert.ok(!slots.includes(start + 18 * 3600_000), "skips a taken minute");
  assert.deepEqual(slots, [...slots].sort((a, b) => a - b));
  // Default hours when there is no comment history.
  const fallback = planCampaignSlots({ count: 1, startMs: start, endMs: start + DAY, nowMs: NOW, schedules: [], bestHoursUtc: [] });
  assert.equal(new Date(fallback[0]).getUTCHours(), 14);
});

test("planCampaignSlots: uses posting schedule slots when there are enough, spread over the window", () => {
  const start = Date.parse("2026-11-16T00:00:00Z");
  const schedules = [{ platform: "instagram" as const, timezone: "UTC", days: [1, 2, 3, 4, 5, 6, 7], times: ["09:00"] }];
  const slots = planCampaignSlots({ count: 3, startMs: start, endMs: start + 7 * DAY, nowMs: NOW, schedules, bestHoursUtc: [18] });
  assert.equal(slots.length, 3);
  assert.ok(slots.every((s) => new Date(s).getUTCHours() === 9));
  assert.equal(slots[0], start + 9 * 3600_000);
  assert.equal(slots[2], start + 6 * DAY + 9 * 3600_000);
});

const brief: CampaignBrief = {
  goal: "Fill the workshop",
  offer: "",
  tone: "",
  name: "",
  startMs: Date.parse("2026-11-16T00:00:00Z"),
  endMs: Date.parse("2026-11-23T00:00:00Z"),
  postCount: 2,
  platforms: ["instagram", "x", "youtube"],
  mediaUrls: ["https://ex.com/a.jpg"],
};

test("campaignPostInputs: drafts only, variants used, long captions trimmed per network, YouTube title set", () => {
  const long = "Join our pottery workshop this Saturday. ".repeat(12).trim();
  const inputs = campaignPostInputs(
    [
      { angle: "teaser", caption: long, variants: { x: "Pottery Saturday. Book now!" } },
      { angle: "offer", caption: "Short and sweet #pottery", variants: {} },
    ],
    brief,
    [brief.startMs + 14 * 3600_000, brief.startMs + DAY + 14 * 3600_000],
    "Workshop push",
  );
  assert.equal(inputs.length, 2);
  for (const input of inputs) {
    assert.equal(input.mode, "draft");
    assert.deepEqual(input.tags, ["Workshop push"]);
    assert.deepEqual(input.mediaUrls, ["https://ex.com/a.jpg"]);
    assert.ok(input.ytTitle && input.ytTitle.length <= 100);
    for (const p of brief.platforms) {
      const text = input.overrides[p] ?? input.caption;
      assert.deepEqual(checkCaption(p, text).errors, [], `${p} caption fits`);
    }
  }
  assert.equal(inputs[0].overrides.x, "Pottery Saturday. Book now!");
  assert.equal(inputs[1].overrides.x, undefined, "a caption that fits needs no override");
  assert.equal(inputs[0].scheduledAt, new Date(brief.startMs + 14 * 3600_000).toISOString());
});

test("fitCaption: trims to the limit with an ellipsis and drops hashtags over the limit", () => {
  const x = fitCaption("x", "word ".repeat(100));
  assert.deepEqual(checkCaption("x", x).errors, []);
  assert.ok(x.endsWith("…"));
  const threads = fitCaption("threads", "Hello #one #two #three");
  assert.equal(threads, "Hello #one");
  assert.equal(fitCaption("instagram", "fine as is"), "fine as is");
});

test("parseCampaignDrafts: tolerates prose around the JSON, keeps only requested networks and count", () => {
  const reply = `Here you go:\n${JSON.stringify({
    name: "Workshop week",
    posts: [
      { angle: "teaser", caption: "Something is coming", variants: { x: "Soon.", myspace: "nope" }, youtubeTitle: "Teaser" },
      { angle: "bad", caption: "" },
      { angle: "offer", caption: "Book now" },
      { angle: "extra", caption: "Over the count" },
    ],
  })}\nEnjoy!`;
  const out = parseCampaignDrafts(reply, ["instagram", "x"], 2);
  assert.equal(out.name, "Workshop week");
  assert.equal(out.posts.length, 2);
  assert.deepEqual(out.posts[0].variants, { x: "Soon." });
  assert.equal(out.posts[0].ytTitle, "Teaser");
  assert.equal(out.posts[1].caption, "Book now");
  assert.deepEqual(parseCampaignDrafts("no json", ["x"], 3).posts, []);
});

test("replyText: skips thinking blocks and treats a refusal as no answer", () => {
  assert.equal(replyText({ content: [{ type: "thinking", thinking: "" }, { type: "text", text: "hi" }] }), "hi");
  assert.equal(replyText({ stop_reason: "refusal", content: [{ type: "text", text: "no" }] }), null);
  assert.equal(replyText(null), null);
});

test("createCampaignForUser: with AI off it says so and writes nothing", async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const result = await createCampaignForUser("11111111-1111-4111-8111-111111111111", { goal: "Sell tickets", platforms: ["instagram"] });
    assert.deepEqual(result, { ok: false, error: AI_OFF_MESSAGE, aiOff: true });
  } finally {
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});
