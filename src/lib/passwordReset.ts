// "Forgot password" orchestration with injectable dependencies (unit tested without DB or Next).
// The public answer never depends on whether the account exists (no user enumeration).
import { CODE_MESSAGES, normalizeCodeInput, type CodeCheck } from "@/lib/emailCodes";
import { absoluteUrl, googleAccountResetEmail, passwordResetEmail, type RenderedEmail } from "@/lib/emailTemplates";
import { normalizeEmail } from "@/lib/password";
import { rateLimit as defaultRateLimit, tooManyMessage, type RateLimitResult } from "@/lib/rateLimit";

export type ResetUser = { id: string; email: string; name: string | null; hasPassword: boolean };

export type ForgotDeps = {
  findUser: (email: string) => Promise<ResetUser | null>;
  issueCode: (userId: string) => Promise<{ code: string; token: string }>;
  send: (to: string, mail: RenderedEmail, tag: string) => Promise<unknown>;
  /** Runs work after the response (Next `after`). */
  background: (task: () => Promise<void>) => void;
  rateLimit?: (key: string, limit: number, windowMs: number) => RateLimitResult;
};

export type ForgotResult = { sent: true; email: string } | { error: string; email?: string };

export const FORGOT_LIMITS = { perEmailIp: 3, perIp: 20, perEmailIpWindowMs: 15 * 60 * 1000, perIpWindowMs: 60 * 60 * 1000 };

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function requestPasswordReset(rawEmail: string, ip: string, deps: ForgotDeps): ForgotResult {
  const email = normalizeEmail(rawEmail ?? "");
  if (!validEmail(email)) return { error: "Enter a valid email address." };
  const limit = deps.rateLimit ?? defaultRateLimit;
  const perEmail = limit(`forgot:${ip}:${email}`, FORGOT_LIMITS.perEmailIp, FORGOT_LIMITS.perEmailIpWindowMs);
  const perIp = limit(`forgot-ip:${ip}`, FORGOT_LIMITS.perIp, FORGOT_LIMITS.perIpWindowMs);
  if (!perEmail.ok || !perIp.ok) {
    return { error: tooManyMessage(Math.max(perEmail.ok ? 0 : perEmail.retryAfterMs, perIp.ok ? 0 : perIp.retryAfterMs)), email };
  }
  deps.background(async () => {
    const user = await deps.findUser(email);
    if (!user) return;
    if (!user.hasPassword) {
      await deps.send(user.email, googleAccountResetEmail({ name: user.name }), "password_reset_google");
      return;
    }
    const { code, token } = await deps.issueCode(user.id);
    await deps.send(user.email, passwordResetEmail({ name: user.name, code, link: absoluteUrl(`/reset-password?token=${encodeURIComponent(token)}`) }), "password_reset");
  });
  return { sent: true, email };
}

export type CodeResetDeps = {
  findUser: (email: string) => Promise<ResetUser | null>;
  redeemCode: (userId: string, code: string) => Promise<CodeCheck>;
};

/**
 * Checks email + typed code. Unknown e-mails and Google-only accounts get exactly the same answer
 * as a wrong code. Returns the user id on success.
 */
export async function checkResetCode(rawEmail: string, rawCode: string, deps: CodeResetDeps): Promise<{ userId: string } | { error: string }> {
  const email = normalizeEmail(rawEmail ?? "");
  const code = normalizeCodeInput(rawCode);
  if (!validEmail(email)) return { error: "Enter the email address the code was sent to." };
  if (code.length !== 6) return { error: "Enter the 6-digit code from the email." };
  const user = await deps.findUser(email);
  if (!user || !user.hasPassword) return { error: CODE_MESSAGES.wrong };
  const result = await deps.redeemCode(user.id, code);
  return result === "ok" ? { userId: user.id } : { error: CODE_MESSAGES[result] };
}
