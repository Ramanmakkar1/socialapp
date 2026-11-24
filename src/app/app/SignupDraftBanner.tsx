"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { peekSignupDraft } from "@/lib/captionHandoff";
import home from "./home.module.css";

const DISMISS_KEY = "poskoo:signup-draft-dismissed";

// Dashboard banner: a caption saved on a free tool before signup is still
// waiting in the composer. Peek (never remove) so the composer can consume it.
export default function SignupDraftBanner() {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Storage unavailable; show the banner.
    }
    if (dismissed) return;
    const draft = peekSignupDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only draft
    if (draft.ok && draft.caption.trim()) setReady(true);
  }, []);

  if (!ready || dismissed) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage unavailable; hide for this render only.
    }
    setDismissed(true);
  };

  return (
    <div className={home.sdb} role="status">
      <Sparkles className={home.sdbIcon} width={18} height={18} aria-hidden="true" />
      <span className={home.sdbText}>Your caption from the free tool is ready</span>
      <Link href="/app/publish?compose=1" className={home.sdbLink}>Open it in the composer</Link>
      <button type="button" className={home.sdbDismiss} onClick={dismiss}>Dismiss</button>
    </div>
  );
}
