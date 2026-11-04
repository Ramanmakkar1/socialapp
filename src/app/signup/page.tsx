import type { Metadata } from "next";
import AuthForm from "../login/AuthForm";

export const metadata: Metadata = {
  title: "Create your account",
  alternates: { canonical: "/signup" },
  robots: { index: false },
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
