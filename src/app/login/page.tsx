import type { Metadata } from "next";
import AuthForm from "./AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
