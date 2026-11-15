import assert from "node:assert/strict";
import { test } from "node:test";
import { adapterKind, isReminderNetwork, mediaLinkLabel, parseFacebookGroup, parseInstagramHandle, reminderOpenUrl } from "./reminder.ts";
import { reminderSecret, signReminderToken, verifyReminderToken } from "./reminderToken.ts";
import { publishNetworkTargets } from "./publish.ts";
import type { NetAccount } from "./common.ts";

test("adapter selection: reminder channels never go to a network API", () => {
  assert.equal(adapterKind("ig_personal"), "reminder");
  assert.equal(adapterKind("fb_group"), "reminder");
  assert.equal(adapterKind("instagram"), "api");
  assert.equal(adapterKind("tiktok"), "api");
  assert.equal(isReminderNetwork("facebook"), false);
  assert.equal(isReminderNetwork(undefined), false);
});

test("Instagram handle: @name, name and profile links; bad handles rejected", () => {
  assert.deepEqual(parseInstagramHandle(" @Jamie.Makes "), { externalId: "jamie.makes", name: "@jamie.makes", openUrl: "https://www.instagram.com/jamie.makes/" });
  assert.equal((parseInstagramHandle("https://www.instagram.com/jamie_m/?hl=en") as { externalId: string }).externalId, "jamie_m");
  assert.ok("error" in parseInstagramHandle(""));
  assert.ok("error" in parseInstagramHandle("has space"));
  assert.ok("error" in parseInstagramHandle("trailing."));
  assert.ok("error" in parseInstagramHandle("a".repeat(31)));
});

test("Facebook group: link opens that group, a bare name opens the Groups feed", () => {
  const byLink = parseFacebookGroup("https://www.facebook.com/groups/yegplantswap/?ref=share", "YEG Plant Swap");
  assert.deepEqual(byLink, { externalId: "groups/yegplantswap", name: "YEG Plant Swap", openUrl: "https://www.facebook.com/groups/yegplantswap/" });
  const numeric = parseFacebookGroup("facebook.com/groups/123456789");
  assert.equal((numeric as { name: string }).name, "Facebook group");
  const byName = parseFacebookGroup("  Edmonton   Plant Swap ");
  assert.deepEqual(byName, { externalId: "name:edmonton plant swap", name: "Edmonton Plant Swap", openUrl: "https://www.facebook.com/groups/feed/" });
  assert.ok("error" in parseFacebookGroup("https://facebook.com/someprofile"));
  assert.ok("error" in parseFacebookGroup("x"));
});

test("open link only trusts instagram.com / facebook.com URLs from meta", () => {
  assert.equal(reminderOpenUrl("ig_personal", { openUrl: "https://www.instagram.com/jamie/" }), "https://www.instagram.com/jamie/");
  assert.equal(reminderOpenUrl("ig_personal", { openUrl: "https://evil.example/" }), "https://www.instagram.com/");
  assert.equal(reminderOpenUrl("fb_group", {}), "https://www.facebook.com/groups/feed/");
  assert.equal(mediaLinkLabel("video", 1), "Video 2");
});

const TARGET = "0b8f6a52-3c1d-4e5f-9a7b-1c2d3e4f5a6b";

test("Mark-as-posted token: round trip, tamper, wrong secret, expiry", () => {
  const now = Date.UTC(2026, 10, 12);
  const token = signReminderToken(TARGET, now + 60_000, "s3cret");
  assert.equal(verifyReminderToken(token, "s3cret", now), TARGET);
  assert.equal(verifyReminderToken(token, "other", now), null);
  assert.equal(verifyReminderToken(token, "s3cret", now + 120_000), null);
  const [id, exp, sig] = token.split(".");
  assert.equal(verifyReminderToken(`${id}.${(parseInt(exp, 36) + 999_999).toString(36)}.${sig}`, "s3cret", now), null);
  assert.equal(verifyReminderToken(`${TARGET.replace("0b", "1b")}.${exp}.${sig}`, "s3cret", now), null);
  assert.equal(verifyReminderToken("garbage", "s3cret", now), null);
  assert.equal(verifyReminderToken(token, "", now), null);
});

test("reminder secret: own env var, else derived from TOKEN_ENCRYPTION_KEY (never the key itself)", () => {
  const saved = { a: process.env.REMINDER_LINK_SECRET, b: process.env.TOKEN_ENCRYPTION_KEY };
  delete process.env.REMINDER_LINK_SECRET;
  process.env.TOKEN_ENCRYPTION_KEY = "base-key";
  const derived = reminderSecret();
  assert.ok(derived && derived !== "base-key");
  process.env.REMINDER_LINK_SECRET = "own";
  assert.equal(reminderSecret(), "own");
  if (saved.a === undefined) delete process.env.REMINDER_LINK_SECRET;
  else process.env.REMINDER_LINK_SECRET = saved.a;
  if (saved.b === undefined) delete process.env.TOKEN_ENCRYPTION_KEY;
  else process.env.TOKEN_ENCRYPTION_KEY = saved.b;
});

test("publish loop: a reminder outcome marks the target 'reminded', never published", async () => {
  const account = { id: "acc", platform: "ig_personal", externalId: "jamie", username: "jamie", accessToken: "reminder", meta: {} } as unknown as NetAccount;
  const row = { id: "target-1", post_id: "post-1", caption_override: null, caption: "hi", media: [], user_id: "u" };
  const calls: string[] = [];
  const result = await publishNetworkTargets(
    5,
    {
      claim: (() => { let done = false; return async () => (done ? [] : ((done = true), [row])); })(),
      markFailed: async () => void calls.push("failed"),
      refreshPostStatus: async () => void calls.push("refresh"),
      loadAccount: async () => account,
      ensureFresh: async (a) => a,
      publish: async () => ({ ok: true, id: "reminder", reminded: true }),
      markPublished: async () => void calls.push("published"),
      markReminded: async (id, acc) => void calls.push(`reminded:${id}:${acc}`),
    },
    ["ig_personal"],
  );
  assert.deepEqual(calls, ["reminded:target-1:acc", "refresh"]);
  assert.deepEqual(result, { published: 0, failed: 0, reminded: 1 });
});

test("reminder e-mail: escaped caption, file links, open link and Mark as posted", async () => {
  const { reminderEmail } = await import("../emailTemplates.ts");
  const m = reminderEmail({
    name: "Jamie",
    channel: "Instagram (personal)",
    account: "@jamie",
    caption: "Hi <b>there</b>\n#tag",
    media: [{ label: "Photo 1", url: "https://poskoo.com/api/media/u/a.jpg?exp=1&sig=x" }],
    openLabel: "Open Instagram",
    openUrl: "https://www.instagram.com/jamie/",
    doneUrl: "https://poskoo.com/api/reminders/done?t=abc",
    holdDays: 7,
  });
  assert.equal(m.subject, "Time to post to @jamie");
  assert.ok(m.html.includes("Hi &lt;b&gt;there&lt;/b&gt;"));
  assert.ok(m.html.includes("white-space:pre-wrap"));
  assert.ok(m.html.includes('href="https://poskoo.com/api/media/u/a.jpg?exp=1&amp;sig=x"'));
  assert.ok(m.html.includes('href="https://www.instagram.com/jamie/"'));
  assert.ok(m.html.includes("Mark as posted"));
  assert.ok(m.text.includes("Hi <b>there</b>\n#tag"));
  assert.ok(m.text.includes("Mark as posted: https://poskoo.com/api/reminders/done?t=abc"));
});
