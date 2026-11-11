import type { Metadata } from "next";
import { isGoogleConfigured } from "@/lib/googleAuth";
import AuthForm from "../login/AuthForm";

// Per request: the Google button depends on runtime env (the Docker build has no GOOGLE_* vars).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your account",
  alternates: { canonical: "/signup" },
  robots: { index: false },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const { email } = await searchParams;
  const defaultEmail = typeof email === "string" ? email.trim().slice(0, 254) : undefined;
  return <AuthForm mode="signup" googleEnabled={isGoogleConfigured()} defaultEmail={defaultEmail} />;
}
