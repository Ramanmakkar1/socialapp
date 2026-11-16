"use client";

import type { CSSProperties } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import AuthIllustration from "@/components/AuthIllustration";
import PoskooMark from "@/components/PoskooMark";
import { GoogleButton } from "@/components/GoogleButton";
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
              <>Create your <em className="s">account</em></>
            ) : (
              <>Log in to <em className="s">Poskoo</em></>
            )}
          </h1>
          <p className={a.lede}>
            {signup ? "Schedule posts and automate Instagram DMs." : "Welcome back. Log in to your dashboard."}
          </p>
          {signup && (
            <p className={a.reassure}>
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <circle cx="9" cy="9" r="9" fill="var(--poskoo-green)" />
                <path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Free plan, no card needed
            </p>
          )}
          {googleEnabled && (
            <>
              <GoogleButton className={`btn btn-line ${a.google}`} />
              <p className={a.divider}><span>or use your email</span></p>
            </>
          )}
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
                aria-describedby={signup ? "password-rule" : undefined}
                className={INPUT}
              />
              {signup && <p id="password-rule" className={a.hint}>At least 8 characters.</p>}
            </div>
            {!signup && (
              <div className={a.forgot}>
                <Link href="/forgot-password" className={a.textLink}>
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
            {signup && (
              <p className={a.consent}>
                By creating an account you agree to the <Link href="/terms" className={a.textLink}>Terms</Link> and{" "}
                <Link href="/privacy" className={a.textLink}>Privacy Policy</Link>.
              </p>
            )}
          </form>
          {notice && (
            <p role="status" className={`${ui.notice} ${a.googleNotice}`}>{notice}</p>
          )}
          {googleError && (
            <p role="alert" className={`${ui.notice} ${ui.noticeWarn} ${a.googleNotice}`}>{googleError}</p>
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
