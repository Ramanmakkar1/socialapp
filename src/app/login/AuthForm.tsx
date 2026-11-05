"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import AuthIllustration from "@/components/AuthIllustration";
import { loginAction, signupAction } from "./actions";

const INPUT =
  "mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [state, formAction, pending] = useActionState(signup ? signupAction : loginAction, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
      <div className="w-full max-w-sm mx-auto rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <Link href="/" className="mb-6 flex items-center gap-2 font-semibold">
          <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg"><Zap className="h-4 w-4" /></span>{BRAND.name}
        </Link>
        <h1 className="text-xl font-semibold">{signup ? "Create your account" : "Log in"}</h1>
        <p className="mt-1 text-sm text-muted">
          {signup ? "Schedule posts and automate Instagram DMs." : "Welcome back. Log in to your dashboard."}
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          {signup && (
            <div>
              <label htmlFor="name" className="text-sm font-medium text-ink-2">Name <span className="text-muted">(optional)</span></label>
              <input id="name" name="name" type="text" autoComplete="name" className={INPUT} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink-2">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className={INPUT} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink-2">Password</label>
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
              <Link href="/contact#password-reset" className="text-sm font-medium text-ink-2 underline">
                Forgot password?
              </Link>
            </div>
          )}
          {state?.error && (
            <p role="alert" className="text-sm text-warn">{state.error}</p>
          )}
          <button type="submit" disabled={pending} className="btn-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-60">
            {pending ? "Please wait…" : signup ? "Create account" : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          {signup ? (
            <>Already have an account? <Link href="/login" className="font-medium text-ink-2 underline">Log in</Link></>
          ) : (
            <>No account? <Link href="/signup" className="font-medium text-ink-2 underline">Create one</Link></>
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
