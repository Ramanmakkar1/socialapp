import assert from "node:assert/strict";
import { test } from "node:test";
import {
  accountWeek,
  captionSnippet,
  classifyGraphError,
  draftIdeaText,
  isStale,
  kindOf,
  median,
  normalizeIgUsername,
  parseBusinessDiscovery,
  parseUsernameList,
  rankTrends,
  trendWatchLimit,
  type TrendMediaInput,
} from "./trends.ts";

const NOW = Date.parse("2026-11-12T12:00:00Z");
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000).toISOString();

function m(over: Partial<TrendMediaInput> & { id: string }): TrendMediaInput {
  return {
    username: "alpha",
    followers: 10_000,
    mediaType: "VIDEO",
    productType: "REELS",
    caption: null,
    permalink: `https://www.instagram.com/reel/${over.id}/`,
    thumbnailUrl: `https://cdn.example/${over.id}.jpg`,
    mediaUrl: null,
    postedAt: daysAgo(1),
    likes: 100,
    comments: 10,
    ...over,
  };
}

test("normalizeIgUsername accepts @, URLs and rejects junk", () => {
  assert.equal(normalizeIgUsername("@Creators"), "creators");
  assert.equal(normalizeIgUsername("https://www.instagram.com/some.user_1/?hl=en"), "some.user_1");
  assert.equal(normalizeIgUsername("instagram.com/abc/"), "abc");
  assert.equal(normalizeIgUsername("bad name"), null);
  assert.equal(normalizeIgUsername(".dot"), null);
  assert.equal(normalizeIgUsername("a..b"), null);
  assert.equal(normalizeIgUsername("x".repeat(31)), null);
  assert.equal(normalizeIgUsername("https://instagram.com/reel/abc"), null);
  assert.equal(normalizeIgUsername(42), null);
});

test("parseUsernameList dedupes and reports invalid entries", () => {
  assert.deepEqual(parseUsernameList("@a, @b\n@A  bad!name"), { valid: ["a", "b"], invalid: ["bad!name"] });
});

test("watch limits per plan", () => {
  assert.equal(trendWatchLimit("Free"), 10);
  assert.equal(trendWatchLimit("Pro"), 50);
  assert.equal(trendWatchLimit("Agency"), 50);
});

test("isStale after 6 hours or when never attempted", () => {
  assert.equal(isStale(null, NOW), true);
  assert.equal(isStale(new Date(NOW - 5 * 3600_000), NOW), false);
  assert.equal(isStale(new Date(NOW - 6 * 3600_000), NOW), true);
});

test("classifyGraphError maps Meta codes", () => {
  for (const code of [4, 17, 32, 613]) assert.equal(classifyGraphError(400, code).kind, "rate_limited");
  assert.equal(classifyGraphError(400, 190).kind, "token");
  assert.equal(classifyGraphError(400, 10).kind, "permission");
  assert.equal(classifyGraphError(400, 110, 2207013).kind, "not_found");
  assert.equal(classifyGraphError(500, 1).kind, "error");
});

test("parseBusinessDiscovery normalizes a Graph response", () => {
  const parsed = parseBusinessDiscovery({
    business_discovery: {
      username: "Creators",
      name: "Creators",
      followers_count: 1234,
      media_count: "56",
      profile_picture_url: "https://cdn.example/p.jpg",
      media: {
        data: [
          { id: "1", media_type: "VIDEO", media_product_type: "REELS", comments_count: 5, timestamp: "2026-11-10T10:00:00+0000", permalink: "https://www.instagram.com/reel/1/" },
          { id: "2", timestamp: "not a date" },
          { id: "3", media_type: "IMAGE", like_count: 7, comments_count: 1, timestamp: "2026-11-09T10:00:00+0000", permalink: "javascript:alert(1)" },
        ],
      },
    },
    id: "17841400000000000",
  });
  assert.ok(parsed);
  assert.equal(parsed.username, "creators");
  assert.equal(parsed.followers, 1234);
  assert.equal(parsed.mediaCount, 56);
  assert.equal(parsed.media.length, 2);
  assert.equal(parsed.media[0].likes, null, "hidden likes stay null");
  assert.equal(parsed.media[1].permalink, null, "non-https permalink dropped");
  assert.equal(parseBusinessDiscovery({ error: {} }), null);
});

test("kindOf: reels, carousels, posts", () => {
  assert.equal(kindOf({ mediaType: "VIDEO", productType: "REELS" }), "reel");
  assert.equal(kindOf({ mediaType: "CAROUSEL_ALBUM", productType: "FEED" }), "carousel");
  assert.equal(kindOf({ mediaType: "IMAGE", productType: "FEED" }), "post");
});

test("median", () => {
  assert.equal(median([]), null);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
});

const fixture: TrendMediaInput[] = [
  // alpha (10k followers): typical ~110 engagement, one breakout reel this week.
  m({ id: "a1", likes: 100, comments: 10, postedAt: daysAgo(20) }),
  m({ id: "a2", likes: 90, comments: 10, postedAt: daysAgo(15) }),
  m({ id: "a3", likes: 110, comments: 10, postedAt: daysAgo(10) }),
  m({ id: "a4", likes: 120, comments: 10, postedAt: daysAgo(3) }),
  m({ id: "a5", likes: 900, comments: 100, postedAt: daysAgo(1) }),
  m({ id: "a6", mediaType: "CAROUSEL_ALBUM", productType: "FEED", likes: 300, comments: 20, postedAt: daysAgo(2) }),
  // beta (1k followers): small account, high rate.
  m({ id: "b1", username: "beta", followers: 1000, likes: 400, comments: 50, postedAt: daysAgo(0.5) }),
  m({ id: "b2", username: "beta", followers: 1000, mediaType: "IMAGE", productType: "FEED", likes: 20, comments: 1, postedAt: daysAgo(4) }),
  // Too old for this week.
  m({ id: "old", username: "beta", followers: 1000, likes: 5000, comments: 0, postedAt: daysAgo(8) }),
];

test("rankTrends ranks this week's reels by engagement", () => {
  const reels = rankTrends(fixture, { now: NOW, filter: "reels" });
  assert.deepEqual(reels.map((r) => r.id), ["a5", "b1", "a4"]);
  assert.equal(reels[0].engagement, 1000);
  assert.equal(reels[0].rate, 10);
  assert.equal(reels[1].rate, 45);
});

test("Rising = at least 2x the account's median (with enough posts)", () => {
  const all = rankTrends(fixture, { now: NOW });
  const byId = new Map(all.map((r) => [r.id, r]));
  // alpha engagement sorted [100,110,120,130,320,1000] -> median (120+130)/2 = 125; 1000/125 = 8x.
  assert.equal(byId.get("a5")?.rising, true);
  assert.equal(byId.get("a5")?.vsMedian, 8);
  assert.equal(byId.get("a6")?.rising, true);
  assert.equal(byId.get("a4")?.rising, false);
  // beta has only 3 cached posts (< 4): no median, never Rising.
  assert.equal(byId.get("b1")?.rising, false);
  assert.equal(byId.get("b1")?.vsMedian, null);
  assert.equal(byId.has("old"), false);
});

test("filters and sorts", () => {
  assert.deepEqual(rankTrends(fixture, { now: NOW, filter: "carousels" }).map((r) => r.id), ["a6"]);
  assert.deepEqual(rankTrends(fixture, { now: NOW, filter: "posts" }).map((r) => r.id), ["b2"]);
  assert.deepEqual(rankTrends(fixture, { now: NOW, sort: "newest" }).map((r) => r.id), ["b1", "a5", "a6", "a4", "b2"]);
  assert.equal(rankTrends(fixture, { now: NOW, sort: "rate" })[0].id, "b1");
});

test("accountWeek compares this week with last week", () => {
  const alpha = fixture.filter((f) => f.username === "alpha");
  const w = accountWeek(alpha, NOW);
  assert.equal(w.postsThisWeek, 3);
  assert.equal(w.avgEngagementThisWeek, Math.round((130 + 1000 + 320) / 3));
  assert.equal(w.avgEngagementLastWeek, 120);
  assert.equal(w.changePct, Math.round(((483 - 120) / 120) * 100));
  assert.equal(accountWeek([], NOW).changePct, null);
});

test("captionSnippet and draftIdeaText", () => {
  assert.equal(captionSnippet("\n  First line here\nsecond"), "First line here");
  assert.ok(captionSnippet("word ".repeat(60), 50).endsWith("…"));
  const text = draftIdeaText({ username: "alpha", kind: "reel", caption: "3 hooks that work", permalink: "https://www.instagram.com/reel/a5/", likes: null, comments: 3 });
  assert.match(text, /@alpha's reel \(likes hidden, 3 comments\)/);
  assert.match(text, /"3 hooks that work"/);
  assert.match(text, /Reference: https:\/\/www\.instagram\.com\/reel\/a5\//);
});
