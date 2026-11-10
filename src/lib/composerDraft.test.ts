import assert from "node:assert/strict";
import { test } from "node:test";
import {
  composerStateFromDraft,
  scheduleInstantForSave,
  scheduleOrigin,
  toLocalInputValue,
  type ComposerDraftInitial,
} from "./composerDraft.ts";

function draft(overrides: Partial<ComposerDraftInitial> = {}): ComposerDraftInitial {
  return {
    id: "d1",
    caption: "Draft one caption",
    firstComment: "#tags",
    tags: ["Launch"],
    platforms: ["instagram"],
    overrides: { instagram: "IG only text" },
    mediaUrls: ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"],
    igFormat: "feed",
    dmRuleId: "rule-1",
    scheduledAt: "2026-12-01T15:00:00.000Z",
    ...overrides,
  };
}

function withTz<T>(tz: string, run: () => T): T {
  const previous = process.env.TZ;
  process.env.TZ = tz;
  try {
    return run();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}

test("draft opened by URL: the first render already holds every saved field", () => {
  const state = composerStateFromDraft(draft());
  assert.equal(state.draftId, "d1");
  assert.equal(state.mainCaption, "Draft one caption");
  assert.equal(state.firstComment, "#tags");
  assert.deepEqual(state.tags, ["Launch"]);
  assert.deepEqual(state.enabled, { instagram: true, facebook: false, threads: false, youtube: false });
  assert.deepEqual(state.customize, { instagram: true, facebook: false, threads: false, youtube: false });
  assert.equal(state.customCaption.instagram, "IG only text");
  assert.deepEqual(state.mediaUrls, ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"]);
  assert.equal(state.igFormat, "feed");
  assert.equal(state.selectedRuleId, "rule-1");
});

test("switching drafts never carries the previous draft; no draft gives a blank composer", () => {
  const a = composerStateFromDraft(draft());
  const b = composerStateFromDraft(draft({ id: "d2", caption: "Second", overrides: {}, mediaUrls: [], dmRuleId: null, igFormat: "story", firstComment: "" }));
  assert.equal(b.draftId, "d2");
  assert.equal(b.mainCaption, "Second");
  assert.equal(b.customize.instagram, false);
  assert.equal(b.customCaption.instagram, "");
  assert.deepEqual(b.mediaUrls, [""]);
  assert.equal(b.selectedRuleId, "");
  assert.equal(b.igFormat, "story");
  assert.notEqual(a.mediaUrls, b.mediaUrls);
  const blank = composerStateFromDraft(undefined);
  assert.equal(blank.draftId, undefined);
  assert.equal(blank.mainCaption, "");
  assert.deepEqual(blank.mediaUrls, [""]);
});

test("draft time keeps the exact instant across a DST fall-back (ambiguous local time)", () => {
  withTz("America/New_York", () => {
    // 01:30 EST, the SECOND 01:30 of 2026-11-01 in New York.
    const iso = "2026-11-01T06:30:00.000Z";
    const origin = scheduleOrigin(iso);
    assert.equal(origin?.local, "2026-11-01T01:30");
    // Re-reading the wall time picks the first 01:30 (EDT), an hour earlier:
    assert.notEqual(new Date(origin!.local).toISOString(), iso);
    // ...but saving an untouched draft keeps the stored instant.
    assert.deepEqual(scheduleInstantForSave(origin!.local, origin), { ok: true, iso });
  });
});

test("draft time keeps seconds and the same instant when reopened in another time zone", () => {
  const iso = "2026-12-01T15:00:30.000Z";
  for (const tz of ["Asia/Kolkata", "America/Los_Angeles", "UTC"]) {
    withTz(tz, () => {
      const origin = scheduleOrigin(iso);
      assert.equal(origin?.local, toLocalInputValue(new Date(iso)), tz);
      assert.deepEqual(scheduleInstantForSave(origin!.local, origin), { ok: true, iso }, tz);
    });
  }
  withTz("Asia/Kolkata", () => {
    assert.equal(scheduleOrigin(iso)?.local, "2026-12-01T20:30");
  });
});

test("an edited time is read in the user's time zone; DST-gap times and garbage are rejected", () => {
  withTz("America/New_York", () => {
    const origin = scheduleOrigin("2026-12-01T15:00:00.000Z");
    assert.deepEqual(scheduleInstantForSave("2026-12-02T09:15", origin), { ok: true, iso: "2026-12-02T14:15:00.000Z" });
    assert.deepEqual(scheduleInstantForSave("2026-03-08T02:30", origin), { ok: false });
    assert.deepEqual(scheduleInstantForSave("not a date", null), { ok: false });
    assert.deepEqual(scheduleInstantForSave("", origin), { ok: true, iso: null });
  });
});
