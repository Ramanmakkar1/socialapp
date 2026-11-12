"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { instrumentSans } from "@/lib/fonts";
import c from "./cookieNotice.module.css";

const STORAGE_KEY = "cookie-notice-ok";

// Slim one-line bar (max ~56px tall on phones). Rendered at the body level
// (outside PublicShell), so the font variable class is applied here directly.
// While it is visible the body gets bottom padding so it never sits on top of
// the last CTA of a page.
const BODY_PAD = "calc(72px + env(safe-area-inset-bottom, 0px))";

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

  useEffect(() => {
    if (!visible) return;
    const body = document.body;
    const prev = body.style.paddingBottom;
    body.style.paddingBottom = BODY_PAD;
    return () => {
      body.style.paddingBottom = prev;
    };
  }, [visible]);

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
    <div role="region" aria-label="Cookie notice" className={`${instrumentSans.variable} ${c.bar}`}>
      <p className={c.text}>Essential cookies only.</p>
      <Link href="/privacy#cookies" className={c.more}>
        Learn more
      </Link>
      <button type="button" onClick={dismiss} className={c.ok}>
        OK
      </button>
    </div>
  );
}
