import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterPosts, groupBySlot, initialScrollHour, isSlotPast, movedToSlot, parseChannels, parseStatus,
  postKind, slotOf, slotStart, sundayOnOrBefore, toggleChannel, zonedInstant,
} from "./weekGrid.ts";

// Regina has no DST (UTC-6 all year), so these expectations do not move with tzdata updates.
const EDM = "America/Regina";

test("weeks start on Sunday", () => {
  assert.equal(sundayOnOrBefore("2026-11-15"), "2026-11-15"); // a Sunday
  assert.equal(sundayOnOrBefore("2026-11-18"), "2026-11-15");
  assert.equal(sundayOnOrBefore("2026-11-21"), "2026-11-15"); // Saturday
  assert.equal(sundayOnOrBefore("2027-01-01"), "2026-12-27"); // across the year
});

test("zonedInstant turns a local wall time into the right instant", () => {
  assert.equal(zonedInstant("2026-11-17", 19, 30, EDM), "2026-11-18T01:30:00.000Z");
  assert.equal(zonedInstant("2026-07-01", 9, 0, "Europe/Berlin"), "2026-07-01T07:00:00.000Z"); // CEST
  assert.equal(zonedInstant("2026-12-01", 9, 0, "Europe/Berlin"), "2026-12-01T08:00:00.000Z"); // CET
  assert.equal(zonedInstant("2026-11-17", 19, 30, ""), "2026-11-17T19:30:00.000Z");
  assert.equal(zonedInstant("2026-11-17", 9, 0, "Asia/Kolkata"), "2026-11-17T03:30:00.000Z");
  // 2:30 AM does not exist on 2026-03-29 in Berlin (clocks jump 2 -> 3): lands after the gap.
  const gap = zonedInstant("2026-03-29", 2, 30, "Europe/Berlin");
  assert.equal(slotOf(gap, "Europe/Berlin").hour, 3);
});

test("slotOf / groupBySlot put posts in their local day and hour", () => {
  assert.deepEqual(slotOf("2026-11-18T01:30:00Z", EDM), { key: "2026-11-17", hour: 19, minute: 30 });
  const posts = [
    { id: "b", scheduled_at: "2026-11-18T01:45:00Z" },
    { id: "a", scheduled_at: "2026-11-18T01:30:00Z" },
    { id: "c", scheduled_at: "2026-11-18T03:00:00Z" },
    { id: "d", scheduled_at: null },
  ];
  const slots = groupBySlot(posts, EDM);
  assert.deepEqual(slots.get("2026-11-17|19")?.map((p) => p.id), ["a", "b"]); // stacked in time order
  assert.deepEqual(slots.get("2026-11-17|21")?.map((p) => p.id), ["c"]);
  assert.equal([...slots.values()].flat().length, 3);
});

test("dropping a post on a slot keeps its minutes and changes day + hour", () => {
  const moved = movedToSlot("2026-11-18T01:30:00Z", "2026-11-20", 8, EDM);
  assert.deepEqual(slotOf(moved, EDM), { key: "2026-11-20", hour: 8, minute: 30 });
  assert.equal(moved, "2026-11-20T14:30:00.000Z");
});

test("past slots and new-post start times", () => {
  const now = new Date("2026-11-17T16:20:00Z"); // 10:20 AM Regina
  assert.equal(isSlotPast("2026-11-17", 9, EDM, now), true);
  assert.equal(isSlotPast("2026-11-17", 10, EDM, now), false); // under way
  assert.equal(isSlotPast("2026-11-17", 23, EDM, now), false);
  assert.equal(isSlotPast("2026-11-16", 23, EDM, now), true);
  assert.equal(slotStart("2026-11-17", 14, EDM, now), "2026-11-17T20:00:00.000Z");
  // The current hour: next quarter hour from now.
  assert.equal(slotStart("2026-11-17", 10, EDM, now), "2026-11-17T16:30:00.000Z");
});

test("grid opens at the current hour this week, else the first post, else 8 AM", () => {
  const days = ["2026-11-15", "2026-11-16"];
  assert.equal(initialScrollHour(days, 6, { key: "2026-11-16", hour: 14 }), 13);
  assert.equal(initialScrollHour(days, 6, { key: "2026-11-20", hour: 14 }), 5);
  assert.equal(initialScrollHour(days, null, { key: "2026-11-20", hour: 14 }), 8);
  assert.equal(initialScrollHour(days, 0, { key: "2026-11-20", hour: 0 }), 0);
});

test("channel / status / tag filters", () => {
  assert.deepEqual(parseChannels("instagram, facebook,instagram,,bad id,<x>"), ["instagram", "facebook"]);
  assert.deepEqual(parseChannels(undefined), []);
  assert.deepEqual(toggleChannel(["instagram"], "x"), ["instagram", "x"]);
  assert.deepEqual(toggleChannel(["instagram", "x"], "instagram"), ["x"]);
  assert.equal(parseStatus("draft"), "draft");
  assert.equal(parseStatus("publishing"), "");
  const posts = [
    { id: 1, status: "scheduled", platforms: ["instagram"], tags: ["Launch"] },
    { id: 2, status: "draft", platforms: ["facebook", "x"], tags: [] },
    { id: 3, status: "published", platforms: ["linkedin"] },
  ];
  const ids = (f: Parameters<typeof filterPosts>[1]) => filterPosts(posts, f).map((p) => p.id);
  assert.deepEqual(ids({ channels: [], status: "", tag: "" }), [1, 2, 3]);
  assert.deepEqual(ids({ channels: ["x", "linkedin"], status: "", tag: "" }), [2, 3]);
  assert.deepEqual(ids({ channels: ["x", "linkedin"], status: "draft", tag: "" }), [2]);
  assert.deepEqual(ids({ channels: [], status: "", tag: "launch" }), [1]);
});

test("post type badge", () => {
  const base = { igFormat: "feed", mediaCount: 0, isVideo: false, platforms: ["instagram"] };
  assert.equal(postKind(base), "text");
  assert.equal(postKind({ ...base, mediaCount: 1 }), "image");
  assert.equal(postKind({ ...base, mediaCount: 1, isVideo: true }), "reel");
  assert.equal(postKind({ ...base, mediaCount: 1, isVideo: true, platforms: ["youtube"] }), "video");
  assert.equal(postKind({ ...base, mediaCount: 3 }), "carousel");
  assert.equal(postKind({ ...base, mediaCount: 1, igFormat: "story" }), "story");
});
