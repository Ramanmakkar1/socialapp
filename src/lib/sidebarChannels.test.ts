import { test } from "node:test";
import assert from "node:assert/strict";
import { buildChannels } from "./sidebarChannels";

test("buildChannels: names, counts per platform and YouTube rows", () => {
  const list = buildChannels(
    [
      { platform: "instagram", username: "townmedialabs", page_name: "TML", status: "active" },
      { platform: "threads", username: null, page_name: null, status: "expired" },
    ],
    [{ title: "Poskoo TV", status: "active" }],
    [{ platform: "instagram", n: 3 }, { platform: "youtube", n: 1 }],
  );
  assert.deepEqual(list, [
    { platform: "instagram", name: "@townmedialabs", status: "active", scheduled: 3 },
    { platform: "threads", name: "threads", status: "expired", scheduled: 0 },
    { platform: "youtube", name: "Poskoo TV", status: "active", scheduled: 1 },
  ]);
});

test("buildChannels: empty input gives an empty list; @ is not doubled", () => {
  assert.deepEqual(buildChannels([], [], []), []);
  assert.equal(buildChannels([{ platform: "instagram", username: "@a", page_name: null, status: "active" }], [], [])[0].name, "@a");
});

test("channel slugs: readable, lowercase, collisions get an id suffix, old ids still link", async () => {
  const { assignChannelSlugs, channelHref, channelSlug, slugPart } = await import("./sidebarChannelsShared");
  assert.equal(slugPart("@Trail.And_Tide "), "trail-and-tide");
  assert.equal(channelSlug("instagram", "@trailandtide"), "instagram-trailandtide");
  assert.equal(channelSlug("fb_group", "Café Owners"), "fb-group-cafe-owners");
  assert.equal(channelSlug("threads", ""), "threads");
  const list = buildChannels(
    [
      { id: "11111111-1111-1111-1111-111111111111", platform: "instagram", username: "trailandtide", page_name: null, status: "active" },
      { id: "2f3a9999-1111-1111-1111-111111111111", platform: "instagram", username: "TrailAndTide", page_name: null, status: "active" },
      { id: "33333333-1111-1111-1111-111111111111", platform: "linkedin", username: "Trail & Tide Tours", page_name: null, status: "active" },
    ],
    [{ id: "44444444-1111-1111-1111-111111111111", title: "Poskoo TV", status: "active" }],
    [],
  );
  assert.deepEqual(list.map((c) => c.slug), ["instagram-trailandtide", "instagram-trailandtide-2f3a", "linkedin-trail-tide-tours", "youtube-poskoo-tv"]);
  assert.equal(channelHref(list[1]), "/app/channels/instagram-trailandtide-2f3a");
  assert.equal(channelHref({ id: "abc", platform: "x" }), "/app/channels/abc");
  assert.equal(channelHref({ platform: "x" }), "/app/publish?view=week&channel=x");
  // Many identical names never loop forever.
  const many = assignChannelSlugs(Array.from({ length: 30 }, (_, i) => ({ platform: "x", name: "same", id: `00000000-0000-0000-0000-0000000000${String(i).padStart(2, "0")}` })));
  assert.equal(new Set(many.map((c) => c.slug)).size, 30);
});
