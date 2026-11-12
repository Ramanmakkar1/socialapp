"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { consumeToken, findUserByEmail, issueCode, markEmailVerified, setPasswordAndRevoke, redeemCode } from "@/lib/authEmail";
import { isDbConfigured } from "@/lib/db";
import { isFeatureReady } from "@/lib/featureReadiness";
import { sendEmail } from "@/lib/email";
import { CODE_MESSAGES, VERIFY_DISMISS_COOKIE, normalizeCodeInput } from "@/lib/emailCodes";
import { inBackground, sendPasswordChanged, sendVerification } from "@/lib/emailNotify";
import { normalizeEmail, validateSignup } from "@/lib/password";
import { checkResetCode, requestPasswordReset, validEmail } from "@/lib/passwordReset";
import { clientIp, rateLimit, tooManyMessage } from "@/lib/rateLimit";

export type EmailFormState = { error?: string; sent?: boolean; email?: string; message?: string } | undefined;

const UNAVAILABLE = "This is not available right now. Please try again in a minute.";
const EMAIL_SOON = "Email sign-in codes are coming soon. Continue with Google to sign in.";

function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/**
 * Step 1 of "Forgot password". The answer is the same whether or not an account exists (no user
 * enumeration), and the lookup + e-mail run after the response so timing gives nothing away either.
 */
export async function forgotPasswordAction(_prev: EmailFormState, formData: FormData): Promise<EmailFormState> {
  if (!isDbConfigured()) return { error: UNAVAILABLE };
  // Never pretend a code was sent when no mailer is configured (src/lib/featureReadiness.ts).
  if (!isFeatureReady("email")) return { error: EMAIL_SOON };
  return requestPasswordReset(field(formData, "email"), clientIp(await headers()), {
    findUser: findUserByEmail,
    issueCode: (userId) => issueCode(userId, "reset"),
    send: (to, mail, tag) => sendEmail({ to, subject: mail.subject, html: mail.html, text: mail.text, tag }),
    background: (task) => inBackground("password_reset", task),
  });
}

/** Step 2: a code (with the e-mail) or the magic-link token, plus the new password. */
export async function resetPasswordAction(_prev: EmailFormState, formData: FormData): Promise<EmailFormState> {
  const token = field(formData, "token");
  const email = normalizeEmail(field(formData, "email"));
  const code = field(formData, "code");
  const password = field(formData, "password");
  const ip = clientIp(await headers());
  const perIp = rateLimit(`reset-ip:${ip}`, 30, 15 * 60 * 1000);
  if (!perIp.ok) return { error: tooManyMessage(perIp.retryAfterMs), email };

  // Check the password first so a typo doesn't burn the code.
  const pwErrors = validateSignup({ email: validEmail(email) ? email : "x@poskoo.com", password }).filter((e) => e.startsWith("Password"));
  if (pwErrors.length) return { error: pwErrors.join(" "), email };
  if (!isDbConfigured()) return { error: UNAVAILABLE, email };

  let userId: string | null = null;
  try {
    if (token) {
      userId = await consumeToken(token, "reset");
      if (!userId) return { error: "This reset link has expired or was already used. Request a new code below.", email };
    } else {
      const perEmail = rateLimit(`reset:${ip}:${email}`, 10, 15 * 60 * 1000);
      if (!perEmail.ok) return { error: tooManyMessage(perEmail.retryAfterMs), email };
      // Unknown email / Google-only account: the same answer as a wrong code (no enumeration).
      const checked = await checkResetCode(email, code, { findUser: findUserByEmail, redeemCode: (id, c) => redeemCode(id, "reset", c) });
      if ("error" in checked) return { error: checked.error, email };
      userId = checked.userId;
    }
    const updated = await setPasswordAndRevoke(userId, password);
    if (!updated) return { error: UNAVAILABLE, email };
    inBackground("password_changed", () => sendPasswordChanged(updated));
  } catch (err) {
    console.error("reset password failed", err instanceof Error ? err.message.slice(0, 120) : "unknown");
    return { error: UNAVAILABLE, email };
  }
  (await cookies()).delete("pf_session");
  redirect("/login?reset=done");
}

/** Dashboard: verify the signed-in user's e-mail with the 6-digit code. */
export async function verifyEmailCodeAction(_prev: EmailFormState, formData: FormData): Promise<EmailFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerified) redirect("/verify-email");
  const code = normalizeCodeInput(field(formData, "code"));
  if (code.length !== 6) return { error: "Enter the 6-digit code from the email." };
  const limited = rateLimit(`verify:${user.id}`, 10, 15 * 60 * 1000);
  if (!limited.ok) return { error: tooManyMessage(limited.retryAfterMs) };
  try {
    const result = await redeemCode(user.id, "verify", code);
    if (result !== "ok") return { error: CODE_MESSAGES[result] };
    await markEmailVerified(user.id);
  } catch {
    return { error: UNAVAILABLE };
  }
  redirect("/verify-email?done=1");
}

/** Sends (or re-sends) the verification e-mail to the signed-in user. Rate limited. */
export async function resendVerificationAction(): Promise<EmailFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerified) return { message: "Your email is already verified." };
  if (!isFeatureReady("email")) return { error: "Email verification codes are coming soon. Nothing is blocked meanwhile." };
  const limited = rateLimit(`verify-send:${user.id}`, 3, 15 * 60 * 1000);
  if (!limited.ok) return { error: tooManyMessage(limited.retryAfterMs) };
  try {
    const ok = await sendVerification(user);
    if (!ok) return { error: "We couldn’t send the email right now. Please try again in a few minutes." };
  } catch {
    return { error: UNAVAILABLE };
  }
  return { message: `We sent a new code to ${user.email}. It expires in 15 minutes.` };
}

/** Banner form: resend, then go to the code page. */
export async function resendFromBannerAction(): Promise<void> {
  const res = await resendVerificationAction();
  redirect(res?.error ? "/verify-email?sent=0" : "/verify-email?sent=1");
}

/** Hides the "Verify your email" banner for 3 days. */
export async function dismissVerifyBannerAction(): Promise<void> {
  (await cookies()).set(VERIFY_DISMISS_COOKIE, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 3 * 24 * 60 * 60 });
}
