"use client";

import { useActionState } from "react";
import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import { forgotPasswordAction, resendVerificationAction, resetPasswordAction, verifyEmailCodeAction } from "./emailActions";
import a from "./auth.module.css";

const INPUT = `${ui.input} mt-1.5`;

function Alert({ error, message }: { error?: string; message?: string }) {
  if (error) return <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>{error}</p>;
  if (message) return <p role="status" className={ui.notice}>{message}</p>;
  return null;
}

function CodeField({ autoFocus }: { autoFocus?: boolean }) {
  return (
    <div>
      <label htmlFor="code" className={ui.label}>6-digit code</label>
      <input
        id="code"
        name="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 \-]{6,9}"
        maxLength={9}
        required
        autoFocus={autoFocus}
        placeholder="••••••"
        className={`${INPUT} ${a.codeInput}`}
      />
    </div>
  );
}

export function ForgotForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined);
  if (state?.sent) {
    const next = `/reset-password?email=${encodeURIComponent(state.email ?? "")}`;
    return (
      <div className={a.stack}>
        <p role="status" className={ui.notice}>
          If an account exists for <strong>{state.email}</strong>, we sent a 6-digit code to it. It expires in 15 minutes. Check your spam folder too.
        </p>
        <Link href={next} className="btn btn-dark">Enter the code</Link>
      </div>
    );
  }
  return (
    <form action={action} className={a.form}>
      <div>
        <label htmlFor="email" className={ui.label}>Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.email ?? defaultEmail} className={INPUT} />
      </div>
      <Alert error={state?.error} />
      <button type="submit" disabled={pending} aria-busy={pending} className="btn btn-dark">
        {pending ? "Sending…" : "Send reset code"}
      </button>
    </form>
  );
}

export function ResetForm({ token, email }: { token?: string; email?: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  return (
    <form action={action} className={a.form}>
      {token ? (
        <>
          <input type="hidden" name="token" value={token} />
          {email && <input type="hidden" name="email" value={email} />}
          {email && <p className={a.hint}>Resetting the password for <strong>{email}</strong>.</p>}
        </>
      ) : (
        <>
          <div>
            <label htmlFor="email" className={ui.label}>Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.email ?? email} className={INPUT} />
          </div>
          <CodeField autoFocus={Boolean(email)} />
        </>
      )}
      <div>
        <label htmlFor="password" className={ui.label}>New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={200} className={INPUT} />
        <p className={a.hint}>At least 8 characters. You’ll be signed out everywhere.</p>
      </div>
      <Alert error={state?.error} />
      <button type="submit" disabled={pending} aria-busy={pending} className="btn btn-dark">
        {pending ? "Saving…" : "Reset password"}
      </button>
    </form>
  );
}

export function VerifyForm({ notice }: { notice?: { error?: string; message?: string } }) {
  const [state, action, pending] = useActionState(verifyEmailCodeAction, undefined);
  const [resent, resend, resending] = useActionState(resendVerificationAction, undefined);
  const msg = state?.error ? { error: state.error } : resent ?? notice;
  return (
    <>
      <form action={action} className={a.form}>
        <CodeField autoFocus />
        <Alert error={msg?.error} message={msg?.message} />
        <button type="submit" disabled={pending} aria-busy={pending} className="btn btn-dark">
          {pending ? "Checking…" : "Verify email"}
        </button>
      </form>
      <form action={resend} className={`${a.links} mt-4`}>
        <button type="submit" className={a.linkButton} disabled={resending}>
          {resending ? "Sending…" : "Send me a new code"}
        </button>
        <Link href="/app" className={a.textLink}>Do this later</Link>
      </form>
    </>
  );
}
