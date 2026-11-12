"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Smartphone } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";
import styles from "../product.module.css";
import { submitUpiOrderAction } from "./upiActions";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`${ui.btn} ${ui.btnLine} ${ui.sm}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked: the value is visible and selectable */
        }
      }}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
      {copied ? "Copied" : "Copy"}
      <span className="sr-only" aria-live="polite">{copied ? `${label} copied` : ""}</span>
    </button>
  );
}

/**
 * Direct UPI checkout: pay the seller's UPI ID from a UPI app (deep link on phones, UPI ID +
 * note to copy on computers), then submit e-mail, name and the 12-digit UTR for the seller to confirm.
 */
export default function UpiCheckout(props: {
  slug: string;
  amountLabel: string;
  amountPlain: string;
  payeeName: string;
  vpa: string;
  note: string;
  orderRef: string;
  deepLink: string;
  supportContact: string | null;
  /** E-mail switched on (src/lib/featureReadiness.ts)? If not, the order page link is how the buyer gets the product. */
  emailReady?: boolean;
}) {
  const [state, action] = useActionState(submitUpiOrderAction, undefined);
  const err = (f: "email" | "name" | "utr") => (state?.field === f ? true : undefined);
  return (
    <div className={styles.upi} id="pay">
      <ol className={styles.upiSteps}>
        <li>
          <p className={styles.upiStepTitle}>Pay {props.amountLabel} to {props.payeeName}</p>
          <a href={props.deepLink} className={`${ui.btn} ${ui.btnDark} w-full ${styles.buy}`}>
            <Smartphone aria-hidden="true" size={18} /> Pay with UPI app · {props.amountLabel}
          </a>
          <p className={`${ui.hint} ${styles.upiDesktop}`}>On a computer? Open any UPI app on your phone and pay this UPI ID:</p>
          <dl className={styles.upiDl}>
            <div><dt>UPI ID</dt><dd><code>{props.vpa}</code><CopyButton value={props.vpa} label="UPI ID" /></dd></div>
            <div><dt>Amount</dt><dd><code>₹{props.amountPlain}</code><CopyButton value={props.amountPlain} label="amount" /></dd></div>
            <div><dt>Note</dt><dd><code>{props.note}</code><CopyButton value={props.note} label="note" /></dd></div>
          </dl>
        </li>
        <li>
          <p className={styles.upiStepTitle}>Tell {props.payeeName} you paid</p>
          <form action={action} className={styles.upiForm}>
            <input type="hidden" name="slug" value={props.slug} />
            <input type="hidden" name="order_ref" value={props.orderRef} />
            {state?.error ? <p role="alert" className={`${ui.notice} ${ui.noticeWarn} m-0`}>{state.error}</p> : null}
            <div className={ui.field}>
              <label htmlFor="upi-email" className={ui.label}>Your e-mail</label>
              <input id="upi-email" name="email" defaultValue={state?.values?.email} type="email" required autoComplete="email" maxLength={254} className={ui.input} aria-invalid={err("email")} placeholder="you@example.com" />
            </div>
            <div className={ui.field}>
              <label htmlFor="upi-name" className={ui.label}>Your name</label>
              <input id="upi-name" name="name" defaultValue={state?.values?.name} required autoComplete="name" maxLength={80} className={ui.input} aria-invalid={err("name")} placeholder="As shown in your UPI app" />
            </div>
            <div className={ui.field}>
              <label htmlFor="upi-utr" className={ui.label}>UPI reference (UTR)</label>
              <input id="upi-utr" name="utr" defaultValue={state?.values?.utr} required inputMode="numeric" autoComplete="off" pattern="[0-9 ]{12,15}" maxLength={15} className={ui.input} aria-invalid={err("utr")} aria-describedby="upi-utr-hint" placeholder="12-digit number" />
              <span id="upi-utr-hint" className={ui.hint}>In your UPI app, open the payment: it&apos;s the 12-digit &quot;UTR&quot; or &quot;UPI Ref. No.&quot;</span>
            </div>
            <SubmitButton label="I've paid, send for confirmation" pendingLabel="Sending…" />
          </form>
        </li>
      </ol>
      <p className={styles.upiDirect}>
        Your payment goes directly to {props.payeeName} by UPI. Poskoo doesn&apos;t hold or process this money, so refunds and payment questions go to the seller{props.supportContact ? <> ({props.supportContact})</> : null}.
        {props.emailReady === false
          ? "The seller confirms your payment, usually within a few hours. The next page is your order page: save its link, because that's where your product appears."
          : "The seller confirms your payment, usually within a few hours, and you'll get an e-mail with your product."}
      </p>
    </div>
  );
}
