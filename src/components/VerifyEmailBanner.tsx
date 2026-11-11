import { cookies } from "next/headers";
import { X } from "lucide-react";
import { BtnA } from "@/components/ui/kit";
import { VERIFY_DISMISS_COOKIE } from "@/lib/emailCodes";
import { dismissVerifyBannerAction, resendFromBannerAction } from "@/app/login/emailActions";
import s from "./verifyBanner.module.css";

/**
 * Dashboard nudge for password sign-ups whose email isn't verified yet. Never blocks anything;
 * "Later" hides it for 3 days (cookie). Google accounts are verified, so they never see it.
 */
export default async function VerifyEmailBanner({ email, verified }: { email: string; verified: boolean }) {
  if (verified) return null;
  if ((await cookies()).get(VERIFY_DISMISS_COOKIE)?.value === "1") return null;
  return (
    <div role="status" className={s.banner}>
      <span className={s.text}>
        <strong>Verify your email.</strong> We sent a 6-digit code to {email} so you can reset your password and get alerts.
      </span>
      <span className={s.actions}>
        <BtnA href="/verify-email" size="sm">Enter code</BtnA>
        <form action={resendFromBannerAction}>
          <button type="submit" className={s.link}>Resend</button>
        </form>
        <form action={dismissVerifyBannerAction}>
          <button type="submit" className={s.dismiss} aria-label="Hide for now" title="Hide for now">
            <X width={16} height={16} aria-hidden="true" />
          </button>
        </form>
      </span>
    </div>
  );
}
