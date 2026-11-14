import { CreditCard, Smartphone } from "lucide-react";
import ui from "@/components/ui/ui.module.css";
import SubmitButton from "@/components/ui/SubmitButton";
import { BtnA, BtnLink } from "@/components/ui/kit";
import { isDbConfigured } from "@/lib/db";
import { platformFeeBps } from "@/lib/money";
import { FEATURE_COPY, isFeatureReady } from "@/lib/featureReadiness";
import { CONNECT_COUNTRIES, connectedAccountForPage, type ConnectedAccount } from "@/lib/stripeConnect";
import { payoutRoute } from "@/lib/upi";
import { getSellerPayout, upiReady, type SellerPayout } from "@/lib/upiOrders";
import styles from "../app-page.module.css";

const MESSAGES: Record<string, { warn: boolean; text: string }> = {
  connected: { warn: false, text: "Stripe is connected. You can take payments." },
  pending: { warn: true, text: "Stripe still needs a few details before you can take payments. Continue setup when you're ready." },
  error: { warn: true, text: "We couldn't reach Stripe. Please try again." },
  not_configured: { warn: false, text: "Card payments aren't switched on yet. Direct UPI (India) works today." },
  country: { warn: false, text: "Country saved." },
  country_error: { warn: true, text: "Pick a country from the list." },
  upi_saved: { warn: false, text: "UPI details saved. Your INR products can now be bought by UPI." },
  upi_bad_vpa: { warn: true, text: "That UPI ID doesn't look right. It should look like name@bank (for example priya@okhdfcbank)." },
  upi_bad_name: { warn: true, text: "Add the name buyers will see when they pay (1 to 80 characters)." },
  upi_error: { warn: true, text: "We couldn't save your UPI details. Please try again." },
};

/** Countries in the selector: Stripe countries + India (Direct UPI) + "somewhere else". */
const COUNTRY_OPTIONS = [...CONNECT_COUNTRIES, { code: "IN", name: "India" }]
  .sort((a, b) => a.name.localeCompare(b.name))
  .concat([{ code: "OTHER", name: "Another country" }]);

function CountryForm({ current, label }: { current: string | null; label: string }) {
  return (
    <form action="/app/settings/payments/country" method="post" className="flex flex-wrap items-end gap-3">
      <div className={ui.field}>
        <label htmlFor="payout-country" className={ui.label}>Country of your business or bank account</label>
        <select id="payout-country" name="country" defaultValue={current ?? "US"} className={ui.input}>
          {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      <SubmitButton label={label} pendingLabel="Saving…" variant={current ? "line" : "dark"} />
    </form>
  );
}

function UpiSection({ payout }: { payout: SellerPayout | null }) {
  const ready = upiReady(payout);
  return (
    <div className={`${ui.card} p-4`}>
      <p className="m-0 flex flex-wrap items-center gap-2">
        <Smartphone aria-hidden="true" size={18} />
        <span className="font-semibold text-[var(--poskoo-ink)]">Get paid by UPI</span>
        <span className={`${ui.pill} ${ready ? ui.pillMint : ui.pillPeach}`}>{ready ? "UPI on" : "Add your UPI ID"}</span>
      </p>
      <p className={`${ui.hint} mt-2`}>
        Buyers pay your UPI ID directly from any UPI app (GPay, PhonePe, Paytm, BHIM). The money goes straight to your bank: Poskoo never holds it and takes no per-sale fee.
        Each buyer sends you their UPI reference (UTR); you check it in your bank or UPI app and confirm it in Orders, and only then do they get the product. Prices must be in INR.
      </p>
      <form action="/app/settings/payments/upi" method="post" className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className={ui.field}>
          <label htmlFor="upi-vpa" className={ui.label}>UPI ID</label>
          <input id="upi-vpa" name="vpa" required minLength={3} maxLength={256} placeholder="yourname@okhdfcbank" autoComplete="off" spellCheck={false}
            defaultValue={payout?.upi_vpa ?? ""} pattern="[A-Za-z0-9._\-]+@[A-Za-z][A-Za-z0-9.\-]*" className={ui.input} />
        </div>
        <div className={ui.field}>
          <label htmlFor="upi-name" className={ui.label}>Name buyers see</label>
          <input id="upi-name" name="payee_name" required maxLength={80} placeholder="Priya Sharma" defaultValue={payout?.upi_payee_name ?? ""} className={ui.input} />
        </div>
        <div className={`${ui.field} sm:col-span-2`}>
          <label htmlFor="upi-support" className={ui.label}>Support contact for buyers (optional)</label>
          <input id="upi-support" name="support_contact" maxLength={120} placeholder="WhatsApp +91 98765 43210 or you@example.com" defaultValue={payout?.upi_support_contact ?? ""} className={ui.input} />
          <span className={ui.hint}>Shown to buyers on the payment page and in their e-mails, so they can reach you about a payment.</span>
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <SubmitButton label={ready ? "Save UPI details" : "Turn on UPI payments"} />
          {ready ? <BtnLink href="/app/products/new" variant="ghost">Create an INR product</BtnLink> : null}
        </div>
      </form>
    </div>
  );
}

function StripeSection({ account, country }: { account: ConnectedAccount | null; country: string | null }) {
  if (!account) {
    return (
      <form action="/app/settings/payments/connect" method="post" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="country" value={country ?? "US"} />
        <SubmitButton label="Connect Stripe" pendingLabel="Opening Stripe…" />
      </form>
    );
  }
  return (
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
  );
}

/**
 * Settings section "Payments". The seller's country picks the route: India -> Direct UPI
 * (buyer pays the seller's UPI ID, seller confirms), Stripe-supported -> Stripe Connect,
 * anywhere else -> not available yet.
 */
export default async function PaymentsSettings({ userId, status }: { userId: string; status?: string }) {
  const db = isDbConfigured();
  // Card payments (Stripe Connect) need live Stripe keys (src/lib/featureReadiness.ts); UPI never does.
  const stripeOn = isFeatureReady("card_payments") && db;
  const [payout, account] = await Promise.all([
    db ? getSellerPayout(userId).catch(() => null) : Promise.resolve(null),
    stripeOn ? connectedAccountForPage(userId) : Promise.resolve(null),
  ]);
  const country = payout?.country ?? account?.country ?? null;
  const route = country ? payoutRoute(country) : null;
  const message = status && Object.hasOwn(MESSAGES, status) ? MESSAGES[status] : null;
  const fee = (platformFeeBps() / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
  return (
    <section className={styles.section} aria-labelledby="payments-heading">
      <div className={styles.sectionHeader}>
        <h2 id="payments-heading" className={styles.sectionTitle}>Payments</h2>
      </div>
      <p className={ui.hint}>
        Sell digital products to your followers. In India, buyers pay your UPI ID directly (no Poskoo fee per sale). In Stripe countries, buyers pay by card through Stripe into your own Stripe account and Poskoo keeps a {fee}% fee per sale (Stripe processing fees apply).
      </p>
      {message ? <p role="status" className={`${ui.notice} ${message.warn ? ui.noticeWarn : ""}`}>{message.text}</p> : null}
      {!db ? (
        <p role="status" className={`${ui.notice} ${ui.noticeWarn}`}>
          Payments are not switched on yet. You can already create products; they start selling once payments are switched on.
        </p>
      ) : !route ? (
        <CountryForm current={null} label="Continue" />
      ) : (
        <>
          {route === "upi" ? (
            <UpiSection payout={payout} />
          ) : route === "stripe" ? (
            stripeOn ? (
              <StripeSection account={account} country={country} />
            ) : (
              <p role="status" className={`${ui.notice} ${ui.noticeSoon}`}>
                <span className={`${ui.pill} ${ui.pillSoon}`}>Not switched on yet</span> <strong>{FEATURE_COPY.card_payments.title}.</strong> You can already create products; buy links start taking card payments once card payments are switched on.
              </p>
            )
          ) : (
            <p role="status" className={`${ui.notice} ${ui.noticeWarn}`}>
              Selling isn&apos;t available in your country yet. Stripe can&apos;t pay out there from our platform; we&apos;ll e-mail you when it is. You can still create products and share free lead magnets.
            </p>
          )}
          <details className="mt-3">
            <summary className={`${ui.hint} cursor-pointer`}>Change country</summary>
            <div className="mt-2">
              <CountryForm current={country} label="Save country" />
            </div>
          </details>
        </>
      )}
    </section>
  );
}
