import type { Metadata } from "next";
import Link from "next/link";
import AuthFrame from "../login/AuthFrame";
import { ForgotForm } from "../login/EmailAuthForms";
import a from "../login/auth.module.css";
import EmailSoon from "../login/EmailSoon";
import { isFeatureReady } from "@/lib/featureReadiness";
import { isGoogleConfigured } from "@/lib/googleAuth";

// Per request: whether a reset code can be e-mailed depends on runtime env (src/lib/featureReadiness.ts).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot password",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false },
};

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const { email } = await searchParams;
  if (!isFeatureReady("email")) {
    return (
      <AuthFrame
        title={<>Forgot your <em className="s">password?</em></>}
        lede="Password reset codes are sent by e-mail, which isn’t switched on yet."
        footer={<>Remembered it? <Link href="/login" className={a.textLink}>Log in</Link></>}
      >
        <EmailSoon googleEnabled={isGoogleConfigured()} what="a reset code" />
      </AuthFrame>
    );
  }
  return (
    <AuthFrame
      title={<>Forgot your <em className="s">password?</em></>}
      lede="Enter your account email and we’ll send you a 6-digit code to reset it."
      footer={<>Remembered it? <Link href="/login" className={a.textLink}>Log in</Link></>}
    >
      <ForgotForm defaultEmail={typeof email === "string" ? email.trim().slice(0, 254) : undefined} />
    </AuthFrame>
  );
}
