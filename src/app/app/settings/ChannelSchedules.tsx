"use client";

import { useEffect, useState } from "react";
import { savePostingSchedule } from "./actions";
import SubmitButton from "@/components/ui/SubmitButton";
import { ALL_DAYS, DAY_LABELS, DEFAULT_SCHEDULE_DAYS, DEFAULT_SCHEDULE_TIMES, TIMEZONES } from "@/lib/postingSchedule";
import { Plus, X } from "lucide-react";
import ui from "@/components/ui/ui.module.css";
import styles from "./settings.module.css";

export type ChannelScheduleInput = {
  platform: string;
  timezone: string;
  days: number[];
  times: string[];
  /** false = no row saved yet: the form starts from the suggested default in the browser's zone. */
  saved?: boolean;
};

function labelFor(platform: string): string {
  if (platform === "threads") return "Threads";
  if (platform === "facebook") return "Facebook";
  return "Instagram";
}

function ChannelForm({ channel }: { channel: ChannelScheduleInput }) {
  const unsaved = channel.saved === false;
  const [timezone, setTimezone] = useState(channel.timezone || "UTC");
  const [days, setDays] = useState<Set<number>>(() => new Set(unsaved ? DEFAULT_SCHEDULE_DAYS : channel.days));
  const [times, setTimes] = useState<string[]>(() => (unsaved ? [...DEFAULT_SCHEDULE_TIMES] : [...channel.times]));

  // A new schedule starts in the browser's time zone (set after hydration so server and client match).
  useEffect(() => {
    if (!unsaved) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the browser
      if (tz) setTimezone(tz);
    } catch {
      // keep UTC
    }
  }, [unsaved]);
  const zoneOptions = (TIMEZONES as readonly string[]).includes(timezone) ? TIMEZONES : [timezone, ...TIMEZONES];

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
    <form action={savePostingSchedule} className={styles.schedCard}>
      <input type="hidden" name="platform" value={channel.platform} />
      <div className={styles.schedHead}>
        <span className={styles.schedName}>
          {name}
          {unsaved && <span className={styles.schedDraft}>Suggested times, not saved yet</span>}
        </span>
        <label htmlFor={`tz-${channel.platform}`} className={styles.schedTz}>
          <span>Time zone</span>
          <select
            id={`tz-${channel.platform}`}
            name="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={styles.select}
          >
            {zoneOptions.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className={styles.schedField}>
        <legend className={styles.schedLabel}>Posting days</legend>
        <div className={styles.dayChips}>
          {ALL_DAYS.map((day) => (
            <label key={day} className={styles.dayChip}>
              <input
                type="checkbox"
                name="days"
                value={day}
                checked={days.has(day)}
                onChange={() => toggleDay(day)}
              />
              <span>{DAY_LABELS[day]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.schedField}>
        <span className={styles.schedLabel}>Posting times <span className={styles.schedLabelSub}>in {timezone}</span></span>
        <div className={styles.timeChips}>
          {times.map((t, index) => (
            <span key={index} className={styles.timeChip}>
              <input
                type="time"
                name="times"
                value={t}
                onChange={(e) => setTime(index, e.target.value)}
                aria-label={`Posting time ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeTime(index)}
                aria-label={`Remove time ${t}`}
                className={styles.timeRemove}
              >
                <X width={14} height={14} aria-hidden="true" />
              </button>
            </span>
          ))}
          {times.length < 12 && (
            <button type="button" onClick={addTime} className={styles.addTime}>
              <Plus width={14} height={14} aria-hidden="true" /> Add time
            </button>
          )}
        </div>
        {times.length === 0 && <p className={styles.schedHint}>Add at least one time so “Add to queue” can pick a slot.</p>}
      </div>

      {days.size === 0 && <p className={styles.schedHint}>Pick at least one day so “Add to queue” can pick a slot.</p>}

      <div className={styles.schedFoot}>
        <SubmitButton label={`Save ${name} schedule`} size="sm" />
      </div>
    </form>
  );
}

export default function ChannelSchedules({ channels }: { channels: ChannelScheduleInput[] }) {
  if (channels.length === 0) {
    return (
      <p className={ui.hint}>
        Connect a channel under “Channels” above, then set its posting schedule here.
      </p>
    );
  }
  return (
    <div className={styles.schedList}>
      {channels.map((channel) => (
        <ChannelForm key={`${channel.platform}-${channel.saved === false ? "new" : "saved"}`} channel={channel} />
      ))}
    </div>
  );
}
