import { test } from "node:test";
import assert from "node:assert/strict";
import { automationSummary, pctChange } from "./homeStats";

test("automationSummary: trigger, first keyword + count, short DM", () => {
  assert.equal(
    automationSummary({ keywords: ["LINK", "GUIDE", "REPO"], triggers: ["comment"], dmText: "Hey, thanks for watching! Here are the links from every reel" }),
    "Comments · contains 'LINK' +2 more · DM: 'Hey, thanks for watching! Here are the links fro…'",
  );
  assert.equal(automationSummary({ keywords: [], triggers: [], dmText: "Hi" }), "Comments · any comment · DM: 'Hi'");
  assert.equal(automationSummary({ keywords: ["BOOK"], triggers: ["story_reply"], dmText: "Hi" }), "Story replies · contains 'BOOK' · DM: 'Hi'");
});

test("pctChange: growth, drop, flat and no baseline", () => {
  assert.equal(pctChange(15, 10), 50);
  assert.equal(pctChange(5, 10), -50);
  assert.equal(pctChange(0, 0), 0);
  assert.equal(pctChange(4, 0), null);
});
