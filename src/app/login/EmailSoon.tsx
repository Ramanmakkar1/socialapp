// Shown instead of "we e-mailed you a code" while e-mail isn't switched on yet
// (src/lib/featureReadiness.ts "email"): Google sign-in is the way in meanwhile.
import Link from "next/link";
import { GoogleButton } from "@/components/GoogleButton";
import ui from "@/components/ui/ui.module.css";
import a from "./auth.module.css";

export default function EmailSoon({ googleEnabled, what }: { googleEnabled: boolean; what: string }) {
  return (
    <div className={a.stack}>
      <p role="status" className={`${ui.notice} ${ui.noticeSoon}`}>
        <strong>Email sign-in codes aren&apos;t switched on yet.</strong> We can&apos;t e-mail {what} yet, so nothing would arrive.{" "}
        {googleEnabled ? "Continue with Google to sign in with the same address." : <>Write to <a href="mailto:hello@poskoo.com" className={ui.link}>hello@poskoo.com</a> and we&apos;ll help you get back in.</>}
        {" "}You can also <Link href="/contact" className={ui.link}>contact support</Link>.
      </p>
      {googleEnabled ? <GoogleButton className={`btn btn-line ${a.google}`} /> : null}
      <Link href="/login" className="btn btn-dark">Back to log in</Link>
    </div>
  );
}
