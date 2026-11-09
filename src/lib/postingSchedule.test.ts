import assert from "node:assert/strict";
import { test } from "node:test";
import {
  nextSlot,
  nextSlotForChannel,
  reassignQueueTimes,
  zonedTimeToUtc,
  type ChannelSchedule,
} from "./postingSchedule.ts";

const MON_09 = Date.UTC(2026, 10, 9, 9, 0); // Mon 2026-11-09 09:00 UTC

test("zonedTimeToUtc resolves a US Eastern wall time (EST, UTC-5 in November)", () => {
  assert.equal(zonedTimeToUtc("America/New_York", 2026, 11, 9, 9, 0), Date.UTC(2026, 10, 9, 14, 0));
});

test("zonedTimeToUtc resolves UTC and a positive offset (Sydney AEDT, UTC+11)", () => {
  assert.equal(zonedTimeToUtc("UTC", 2026, 11, 9, 9, 0), MON_09);
  assert.equal(zonedTimeToUtc("Australia/Sydney", 2026, 11, 9, 9, 0), Date.UTC(2026, 10, 8, 22, 0));
});

test("zonedTimeToUtc returns null for an unknown timezone", () => {
  assert.equal(zonedTimeToUtc("Mars/Olympus_Mons", 2026, 11, 9, 9, 0), null);
});

test("nextSlotForChannel picks the next working day when today's slot passed", () => {
  const schedule: ChannelSchedule = { platform: "instagram", timezone: "UTC", days: [1, 2, 3, 4, 5], times: ["09:00"] };
  const now = Date.UTC(2026, 10, 4, 10, 0); // Wed 2026-11-04 10:00 UTC
  assert.equal(nextSlotForChannel(schedule, now), Date.UTC(2026, 10, 5, 9, 0)); // Thu 09:00
});

test("nextSlotForChannel keeps today when today's slot is still ahead", () => {
  const schedule: ChannelSchedule = { platform: "instagram", timezone: "UTC", days: [1, 2, 3, 4, 5], times: ["09:00"] };
  const now = Date.UTC(2026, 10, 4, 8, 0); // Wed 08:00 UTC
  assert.equal(nextSlotForChannel(schedule, now), Date.UTC(2026, 10, 4, 9, 0));
});

test("nextSlotForChannel skips weekends", () => {
  const schedule: ChannelSchedule = { platform: "instagram", timezone: "UTC", days: [1, 2, 3, 4, 5], times: ["09:00"] };
  const now = Date.UTC(2026, 10, 6, 10, 0); // Fri 2026-11-06 10:00 UTC
  assert.equal(nextSlotForChannel(schedule, now), Date.UTC(2026, 10, 9, 9, 0)); // Mon 09:00
});

test("nextSlotForChannel honours the channel timezone (09:00 New York = 14:00 UTC in November)", () => {
  const schedule: ChannelSchedule = { platform: "instagram", timezone: "America/New_York", days: [1, 2, 3, 4, 5], times: ["09:00"] };
  const now = Date.UTC(2026, 10, 9, 12, 0); // Mon 2026-11-09 12:00 UTC = 07:00 New York
  assert.equal(nextSlotForChannel(schedule, now), Date.UTC(2026, 10, 9, 14, 0));
});

test("nextSlotForChannel returns null with no days or no times", () => {
  assert.equal(nextSlotForChannel({ platform: "threads", timezone: "UTC", days: [], times: ["09:00"] }, Date.now()), null);
  assert.equal(nextSlotForChannel({ platform: "threads", timezone: "UTC", days: [1], times: [] }, Date.now()), null);
});

test("nextSlotForChannel skips a slot less than one minute away", () => {
  const schedule: ChannelSchedule = { platform: "instagram", timezone: "UTC", days: [1, 2, 3, 4, 5, 6, 7], times: ["14:00"] };
  const now = Date.UTC(2026, 10, 9, 13, 59, 30); // 30 s before today's 14:00
  assert.equal(nextSlotForChannel(schedule, now), Date.UTC(2026, 10, 10, 14, 0));
});

test("nextSlot returns the earliest slot across channels", () => {
  const ig: ChannelSchedule = { platform: "instagram", timezone: "UTC", days: [1, 2, 3, 4, 5, 6, 7], times: ["10:00"] };
  const th: ChannelSchedule = { platform: "threads", timezone: "UTC", days: [1, 2, 3, 4, 5, 6, 7], times: ["08:00"] };
  const now = Date.UTC(2026, 10, 9, 12, 0);
  assert.equal(nextSlot([ig, th], now), Date.UTC(2026, 10, 10, 8, 0));
});

test("nextSlot returns null when no channel has a usable schedule", () => {
  assert.equal(nextSlot([], Date.now()), null);
  assert.equal(nextSlot([{ platform: "facebook", timezone: "UTC", days: [], times: [] }], Date.now()), null);
});

test("reassignQueueTimes keeps the first future time and spaces the rest by the median gap", () => {
  const t0 = Date.UTC(2026, 10, 9, 9, 0);
  const times = reassignQueueTimes(
    [
      { id: "a", scheduledAt: t0 + 3600_000 },
      { id: "b", scheduledAt: t0 + 7200_000 },
      { id: "c", scheduledAt: t0 + 10800_000 },
    ],
    t0,
  );
  assert.equal(times.get("a"), t0 + 3600_000);
  assert.equal(times.get("b"), t0 + 7200_000);
  assert.equal(times.get("c"), t0 + 10800_000);
});

test("reassignQueueTimes reorders publish times to match the new drag order", () => {
  const t0 = Date.UTC(2026, 10, 9, 9, 0);
  const times = reassignQueueTimes(
    [
      { id: "b", scheduledAt: t0 + 7200_000 }, // dragged to the top
      { id: "a", scheduledAt: t0 + 3600_000 },
      { id: "c", scheduledAt: t0 + 10800_000 },
    ],
    t0,
  );
  assert.equal(times.get("b"), t0 + 7200_000);
  assert.equal(times.get("a"), t0 + 10800_000);
  assert.equal(times.get("c"), t0 + 14400_000);
});

test("reassignQueueTimes starts one minute from now when the first time already passed", () => {
  const now = Date.UTC(2026, 10, 9, 9, 30);
  const times = reassignQueueTimes(
    [
      { id: "a", scheduledAt: Date.UTC(2026, 10, 9, 8, 0) },
      { id: "b", scheduledAt: Date.UTC(2026, 10, 9, 11, 0) },
    ],
    now,
  );
  assert.equal(times.get("a"), now + 60_000);
  assert.equal(times.get("b"), now + 60_000 + 3 * 3600_000); // original 3 h gap
});

test("reassignQueueTimes gives unscheduled drafts a one-minute cadence", () => {
  const now = Date.UTC(2026, 10, 9, 9, 30);
  const times = reassignQueueTimes([{ id: "a", scheduledAt: null }, { id: "b", scheduledAt: null }], now);
  assert.equal(times.get("a"), now + 60_000);
  assert.equal(times.get("b"), now + 120_000);
});

test("reassignQueueTimes handles an empty queue", () => {
  assert.deepEqual(reassignQueueTimes([], Date.now()), new Map());
});
