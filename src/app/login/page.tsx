import type { Metadata } from "next";
import { GOOGLE_ERRORS, isGoogleConfigured } from "@/lib/googleAuth";
import AuthForm from "./AuthForm";

// Per request: the Google button depends on runtime env (the Docker build has no GOOGLE_* vars).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log in",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ google?: string | string[]; account?: string | string[]; reset?: string | string[] }> }) {
  const { google, account, reset } = await searchParams;
  const notice =
    account === "deleted"
      ? "Your Poskoo account and its data were deleted. Thanks for trying Poskoo."
      : reset === "done"
        ? "Password updated. Log in with your new password."
        : null;
  const googleError = typeof google === "string" && Object.hasOwn(GOOGLE_ERRORS, google) ? GOOGLE_ERRORS[google] : null;
  return <AuthForm mode="login" googleEnabled={isGoogleConfigured()} googleError={googleError} notice={notice} />;
}
