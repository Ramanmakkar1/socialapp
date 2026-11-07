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

export default function SignupPage() {
  return <AuthForm mode="signup" googleEnabled={isGoogleConfigured()} />;
}
