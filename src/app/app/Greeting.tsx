"use client";

import { useSyncExternalStore } from "react";
import { greetingFor } from "@/lib/homeGreeting";

const noop = () => () => {};

// Time-of-day greeting in the browser's time zone. The server (no time zone) renders "Welcome back".
export default function Greeting() {
  const text = useSyncExternalStore(noop, () => greetingFor(new Date().getHours()), () => "Welcome back");
  return <>{text}</>;
}
