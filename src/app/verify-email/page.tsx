import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { consumeToken, markEmailVerified } from "@/lib/authEmail";
import { isDbConfigured } from "@/lib/db";
import AuthFrame from "../login/AuthFrame";
import { VerifyForm } from "../login/EmailAuthForms";
import ui from "@/components/ui/ui.module.css";
import a from "../login/auth.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify your email",
  alternates: { canonical: "/verify-email" },
  robots: { index: false },
  referrer: "no-referrer",
};

function Verified() {
  return (
    <AuthFrame art="signup" title={<>Email <em className="s">verified</em></>} lede="Thanks! Your email address is confirmed.">
      <div className={a.stack}>
        <p role="status" className={ui.notice}>You’re all set. Password resets and alerts will reach you here.</p>
        <Link href="/app" className="btn btn-dark">Open your dashboard</Link>
      </div>
    </AuthFrame>
  );
}

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string | string[]; sent?: string | string[]; done?: string | string[] }> }) {
  const { token, sent, done } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthFrame art="signup" title={<>Log in to <em className="s">verify</em></>} lede="For your safety, verification only works while you’re logged in to the account it was sent for.">
        <div className={a.stack}>
          <p role="status" className={ui.notice}>Log in, then open the link in the email again (or type the 6-digit code from the banner in your dashboard).</p>
          <Link href="/login" className="btn btn-dark">Log in</Link>
        </div>
      </AuthFrame>
    );
  }
  if (user.emailVerified || done === "1") return <Verified />;

  let linkError: string | undefined;
  if (typeof token === "string" && token && isDbConfigured()) {
    // Bound to the signed-in user: a link opened by someone else (or a mail scanner) does nothing.
    const id = await consumeToken(token, "verify", user.id).catch(() => null);
    if (id) {
      await markEmailVerified(id).catch(() => false);
      return <Verified />;
    }
    linkError = "This link has expired, was already used or belongs to another account. Enter the newest code or send a new one.";
  }

  const notice = linkError
    ? { error: linkError }
    : sent === "1"
      ? { message: `We sent a new code to ${user.email}. It expires in 15 minutes.` }
      : sent === "0"
        ? { error: "We couldn’t send a new code right now. Please wait a few minutes and try again." }
        : undefined;

  return (
    <AuthFrame
      art="signup"
      title={<>Verify your <em className="s">email</em></>}
      lede={<>Enter the 6-digit code we sent to <strong>{user.email}</strong>.</>}
    >
      <VerifyForm notice={notice} />
    </AuthFrame>
  );
}
