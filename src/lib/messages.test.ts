import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractEmail,
  extractMessageEvents,
  extractPhone,
} from "./messageParse.ts";

test("extractMessageEvents on valid payload returns 1 event", () => {
  const body = {
    object: "instagram",
    entry: [
      {
        id: "17841400000000000",
        messaging: [
          {
            sender: { id: "123456789" },
            recipient: { id: "17841400000000000" },
            timestamp: 1234567890,
            message: { mid: "m_mid", text: "my email is a@b.com" },
          },
        ],
      },
    ],
  };
  const events = extractMessageEvents(body);
  assert.equal(events.length, 1);
  assert.equal(events[0].accountExternalId, "17841400000000000");
  assert.equal(events[0].senderId, "123456789");
  assert.equal(events[0].text, "my email is a@b.com");
  assert.equal(events[0].mid, "m_mid");
});

test("extractMessageEvents skips is_echo messages", () => {
  const body = {
    entry: [
      {
        id: "acc1",
        messaging: [
          {
            sender: { id: "user1" },
            message: { text: "echo", is_echo: true },
          },
        ],
      },
    ],
  };
  assert.deepEqual(extractMessageEvents(body), []);
});

test("extractMessageEvents skips payload without text", () => {
  const body = {
    entry: [
      {
        id: "acc1",
        messaging: [
          {
            sender: { id: "user1" },
            message: { mid: "m1" },
          },
        ],
      },
    ],
  };
  assert.deepEqual(extractMessageEvents(body), []);
});

test("extractMessageEvents malformed input returns []", () => {
  assert.deepEqual(extractMessageEvents(null), []);
  assert.deepEqual(extractMessageEvents({}), []);
  assert.deepEqual(extractMessageEvents({ entry: "x" }), []);
});

test("extractEmail finds and normalizes email", () => {
  assert.equal(
    extractEmail("my mail is John.Doe@Example.com."),
    "john.doe@example.com",
  );
  assert.equal(extractEmail("hi"), null);
});

test("extractPhone finds normalized phone", () => {
  assert.equal(extractPhone("call +1 (416) 555-0199"), "+14165550199");
  assert.equal(extractPhone("order 12"), null);
});
