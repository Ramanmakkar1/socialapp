"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { instrumentSans } from "@/lib/fonts";

const STORAGE_KEY = "cookie-notice-ok";

// Poskoo panel: white card on the poskoo tokens. Rendered at the body level
// (outside PublicShell), so the font variable class is applied here directly.
const panelStyle: CSSProperties = {
  background: "var(--poskoo-card)",
  border: "1.5px solid var(--poskoo-line)",
  borderRadius: "var(--poskoo-radius-card)",
  boxShadow: "var(--poskoo-shadow-card)",
  fontFamily: 'var(--font-instrument-sans), "Segoe UI", system-ui, sans-serif',
};

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
      className={`${instrumentSans.variable} fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl p-4 text-sm`}
      style={panelStyle}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0" style={{ color: "#3d3450" }}>
          We only use essential cookies to keep you signed in.{" "}
          <Link
            href="/privacy#cookies"
            className="font-medium underline underline-offset-2 hover:no-underline"
            style={{ color: "var(--poskoo-ink)" }}
          >
            Learn more
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0"
          style={{
            background: "var(--poskoo-ink)",
            color: "#fff",
            border: "1.5px solid var(--poskoo-ink)",
            borderRadius: "var(--poskoo-radius-pill)",
            padding: "10px 22px",
            minHeight: "44px",
            font: '600 0.92rem/1 var(--font-instrument-sans), "Segoe UI", system-ui, sans-serif',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
