"use client";

import { useEffect, useState } from "react";

type LocalTimeProps = {
  value: string | Date | null;
  style?: "short" | "medium";
  fallback?: string;
};

export default function LocalTime({ value, style = "short", fallback }: LocalTimeProps) {
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    // Client-only: avoids SSR UTC vs browser timezone hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- boss-mandated pattern for local times
    setIsLocal(true);
  }, []);

  const date = value === null ? null : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return fallback ?? "";

  const iso = date.toISOString();
  const options: Intl.DateTimeFormatOptions = style === "medium"
    ? { dateStyle: "medium", timeStyle: "short" }
    : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
  const text = new Intl.DateTimeFormat(isLocal ? undefined : "en-US", {
    ...options,
    ...(isLocal ? {} : { timeZone: "UTC" }),
  }).format(date);

  return <time dateTime={iso} title={iso}>{text}{isLocal ? "" : " UTC"}</time>;
}
