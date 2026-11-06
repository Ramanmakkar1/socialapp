"use client";

import type { CSSProperties } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { instrumentSans } from "@/lib/fonts";
import AuthIllustration from "@/components/AuthIllustration";
import PoskooMark from "@/components/PoskooMark";
import { loginAction, signupAction } from "./actions";
import ui from "@/components/ui/ui.module.css";

// Bridge the generic token names to the Poskoo palette (same mapping as PublicShell)
// so this page matches the landing design without a shared chrome.
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

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [state, formAction, pending] = useActionState(signup ? signupAction : loginAction, undefined);

  return (
    <main
      className={`${instrumentSans.variable} flex min-h-screen items-center justify-center px-4 py-10`}
      style={{
        ...tokenBridge,
        background: "var(--poskoo-paper)",
        color: "var(--poskoo-ink)",
        fontFamily: "var(--font-instrument-sans), 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        <div className={`${ui.card} mx-auto w-full max-w-sm p-8`}>
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xl font-bold tracking-tight" style={{ color: "var(--poskoo-ink)" }}>
            <PoskooMark size={30} />
            poskoo<b style={{ color: "var(--poskoo-coral)" }}>.</b>
          </Link>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: "var(--poskoo-type-heading-ls)" }}>
            {signup ? "Create your account" : "Log in"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--poskoo-muted)" }}>
            {signup ? "Schedule posts and automate Instagram DMs." : "Welcome back. Log in to your dashboard."}
          </p>
          <form action={formAction} className="mt-6 grid gap-4">
            {signup && (
              <div>
                <label htmlFor="name" className={ui.label}>Name <span style={{ color: "var(--poskoo-muted)" }}>(optional)</span></label>
                <input id="name" name="name" type="text" autoComplete="name" className={INPUT} />
              </div>
            )}
            <div>
              <label htmlFor="email" className={ui.label}>Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className={INPUT} />
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
              <div className="flex justify-end">
                <Link href="/contact#password-reset" className="text-sm font-semibold underline underline-offset-2" style={{ color: "var(--poskoo-ink)" }}>
                  Forgot password?
                </Link>
              </div>
            )}
            {state?.error && (
              <p role="alert" className={`${ui.notice} ${ui.noticeWarn} text-sm`}>{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className={`${ui.btn} ${ui.btnDark} w-full`}
            >
              {pending ? "Please wait…" : signup ? "Create account" : "Log in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm" style={{ color: "var(--poskoo-muted)" }}>
            {signup ? (
              <>Already have an account? <Link href="/login" className="font-semibold underline underline-offset-2" style={{ color: "var(--poskoo-ink)" }}>Log in</Link></>
            ) : (
              <>No account? <Link href="/signup" className="font-semibold underline underline-offset-2" style={{ color: "var(--poskoo-ink)" }}>Create one</Link></>
            )}
          </p>
        </div>
        <div className="hidden lg:block">
          <AuthIllustration mode={mode} />
        </div>
      </div>
    </main>
  );
}
