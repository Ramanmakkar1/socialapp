"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-notice-ok";

export default function CookieNotice() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Client-only: localStorage is unavailable on the server; defer until mount to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required cookie-notice mount pattern
    setMounted(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors; still hide the bar for this visit.
    }
    setVisible(false);
  }

  if (!mounted || !visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2 shadow-lg"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0">
          We only use essential cookies to keep you signed in.{" "}
          <Link href="/privacy#cookies" className="font-medium text-ink underline underline-offset-2 hover:no-underline">
            Learn more
          </Link>
        </p>
        <button type="button" onClick={dismiss} className="btn-primary shrink-0 rounded-full px-4 min-h-11">
          OK
        </button>
      </div>
    </div>
  );
}
