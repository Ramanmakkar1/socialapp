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
  // Card payments (Stripe Connect) not live yet (src/lib/featureReadiness.ts "card_payments").
  if (!configured) {
    return (
      <p role="status" className={`${ui.notice} ${ui.noticeSoon} mt-6`}>
        <span className={`${ui.pill} ${ui.pillSoon}`}>Coming soon</span>{" "}
        {route === "stripe" ? (
          <>
            <strong>Card payments are coming soon.</strong> You can already create products; your buy links show &ldquo;Checkout coming soon&rdquo; until card payments are switched on.
          </>
        ) : (
          <>
            <strong>Card payments are coming soon.</strong> In India you can sell with Direct UPI today. <Link href="/app/settings#payments-heading" className={ui.link}>Choose your country in Settings, Payments</Link>
          </>
        )}
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
