import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAccountChoices, initialPicks } from "./accountChoices.ts";

const row = (id: string, platform: string, over: Partial<{ username: string | null; page_name: string | null; auth_type: string | null; page_id: string | null }> = {}) => ({
  id, platform, username: null, page_name: null, auth_type: null, page_id: null, ...over,
});

test("only networks with two or more active accounts get a picker; Facebook Pages come from Facebook-login Instagram rows", () => {
  const choices = buildAccountChoices(
    [
      row("ig1", "instagram", { username: "brand", auth_type: "facebook_login", page_id: "p1", page_name: "Brand Page" }),
      row("ig2", "instagram", { username: "@client", auth_type: "facebook_login", page_id: "p2", page_name: "Client Page" }),
      row("th1", "threads", { username: "brand" }),
      row("li1", "linkedin", { username: "Jane Doe" }),
      row("li2", "linkedin", { username: "Acme Inc" }),
    ],
    [{ id: "yt1", title: "Main" }],
  );
  assert.deepEqual(choices.instagram, [{ id: "ig1", name: "@brand" }, { id: "ig2", name: "@client" }]);
  assert.deepEqual(choices.facebook, [{ id: "ig1", name: "Brand Page" }, { id: "ig2", name: "Client Page" }]);
  assert.deepEqual(choices.linkedin, [{ id: "li1", name: "Jane Doe" }, { id: "li2", name: "Acme Inc" }]);
  assert.equal(choices.threads, undefined);
  assert.equal(choices.youtube, undefined);
});

test("initialPicks keeps a saved pick that is still connected, else starts on the account used today (oldest)", () => {
  const choices = { instagram: [{ id: "a", name: "@a" }, { id: "b", name: "@b" }] };
  assert.deepEqual(initialPicks(choices, undefined), { instagram: ["a"] });
  assert.deepEqual(initialPicks(choices, { instagram: ["b"] }), { instagram: ["b"] });
  assert.deepEqual(initialPicks(choices, { instagram: ["gone"] }), { instagram: ["a"] });
});
