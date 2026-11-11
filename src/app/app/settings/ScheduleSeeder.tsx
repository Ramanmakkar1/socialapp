"use client";

import { useEffect, useRef } from "react";
import { seedDefaultScheduleAction } from "./actions";

// Renders nothing. When the user has a connected channel but no posting schedule yet, seeds the
// default one (Mon-Fri 9:00, 12:00, 18:00) in the browser's time zone. The action revalidates
// Settings and Calendar, so the new schedule shows without a second full-page refresh.
export default function ScheduleSeeder({ needed }: { needed: boolean }) {
  const ran = useRef(false);
  useEffect(() => {
    if (!needed || ran.current) return;
    ran.current = true;
    let tz = "UTC";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      tz = "UTC";
    }
    seedDefaultScheduleAction(tz).catch(() => {});
  }, [needed]);
  return null;
}
