import { Smartphone } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";
import { formatMoney } from "@/lib/money";
import type { AwaitingUpiOrder } from "@/lib/upiOrders";
import { decideUpiOrderAction } from "./actions";
import styles from "./upi.module.css";

/** Direct UPI orders waiting for the seller to check the UTR in their bank / UPI app. */
export default function UpiPending({ orders }: { orders: AwaitingUpiOrder[] }) {
  if (orders.length === 0) return null;
  return (
    <section className={`${ui.card} ${styles.box} mt-6`} aria-labelledby="upi-pending-heading">
      <h2 id="upi-pending-heading" className={styles.heading}>
        <Smartphone aria-hidden="true" size={18} /> UPI payments to confirm
        <span className={styles.count}>{orders.length}</span>
      </h2>
      <p className={ui.hint}>
        Open your bank or UPI app and find a payment with this UTR and amount. Confirm only when it&apos;s there: the buyer then gets their product by e-mail. Never confirm on a screenshot alone.
      </p>
      <ul className={styles.list}>
        {orders.map((o) => (
          <li key={o.id} className={styles.item}>
            <dl className={styles.dl}>
              <div><dt>UTR</dt><dd className={styles.utr}>{o.upi_utr}</dd></div>
              <div><dt>Amount</dt><dd>{formatMoney(o.amount_cents, o.currency)}</dd></div>
              <div><dt>Product</dt><dd>{o.product_title}</dd></div>
              <div><dt>Buyer</dt><dd>{o.buyer_name ? `${o.buyer_name} · ` : ""}{o.buyer_email ?? "-"}</dd></div>
              <div><dt>Order</dt><dd>{o.order_ref}</dd></div>
              <div><dt>Submitted</dt><dd><LocalTime value={o.created_at} style="medium" fallback="-" /></dd></div>
            </dl>
            <div className={styles.actions}>
              <form action={decideUpiOrderAction}>
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="decision" value="confirm" />
                <SubmitButton label="Confirm payment" pendingLabel="Confirming…" size="sm" />
              </form>
              <details className={styles.reject}>
                <summary className={`${ui.btn} ${ui.btnLine} ${ui.sm}`}>Reject</summary>
                <form action={decideUpiOrderAction} className={styles.rejectForm}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <label htmlFor={`reason-${o.id}`} className={ui.label}>Reason (sent to the buyer)</label>
                  <input id={`reason-${o.id}`} name="reason" required minLength={3} maxLength={300} className={ui.input}
                    defaultValue="No payment with this UTR and amount reached my account." />
                  <SubmitButton label="Reject and e-mail buyer" pendingLabel="Rejecting…" variant="line" size="sm" />
                </form>
              </details>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
