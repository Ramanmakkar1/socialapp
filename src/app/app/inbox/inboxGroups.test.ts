import assert from "node:assert/strict";
import { test } from "node:test";
import { filterComments, groupCommentsByPost, sortInboxComments, type InboxComment } from "@/lib/inbox";

function comment(partial: Partial<InboxComment>): InboxComment {
  return {
    accountId: "acc-1",
    commentId: "c1",
    text: "hi",
    fromId: "u1",
    fromUsername: "ana",
    mediaId: "m1",
    receivedAt: new Date("2026-11-01T10:00:00Z"),
    dmStatus: null,
    hidden: false,
    done: false,
    liked: false,
    ...partial,
  };
}

test("filterComments: all hides hidden comments only", () => {
  const comments = [comment({ commentId: "a" }), comment({ commentId: "b", hidden: true }), comment({ commentId: "c", done: true })];
  assert.deepEqual(filterComments(comments, "all").map((c) => c.commentId), ["a", "c"]);
});

test("filterComments: unanswered keeps only open, visible comments", () => {
  const comments = [
    comment({ commentId: "a" }),
    comment({ commentId: "b", done: true }),
    comment({ commentId: "c", hidden: true }),
    comment({ commentId: "d", done: true, hidden: true }),
  ];
  assert.deepEqual(filterComments(comments, "unanswered").map((c) => c.commentId), ["a"]);
});

test("filterComments: hidden shows only hidden comments", () => {
  const comments = [comment({ commentId: "a" }), comment({ commentId: "b", hidden: true })];
  assert.deepEqual(filterComments(comments, "hidden").map((c) => c.commentId), ["b"]);
});

test("sortInboxComments: unanswered first, then newest first", () => {
  const done = comment({ commentId: "done", done: true, receivedAt: new Date("2026-11-09T10:00:00Z") });
  const oldOpen = comment({ commentId: "old", receivedAt: new Date("2026-11-01T10:00:00Z") });
  const newOpen = comment({ commentId: "new", receivedAt: new Date("2026-11-08T10:00:00Z") });
  const hidden = comment({ commentId: "hidden", hidden: true, receivedAt: new Date("2026-11-09T11:00:00Z") });
  const sorted = [done, oldOpen, newOpen, hidden].sort(sortInboxComments);
  // Open comments first (newest first), then closed ones (newest first).
  assert.deepEqual(sorted.map((c) => c.commentId), ["new", "old", "hidden", "done"]);
});

test("groupCommentsByPost: groups by post, unanswered posts first, then newest", () => {
  const accounts = [{ id: "acc-1", external_id: "ext-1", username: "poskoo" }];
  const comments = [
    // Post m2: one answered comment, newest overall.
    comment({ commentId: "m2-done", mediaId: "m2", done: true, receivedAt: new Date("2026-11-09T10:00:00Z") }),
    // Post m1: two open comments.
    comment({ commentId: "m1-old", mediaId: "m1", receivedAt: new Date("2026-11-01T10:00:00Z") }),
    comment({ commentId: "m1-new", mediaId: "m1", receivedAt: new Date("2026-11-05T10:00:00Z") }),
    // Post m3: one open comment, older than m1's newest.
    comment({ commentId: "m3", mediaId: "m3", receivedAt: new Date("2026-11-02T10:00:00Z") }),
  ];
  const groups = groupCommentsByPost(comments, accounts);
  assert.deepEqual(groups.map((g) => g.mediaId), ["m1", "m3", "m2"]);
  assert.equal(groups[0].unanswered, 2);
  assert.equal(groups[1].unanswered, 1);
  assert.equal(groups[2].unanswered, 0);
  // Inside a post: open first, then newest first.
  assert.deepEqual(groups[0].comments.map((c) => c.commentId), ["m1-new", "m1-old"]);
  assert.equal(groups[0].username, "poskoo");
  assert.equal(new Date(groups[0].latestAt).toISOString(), "2026-11-05T10:00:00.000Z");
});

test("groupCommentsByPost: comments without a media id share one group", () => {
  const accounts = [{ id: "acc-1", external_id: "ext-1", username: null }];
  const groups = groupCommentsByPost(
    [comment({ commentId: "a", mediaId: null }), comment({ commentId: "b", mediaId: null })],
    accounts
  );
  assert.equal(groups.length, 1);
  assert.equal(groups[0].mediaId, null);
  assert.equal(groups[0].comments.length, 2);
});
