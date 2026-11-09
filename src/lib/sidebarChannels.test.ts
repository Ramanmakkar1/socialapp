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
