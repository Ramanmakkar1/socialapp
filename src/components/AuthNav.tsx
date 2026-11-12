"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Public pages are cached for everyone, so the header can't know on the server who is logged in.
// A non-secret hint cookie (pf_in=1, set on login and in the dashboard, cleared on logout) lets the
// browser swap "Log in / Start free" for "Open dashboard". The real session stays in the httpOnly
// pf_session cookie; this hint only changes which buttons show.
export const LOGIN_HINT_COOKIE = "pf_in";

export function hasLoginHint(cookie: string): boolean {
  return cookie.split(";").some((c) => c.trim() === `${LOGIN_HINT_COOKIE}=1`);
}

export function AuthNav() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    // Read after mount so the cached HTML and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value
    setLoggedIn(hasLoginHint(document.cookie));
  }, []);
  if (loggedIn) {
    return (
      <Link className="btn btn-dark" href="/app">
        Open dashboard <span aria-hidden="true">→</span>
      </Link>
    );
  }
  return (
    <>
      <Link className="login" href="/login">
        Log in
      </Link>
      <Link className="btn btn-dark" href="/signup">
        Start free <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

/** Mounted inside the dashboard: marks this browser as logged in (covers sessions from before the hint existed). */
export function MarkLoggedIn() {
  useEffect(() => {
    if (!hasLoginHint(document.cookie)) {
      document.cookie = `${LOGIN_HINT_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    }
  }, []);
  return null;
}
