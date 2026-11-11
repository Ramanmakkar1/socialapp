import type { Metadata } from "next";
import Link from "next/link";
import { peekToken } from "@/lib/authEmail";
import { isDbConfigured } from "@/lib/db";
import AuthFrame from "../login/AuthFrame";
import { ResetForm } from "../login/EmailAuthForms";
import ui from "@/components/ui/ui.module.css";
import a from "../login/auth.module.css";

// Per request: a magic-link token is checked against the DB.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password",
  alternates: { canonical: "/reset-password" },
  robots: { index: false },
  // The URL can carry a one-time token: never leak it in a Referer header.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[]; email?: string | string[] }> }) {
  const { token, email } = await searchParams;
  const footer = (
    <>
      No code? <Link href="/forgot-password" className={a.textLink}>Send a new one</Link> · <Link href="/login" className={a.textLink}>Log in</Link>
    </>
  );

  if (typeof token === "string" && token) {
    // Only look the link up here; it is used up when the new password is saved (mail scanners
    // that open links don't burn it).
    const target = isDbConfigured() ? await peekToken(token, "reset").catch(() => null) : null;
    if (!target) {
      return (
        <AuthFrame title={<>Link <em className="s">expired.</em></>} lede="This reset link has expired or was already used. Links work once, for 15 minutes." footer={footer}>
          <div className={a.stack}>
            <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>Request a new code and use the newest email.</p>
            <Link href="/forgot-password" className="btn btn-dark">Send a new code</Link>
          </div>
        </AuthFrame>
      );
    }
    return (
      <AuthFrame title={<>Choose a new <em className="s">password.</em></>} lede="Pick something you don’t use anywhere else." footer={footer}>
        <ResetForm token={token} email={target.email} />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title={<>Reset your <em className="s">password.</em></>} lede="Enter the 6-digit code we emailed you and choose a new password." footer={footer}>
      <ResetForm email={typeof email === "string" ? email.trim().slice(0, 254) : undefined} />
    </AuthFrame>
  );
}
