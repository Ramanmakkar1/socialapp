"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { seedDefaultScheduleAction } from "./actions";

// Renders nothing. When the user has a connected channel but no posting schedule yet, seeds the
// default one (Mon-Fri 9:00, 12:00, 18:00) in the browser's time zone, then refreshes the page.
export default function ScheduleSeeder({ needed }: { needed: boolean }) {
  const router = useRouter();
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
    seedDefaultScheduleAction(tz)
      .then((r) => {
        if (r.seeded > 0) router.refresh();
      })
      .catch(() => {});
  }, [needed, router]);
  return null;
}
