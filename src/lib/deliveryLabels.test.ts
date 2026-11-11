import assert from "node:assert/strict";
import { test } from "node:test";
import { attemptsText, displayAttempts, recipientLabel } from "./deliveryLabels.ts";

test("a sent DM never shows 0 attempts; untried rows say so", () => {
  assert.equal(displayAttempts("sent", 0), 1);
  assert.equal(displayAttempts("sent", 3), 3);
  assert.equal(displayAttempts("pending", 0), null);
  assert.equal(attemptsText("sent", 0), "1 attempt");
  assert.equal(attemptsText("failed", 2), "2 attempts");
  assert.equal(attemptsText("pending", 0), "Not tried yet");
  assert.equal(attemptsText("skipped", 0), "Not sent");
});

test("recipient label prefers the username, then a short id", () => {
  assert.equal(recipientLabel("brew", "123"), "@brew");
  assert.equal(recipientLabel("@brew", null), "@brew");
  assert.equal(recipientLabel(null, "17841400000002009"), "User …2009");
  assert.equal(recipientLabel(null, null), "Unknown user");
});
