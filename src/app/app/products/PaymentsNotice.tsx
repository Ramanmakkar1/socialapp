import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import type { ConnectedAccount } from "@/lib/stripeConnect";
import { payoutRoute } from "@/lib/upi";
import { upiReady, type SellerPayout } from "@/lib/upiOrders";

/**
 * Friendly payments state shown on Products / Orders (same pattern as the Instagram
 * "not switched on yet" notice): pages keep working, nothing crashes without Stripe keys.
 */
export default function PaymentsNotice({ configured, account, payout = null }: { configured: boolean; account: ConnectedAccount | null; payout?: SellerPayout | null }) {
  // Seller's country routes payments: India -> Direct UPI, elsewhere outside Stripe -> not yet.
  const route = payout ? payoutRoute(payout.country) : null;
  if (route === "upi") {
    return upiReady(payout) ? null : (
      <p role="status" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>
        Add your UPI ID to get paid. <Link href="/app/settings#payments-heading" className={ui.link}>Go to Settings, Payments</Link>
      </p>
    );
  }
  if (route === "unsupported") {
    return (
      <p role="status" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>
        Selling isn&apos;t available in your country yet. <Link href="/app/settings#payments-heading" className={ui.link}>Payments settings</Link>
      </p>
    );
  }
  if (!configured) {
    return (
      <p role="status" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>
        Payments are not switched on yet. You can already create products; buy links start taking payments once payments are switched on and you connect Stripe in Settings.
      </p>
    );
  }
  if (!account) {
    return (
      <p role="status" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>
        Choose your country and connect Stripe (or UPI in India) to get paid. <Link href="/app/settings#payments-heading" className={ui.link}>Go to Settings, Payments</Link>
      </p>
    );
  }
  if (!account.charges_enabled) {
    return (
      <p role="status" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>
        Your Stripe account is not ready to take payments yet. <Link href="/app/settings#payments-heading" className={ui.link}>Finish Stripe setup</Link>
      </p>
    );
  }
  return null;
}
