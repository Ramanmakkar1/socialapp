import { CreditCard } from "lucide-react";
import ui from "@/components/ui/ui.module.css";
import SubmitButton from "@/components/ui/SubmitButton";
import { BtnA, BtnLink } from "@/components/ui/kit";
import { isDbConfigured } from "@/lib/db";
import { platformFeeBps } from "@/lib/money";
import { isStripeConfigured } from "@/lib/payments";
import { CONNECT_COUNTRIES, connectedAccountForPage } from "@/lib/stripeConnect";
import styles from "../app-page.module.css";

const MESSAGES: Record<string, { warn: boolean; text: string }> = {
  connected: { warn: false, text: "Stripe is connected. You can take payments." },
  pending: { warn: true, text: "Stripe still needs a few details before you can take payments. Continue setup when you're ready." },
  error: { warn: true, text: "We couldn't reach Stripe. Please try again." },
  not_configured: { warn: true, text: "Payments are not switched on yet." },
};

/** Settings section "Payments: connect Stripe" (Stripe Connect onboarding for creators). */
export default async function PaymentsSettings({ userId, status }: { userId: string; status?: string }) {
  const configured = isStripeConfigured() && isDbConfigured();
  const account = configured ? await connectedAccountForPage(userId) : null;
  const message = status && Object.hasOwn(MESSAGES, status) ? MESSAGES[status] : null;
  const fee = (platformFeeBps() / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
  return (
    <section className={styles.section} aria-labelledby="payments-heading">
      <div className={styles.sectionHeader}>
        <h2 id="payments-heading" className={styles.sectionTitle}>Payments: connect Stripe</h2>
      </div>
      <p className={ui.hint}>
        Sell digital products to your followers. Buyers pay by card through Stripe and the money goes to your own Stripe account; Poskoo keeps a {fee}% fee per sale (Stripe processing fees apply).
      </p>
      {message ? <p role="status" className={`${ui.notice} ${message.warn ? ui.noticeWarn : ""}`}>{message.text}</p> : null}
      {!configured ? (
        <p role="status" className={`${ui.notice} ${ui.noticeWarn}`}>
          Payments are not switched on yet. You can already create products; they start selling once payments are switched on.
        </p>
      ) : !account ? (
        <form action="/app/settings/payments/connect" method="post" className="flex flex-wrap items-end gap-3">
          <div className={ui.field}>
            <label htmlFor="connect-country" className={ui.label}>Country of your business or bank account</label>
            <select id="connect-country" name="country" defaultValue="US" className={ui.input}>
              {CONNECT_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <SubmitButton label="Connect Stripe" pendingLabel="Opening Stripe…" />
        </form>
      ) : (
        <div className={`${ui.card} p-4`}>
          <p className="m-0 flex flex-wrap items-center gap-2">
            <CreditCard aria-hidden="true" size={18} />
            <span className="font-semibold text-[var(--poskoo-ink)]">Stripe account</span>
            <span className={`${ui.pill} ${account.charges_enabled ? ui.pillMint : ui.pillPeach}`}>
              {account.charges_enabled ? "Payments on" : "Setup incomplete"}
            </span>
            <span className={`${ui.pill} ${account.payouts_enabled ? ui.pillMint : ui.pillPeach}`}>
              {account.payouts_enabled ? "Payouts on" : "Payouts pending"}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!account.charges_enabled || !account.payouts_enabled ? (
              <BtnA href="/app/settings/payments/connect" size="sm">Continue Stripe setup</BtnA>
            ) : null}
            <BtnA href="/app/settings/payments/dashboard" variant="ghost" size="sm" target="_blank" rel="noopener">Open Stripe dashboard</BtnA>
            <BtnLink href="/app/products" variant="ghost" size="sm">Products</BtnLink>
          </div>
        </div>
      )}
    </section>
  );
}
