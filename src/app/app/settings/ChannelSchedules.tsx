"use client";

import { useState } from "react";
import { savePostingSchedule } from "./actions";
import SubmitButton from "@/components/ui/SubmitButton";
import { ALL_DAYS, DAY_LABELS, TIMEZONES } from "@/lib/postingSchedule";
import ui from "@/components/ui/ui.module.css";

export type ChannelScheduleInput = {
  platform: string;
  timezone: string;
  days: number[];
  times: string[];
};

function labelFor(platform: string): string {
  if (platform === "threads") return "Threads";
  if (platform === "facebook") return "Facebook";
  return "Instagram";
}

function ChannelForm({ channel }: { channel: ChannelScheduleInput }) {
  const [timezone, setTimezone] = useState(channel.timezone || "UTC");
  const [days, setDays] = useState<Set<number>>(() => new Set(channel.days));
  const [times, setTimes] = useState<string[]>(() => (channel.times.length > 0 ? [...channel.times] : []));

  function toggleDay(day: number) {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function setTime(index: number, value: string) {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addTime() {
    setTimes((prev) => (prev.length >= 12 ? prev : [...prev, "12:00"]));
  }

  function removeTime(index: number) {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  }

  const name = labelFor(channel.platform);

  return (
    <form action={savePostingSchedule} className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
      <input type="hidden" name="platform" value={channel.platform} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--poskoo-ink)]">{name}</span>
        <label htmlFor={`tz-${channel.platform}`} className={ui.label}>
          Timezone
          <select
            id={`tz-${channel.platform}`}
            name="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={`${ui.input} mt-1`}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className={ui.label}>Posting days</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_DAYS.map((day) => (
            <label key={day} className="flex cursor-pointer items-center gap-1.5 text-sm text-[var(--poskoo-ink)]">
              <input
                type="checkbox"
                name="days"
                value={day}
                checked={days.has(day)}
                onChange={() => toggleDay(day)}
                className="rounded border-[var(--poskoo-line)] text-[var(--poskoo-violet)] focus:ring-[var(--poskoo-violet)]"
              />
              {DAY_LABELS[day]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <span className={ui.label}>Posting times (in {timezone})</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {times.map((t, index) => (
            <span key={index} className="inline-flex items-center gap-1">
              <input
                type="time"
                name="times"
                value={t}
                onChange={(e) => setTime(index, e.target.value)}
                className={`${ui.input} w-auto`}
              />
              <button
                type="button"
                onClick={() => removeTime(index)}
                aria-label={`Remove time ${t}`}
                className="rounded-lg border border-[var(--poskoo-line)] px-2 py-1 text-xs text-[var(--poskoo-muted)] hover:bg-[var(--poskoo-band)]"
              >
                Remove
              </button>
            </span>
          ))}
          {times.length < 12 && (
            <button
              type="button"
              onClick={addTime}
              className="rounded-lg border border-dashed border-[var(--poskoo-line)] px-2 py-1 text-xs font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]"
            >
              + Add time
            </button>
          )}
        </div>
        {times.length === 0 && <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Add at least one time so “Add to queue” can pick a slot.</p>}
      </div>

      <div className="mt-4">
        <SubmitButton label={`Save ${name} schedule`} />
      </div>
    </form>
  );
}

export default function ChannelSchedules({ channels }: { channels: ChannelScheduleInput[] }) {
  if (channels.length === 0) {
    return (
      <p className={ui.hint}>
        Connect a channel under “Connected accounts” above, then set its posting schedule here.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <ChannelForm key={channel.platform} channel={channel} />
      ))}
    </div>
  );
}
