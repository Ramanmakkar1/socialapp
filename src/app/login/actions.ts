"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createUser, endSession, startSession, verifyLogin } from "@/lib/auth";
import { query } from "@/lib/db";
import { inBackground, sendNewDevice, sendVerification, sendWelcome } from "@/lib/emailNotify";
import { hashToken } from "@/lib/password";
import { normalizeEmail, validateSignup } from "@/lib/password";
import { attributeReferralFromCookie } from "@/lib/referralCookie";
import { clientIp, rateLimit, tooManyMessage } from "@/lib/rateLimit";
import { reviewerLogin } from "@/lib/reviewer";
import { UPGRADE_INTENT_COOKIE, billingChoiceHref, parseUpgradeIntent } from "@/lib/upgradeIntent";

/** After sign-up / log-in: the billing page when the visitor picked a paid plan on /pricing, else the dashboard. */
async function afterAuthPath(): Promise<string> {
  const intent = parseUpgradeIntent((await cookies()).get(UPGRADE_INTENT_COOKIE)?.value);
  return intent ? billingChoiceHref(intent) : "/app";
}

export type AuthState = { error?: string } | undefined;

const DB_ERROR = "Sign-in is not available right now. Please try again.";

function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<{ error?: string }> {
  const email = field(formData, "email");
  const password = field(formData, "password");
  const name = field(formData, "name").trim();
  const errors = validateSignup({ email, password });
  if (errors.length > 0) {
    return { error: errors.join(" ") };
  }
  const limited = rateLimit(`signup:${clientIp(await headers())}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return { error: tooManyMessage(limited.retryAfterMs) };
  try {
    const user = await createUser(email, password, name || undefined);
    if (!user) {
      return { error: "An account with this email already exists. Log in instead." };
    }
    await attributeReferralFromCookie(user.id);
    const userAgent = (await headers()).get("user-agent") ?? undefined;
    await startSession(user.id, userAgent);
    await rememberDevice(user.id).catch(() => false);
    // Welcome + "verify your email" (code and link), after the response. Login is never blocked.
    inBackground("signup", async () => {
      await sendWelcome(user);
      await sendVerification(user);
    });
  } catch {
    return { error: DB_ERROR };
  }
  redirect(await afterAuthPath());
}

const DEVICE_COOKIE = "pk_dev";

/** Remembers (in a long-lived cookie) that this browser has logged in to `userId`. Returns whether it already knew. */
async function rememberDevice(userId: string): Promise<boolean> {
  const jar = await cookies();
  const tag = hashToken(`device:${userId}`).slice(0, 16);
  const known = (jar.get(DEVICE_COOKIE)?.value ?? "").split(".").filter((t) => /^[0-9a-f]{16}$/.test(t));
  if (known.includes(tag)) return true;
  jar.set(DEVICE_COOKIE, [tag, ...known].slice(0, 5).join("."), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 400 * 24 * 60 * 60,
  });
  return false;
}

/**
 * "New login" e-mail: only when this browser never logged in to the account before AND the
 * account has no live session with the same browser (so existing users aren't alerted the first
 * time after this shipped) AND the account is older than a day. EMAIL_NEW_DEVICE_ALERTS=false turns it off.
 */
async function alertIfNewDevice(user: { id: string; email: string; name: string | null }, userAgent: string | undefined): Promise<void> {
  if (process.env.EMAIL_NEW_DEVICE_ALERTS === "false") return;
  if (await rememberDevice(user.id)) return;
  const rows = await query<{ known: boolean; fresh: boolean | null }>(
    `select exists(select 1 from socialapp.sessions where user_id=$1 and user_agent is not distinct from $2 and expires_at > now()) as known,
            (select created_at > now() - interval '1 day' from socialapp.users where id=$1) as fresh`,
    [user.id, userAgent ?? null],
  );
  if (rows[0]?.known || rows[0]?.fresh !== false) return;
  inBackground("new_device", () => sendNewDevice(user, userAgent));
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<{ error?: string }> {
  const email = field(formData, "email");
  const password = field(formData, "password");
  if (!email || !password) {
    return { error: "Wrong email or password." };
  }
  const ip = clientIp(await headers());
  const perAccount = rateLimit(`login:${ip}:${normalizeEmail(email).slice(0, 254)}`, 10, 15 * 60 * 1000);
  const perIp = rateLimit(`login-ip:${ip}`, 50, 15 * 60 * 1000);
  if (!perAccount.ok || !perIp.ok) {
    const wait = Math.max(perAccount.ok ? 0 : perAccount.retryAfterMs, perIp.ok ? 0 : perIp.retryAfterMs);
    return { error: tooManyMessage(wait) };
  }
  try {
    const user = (await reviewerLogin(email, password)) ?? (await verifyLogin(email, password));
    if (user === "google_only") {
      return { error: "This account uses Google sign-in. Press \"Continue with Google\" below." };
    }
    if (!user) {
      return { error: "Wrong email or password." };
    }
    const userAgent = (await headers()).get("user-agent") ?? undefined;
    // Before startSession: the check looks for an existing session from this browser.
    await alertIfNewDevice(user, userAgent).catch(() => undefined);
    await startSession(user.id, userAgent);
  } catch {
    return { error: DB_ERROR };
  }
  redirect(await afterAuthPath());
}

export async function logoutAction(): Promise<void> {
  try {
    await endSession();
  } catch {
    // Still send the user to /login; the cookie is cleared on the next login.
  }
  redirect("/login");
}
