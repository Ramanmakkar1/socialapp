import type { Metadata } from "next";
import Link from "next/link";
import AuthFrame from "../login/AuthFrame";
import { ForgotForm } from "../login/EmailAuthForms";
import a from "../login/auth.module.css";

export const metadata: Metadata = {
  title: "Forgot password",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false },
};

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const { email } = await searchParams;
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
