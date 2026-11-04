"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createUser, endSession, startSession, verifyLogin } from "@/lib/auth";
import { validateSignup } from "@/lib/password";
import { reviewerLogin } from "@/lib/reviewer";

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
  try {
    const user = await createUser(email, password, name || undefined);
    if (!user) {
      return { error: "An account with this email already exists. Log in instead." };
    }
    await startSession(user.id, (await headers()).get("user-agent") ?? undefined);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/app");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<{ error?: string }> {
  const email = field(formData, "email");
  const password = field(formData, "password");
  if (!email || !password) {
    return { error: "Wrong email or password." };
  }
  try {
    const user = (await reviewerLogin(email, password)) ?? (await verifyLogin(email, password));
    if (!user) {
      return { error: "Wrong email or password." };
    }
    await startSession(user.id, (await headers()).get("user-agent") ?? undefined);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/app");
}

export async function logoutAction(): Promise<void> {
  try {
    await endSession();
  } catch {
    // Still send the user to /login; the cookie is cleared on the next login.
  }
  redirect("/login");
}
