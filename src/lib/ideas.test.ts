import assert from "node:assert/strict";
import { test } from "node:test";
import {
  IDEAS_LIST_SQL,
  cleanMediaUrls,
  ideaComposerPrefill,
  ideaUpdateStatement,
  normalizeIdeaStatus,
  normalizeTags,
  shouldReplaceTags,
} from "./ideas.ts";

test("idea update is scoped to the owner so $2 is used and typed", () => {
  const statement = ideaUpdateStatement({
    ideaId: "11111111-1111-1111-1111-111111111111",
    userId: "22222222-2222-2222-2222-222222222222",
    text: "Launch teaser",
    mediaUrls: ["https://cdn.example.com/a.jpg"],
    status: "todo",
  });
  assert.match(statement.text, /where id = \$1 and user_id = \$2/);
  assert.equal(statement.params.length, 5);
  assert.equal(statement.params[0], "11111111-1111-1111-1111-111111111111");
  assert.equal(statement.params[1], "22222222-2222-2222-2222-222222222222");
  assert.equal(statement.params[2], "Launch teaser");
  assert.deepEqual(JSON.parse(String(statement.params[3])), [{ url: "https://cdn.example.com/a.jpg" }]);
  assert.equal(statement.params[4], "todo");
});

test("an empty tag box never replaces saved tags", () => {
  assert.equal(shouldReplaceTags([]), false);
  assert.equal(shouldReplaceTags(undefined), false);
  assert.equal(shouldReplaceTags(null), false);
  assert.equal(shouldReplaceTags(["launch"]), true);
});

test("tags are trimmed, de-duplicated case-insensitively and capped", () => {
  assert.deepEqual(normalizeTags(" launch, Launch ,  behind   the scenes "), ["launch", "behind the scenes"]);
  assert.deepEqual(normalizeTags(["a", "b", "a"]), ["a", "b"]);
  assert.deepEqual(normalizeTags(""), []);
});

test("untagged ideas aggregate to an empty array, not {NULL}", () => {
  assert.match(IDEAS_LIST_SQL, /filter \(where t\.name is not null\)/);
  assert.doesNotMatch(IDEAS_LIST_SQL, /array_agg\(t\.name\)/);
});

test("idea prefill keeps the idea id separate from the draft id", () => {
  const prefill = ideaComposerPrefill({
    id: "idea-1",
    text: "Post about the launch",
    media: [{ url: "https://cdn.example.com/a.jpg" }, { url: "https://cdn.example.com/b.mp4" }],
  });
  assert.equal(prefill.id, "idea-1");
  assert.equal(prefill.caption, "Post about the launch");
  assert.deepEqual(prefill.mediaUrls, ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.mp4"]);
});

test("media links must be public https links", () => {
  assert.deepEqual(
    cleanMediaUrls(["https://cdn.example.com/a.jpg", "http://insecure.example.com/b.jpg", "not a url", "https://cdn.example.com/a.jpg"]),
    ["https://cdn.example.com/a.jpg"],
  );
});

test("unknown idea statuses fall back to unassigned", () => {
  assert.equal(normalizeIdeaStatus("done"), "done");
  assert.equal(normalizeIdeaStatus("in_progress"), "in_progress");
  assert.equal(normalizeIdeaStatus("nonsense"), "unassigned");
  assert.equal(normalizeIdeaStatus(undefined), "unassigned");
});
