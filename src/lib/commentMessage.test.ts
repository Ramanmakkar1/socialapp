import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCommentDmMessage,
  COMMENT_USERNAME_FALLBACK,
} from "./commentMessage.ts";

const GATE_EMAIL =
  "\n\nReply to this message with your email address and I'll send you the link right away.";
const GATE_FOLLOW =
  "\n\nFollow us first, then reply 'done' to this message and I'll send you the link.";
const GATE_FOLLOW_EMAIL =
  "\n\nFollow us, then reply here with your email address and I'll send you the link.";

test("replaces repeated username tokens and uses fallback when missing", () => {
  const withName = buildCommentDmMessage({
    dmText: "Hi {{username}} — {{username}}!",
    fromUsername: "jane",
    linkUrl: null,
    emailGate: false,
    followGate: false,
  });
  assert.equal(withName, "Hi jane — jane!");

  const missing = buildCommentDmMessage({
    dmText: "Hey {{username}}!",
    fromUsername: null,
    linkUrl: null,
    emailGate: false,
    followGate: false,
  });
  assert.equal(missing, `Hey ${COMMENT_USERNAME_FALLBACK}!`);
});

test("dollar characters in replacements stay literal", () => {
  const msg = buildCommentDmMessage({
    dmText: "Price {{username}} at {{link}}",
    fromUsername: "$pecial",
    linkUrl: "https://x.com",
    emailGate: false,
    followGate: false,
    resolvedLink: "https://shop.example/$20/off",
  });
  assert.equal(
    msg,
    "Price $pecial at https://shop.example/$20/off",
  );
});

test("ungated link appears once via token or trailing append", () => {
  const tracked = "https://postflow.test/l/abc123";
  const withToken = buildCommentDmMessage({
    dmText: "Here {{link}} and again {{link}}",
    fromUsername: "u",
    linkUrl: "https://dest",
    emailGate: false,
    followGate: false,
    resolvedLink: tracked,
  });
  assert.equal(
    withToken,
    `Here ${tracked} and again ${tracked}`,
  );

  const appended = buildCommentDmMessage({
    dmText: "Thanks!",
    fromUsername: "u",
    linkUrl: "https://dest",
    emailGate: false,
    followGate: false,
    resolvedLink: tracked,
  });
  assert.equal(appended, `Thanks!\n${tracked}`);
});

test("all gate combinations withhold links and keep gate prompts", () => {
  const secret = "https://secret.example/page";
  const base = {
    dmText: "Hey {{username}} 👉 {{link}}",
    fromUsername: "alex",
    linkUrl: secret,
  };

  const emailOnly = buildCommentDmMessage({
    ...base,
    emailGate: true,
    followGate: false,
  });
  assert.ok(!emailOnly.includes(secret));
  assert.ok(emailOnly.endsWith(GATE_EMAIL));

  const followOnly = buildCommentDmMessage({
    ...base,
    emailGate: false,
    followGate: true,
  });
  assert.ok(!followOnly.includes(secret));
  assert.ok(followOnly.endsWith(GATE_FOLLOW));

  const both = buildCommentDmMessage({
    ...base,
    emailGate: true,
    followGate: true,
  });
  assert.ok(!both.includes(secret));
  assert.ok(both.endsWith(GATE_FOLLOW_EMAIL));
});

test("gated rules strip link tokens even without link_url", () => {
  const msg = buildCommentDmMessage({
    dmText: "Hi {{username}} {{link}}",
    fromUsername: "sam",
    linkUrl: null,
    emailGate: true,
    followGate: false,
  });
  assert.equal(msg, "Hi sam ");
  assert.ok(!msg.includes("{{link}}"));
});

test("queued-style message: resolved tokens plus email gate prompt", () => {
  const queued = buildCommentDmMessage({
    dmText:
      "Hey {{username}}! Thanks for commenting 🙌\n\nHere is your guide 👉 {{link}}",
    fromUsername: "creator_fan",
    linkUrl: "https://example.com/guide.pdf",
    emailGate: true,
    followGate: false,
  });
  assert.match(queued, /^Hey creator_fan!/);
  assert.ok(!queued.includes("example.com"));
  assert.ok(queued.includes(GATE_EMAIL.trim()));
});
