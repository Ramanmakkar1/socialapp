"use client";

import type { CSSProperties } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import AuthIllustration from "@/components/AuthIllustration";
import PoskooMark from "@/components/PoskooMark";
import { loginAction, signupAction } from "./actions";
import ui from "@/components/ui/ui.module.css";
import landing from "@/app/landing.module.css";
import a from "./auth.module.css";

// Bridge the generic token names to the Poskoo palette (same mapping as PublicShell).
// The page sits inside the landing wrapper, so the logo, pill button and
// serif-italic accent are the landing's own classes.
const tokenBridge = {
  "--line": "var(--poskoo-line)",
  "--surface": "var(--poskoo-card)",
  "--surface-2": "var(--poskoo-band)",
  "--ink-2": "#3d3450",
  "--brand": "var(--poskoo-violet)",
  "--brand-2": "var(--poskoo-coral)",
  "--ok": "var(--poskoo-green)",
  "--warn": "var(--poskoo-coral)",
} as CSSProperties;

const INPUT = `${ui.input} mt-1.5`;

// Google's four-colour "G" (brand guidelines: keep the official colours on a light button).
function GoogleG() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function AuthForm({
  mode,
  googleEnabled = false,
  googleError = null,
  notice = null,
  defaultEmail,
}: {
  mode: "login" | "signup";
  /** Show "Continue with Google" (only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set). */
  googleEnabled?: boolean;
  /** Message after a failed Google sign-in (/login?google=...). */
  googleError?: string | null;
  /** Confirmation shown above the form (e.g. /login?account=deleted). */
  notice?: string | null;
  /** Email typed into the landing hero (/signup?email=...). */
  defaultEmail?: string;
}) {
  const signup = mode === "signup";
  const [state, formAction, pending] = useActionState(signup ? signupAction : loginAction, undefined);

  return (
    <main
      className={`${landing.landing} ${instrumentSans.variable} ${instrumentSerif.variable} ${a.page}`}
      style={tokenBridge}
    >
      <div className={`wrap ${a.grid}`}>
        <div className={a.card}>
          <Link className="logo" href="/">
            <PoskooMark size={34} />
            poskoo<b>.</b>
          </Link>
          <h1 className={a.title}>
            {signup ? (
              <>Create your <em className="s">account.</em></>
            ) : (
              <>Log in to <em className="s">poskoo.</em></>
            )}
          </h1>
          <p className={a.lede}>
            {signup ? "Schedule posts and automate Instagram DMs." : "Welcome back. Log in to your dashboard."}
          </p>
          <form action={formAction} className={a.form}>
            {signup && (
              <div>
                <label htmlFor="name" className={ui.label}>Name <span className={a.muted}>(optional)</span></label>
                <input id="name" name="name" type="text" autoComplete="name" className={INPUT} />
              </div>
            )}
            <div>
              <label htmlFor="email" className={ui.label}>Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required defaultValue={defaultEmail} className={INPUT} />
            </div>
            <div>
              <label htmlFor="password" className={ui.label}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={signup ? 8 : undefined}
                className={INPUT}
              />
            </div>
            {!signup && (
              <div className={a.forgot}>
                <Link href="/contact#password-reset" className={a.textLink}>
                  Forgot password?
                </Link>
              </div>
            )}
            {state?.error && (
              <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="btn btn-dark"
            >
              {pending ? "Please wait…" : signup ? "Create account" : "Log in"}
            </button>
          </form>
          {notice && (
            <p role="status" className={`${ui.notice} ${a.googleNotice}`}>{notice}</p>
          )}
          {googleError && (
            <p role="alert" className={`${ui.notice} ${ui.noticeWarn} ${a.googleNotice}`}>{googleError}</p>
          )}
          {googleEnabled && (
            <>
              <p className={a.divider}><span>or</span></p>
              {/* Plain <a>: the OAuth start is a route handler redirect, never prefetched. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth redirect, must not be client-routed */}
              <a href="/api/auth/google/start" className={`btn btn-line ${a.google}`}>
                <GoogleG />
                {signup ? "Sign up with Google" : "Continue with Google"}
              </a>
            </>
          )}
          <p className={a.switch}>
            {signup ? (
              <>Already have an account? <Link href="/login" className={a.textLink}>Log in</Link></>
            ) : (
              <>No account? <Link href="/signup" className={a.textLink}>Create one</Link></>
            )}
          </p>
        </div>
        <div className={a.side}>
          <AuthIllustration mode={mode} />
        </div>
      </div>
    </main>
  );
}
