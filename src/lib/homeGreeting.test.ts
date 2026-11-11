import { test } from "node:test";
import assert from "node:assert/strict";
import { greetingFor, homeStatusParts } from "./homeGreeting";

test("greetingFor picks the part of the day", () => {
  assert.equal(greetingFor(5), "Good morning");
  assert.equal(greetingFor(11), "Good morning");
  assert.equal(greetingFor(12), "Good afternoon");
  assert.equal(greetingFor(17), "Good afternoon");
  assert.equal(greetingFor(18), "Good evening");
  assert.equal(greetingFor(0), "Good evening");
  assert.equal(greetingFor(4), "Good evening");
});

test("homeStatusParts uses real counts with singular/plural", () => {
  assert.deepEqual(homeStatusParts({ scheduledThisWeek: 3, liveAutomations: 2, commentsWaiting: 9 }), [
    "3 posts scheduled in the next 7 days",
    "2 Auto-DMs live",
    "9 comments waiting",
  ]);
  assert.deepEqual(homeStatusParts({ scheduledThisWeek: 1, liveAutomations: 1, commentsWaiting: 1 }), [
    "1 post scheduled in the next 7 days",
    "1 Auto-DM live",
    "1 comment waiting",
  ]);
  assert.deepEqual(homeStatusParts({ scheduledThisWeek: 0, liveAutomations: 0, commentsWaiting: 0 }), [
    "No posts scheduled in the next 7 days",
    "No Auto-DMs live",
    "Inbox clear",
  ]);
  assert.equal(homeStatusParts({ scheduledThisWeek: 1200, liveAutomations: 0, commentsWaiting: 0 })[0], "1,200 posts scheduled in the next 7 days");
});
