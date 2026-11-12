import { Receipt } from "lucide-react";
import EmptyState from "../EmptyState";
import ExportLeadsLink from "../leads/ExportLeadsLink";
import LocalTime from "@/components/LocalTime";
import TablePager from "@/components/commerce/TablePager";
import styles from "@/components/commerce/commerce.module.css";
import { readPaging } from "@/components/commerce/pager";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { ORDER_STATUS_LABEL, countOrders, listOrders, type OrderRow } from "@/lib/orders";
import { isStripeConfigured } from "@/lib/payments";
import { connectedAccountForPage, type ConnectedAccount } from "@/lib/stripeConnect";
import PaymentsNotice from "../products/PaymentsNotice";
import { getSellerPayout, listAwaitingUpi, type AwaitingUpiOrder, type SellerPayout } from "@/lib/upiOrders";
import UpiPending from "./UpiPending";

const UPI_MESSAGES: Record<string, { warn: boolean; text: string }> = {
  paid: { warn: false, text: "Payment confirmed. The buyer is getting their product by e-mail." },
  rejected: { warn: false, text: "Payment rejected. The buyer got your reason by e-mail." },
  reason: { warn: true, text: "Add a short reason (at least 3 characters) so the buyer knows what to do." },
  missing: { warn: true, text: "That order was already confirmed or rejected." },
  error: { warn: true, text: "Could not update the order. Please try again." },
};

export const metadata = {
  title: "Orders",
  description: "Every sale of your digital products, with CSV export.",
};

const GOOD = new Set(["paid"]);

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const configured = isStripeConfigured();
  let total = 0;
  let orders: OrderRow[] = [];
  let account: ConnectedAccount | null = null;
  let payout: SellerPayout | null = null;
  let awaiting: AwaitingUpiOrder[] = [];
  let failed = false;
  let paging = readPaging(params, 0);
  if (isDbConfigured()) {
    try {
      total = await countOrders(user.id);
      paging = readPaging(params, total);
      orders = await listOrders(user.id, paging.perPage, paging.offset);
      if (configured) account = await connectedAccountForPage(user.id);
      [payout, awaiting] = await Promise.all([getSellerPayout(user.id), listAwaitingUpi(user.id)]);
    } catch (err) {
      console.error("orders load failed for user", user.id, err instanceof Error ? err.message : err);
      failed = true;
    }
  }
  return (
    <>
      <PageHero icon={<Receipt width={20} height={20} />}
        eyebrow="Sales"
        title="Orders"
        lede="Every purchase of your products. Card payouts go to your bank through Stripe; UPI payments go straight to you."
        action={total > 0 ? <ExportLeadsLink href="/app/orders/export">{total > 10_000 ? "Export latest 10,000" : "Export CSV"}</ExportLeadsLink> : undefined}
      />
      <PaymentsNotice configured={configured} account={account} payout={payout} />
      {typeof params.upi === "string" && Object.hasOwn(UPI_MESSAGES, params.upi) ? (
        <p role="status" className={`${ui.notice} ${UPI_MESSAGES[params.upi].warn ? ui.noticeWarn : ""} mt-6`}>{UPI_MESSAGES[params.upi].text}</p>
      ) : null}
      <UpiPending orders={awaiting} />
      {failed ? (
        <p role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>Orders could not be loaded. Reload to try again.</p>
      ) : total === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          text="When someone buys one of your products, the order shows up here."
          art="/illustrations/empty-inbox.webp"
          artWidth={1536}
          artHeight={1024}
        >
          <BtnLink href="/app/products">Go to products</BtnLink>
        </EmptyState>
      ) : (
        <div className={`${ui.tableWrap} mt-6`}>
          <table className={`${ui.table} ${styles.wideOnly}`}>
            <thead>
              <tr>
                <th scope="col" className={ui.th}>Date</th>
                <th scope="col" className={ui.th}>Buyer email</th>
                <th scope="col" className={ui.th}>Product</th>
                <th scope="col" className={`${ui.th} ${styles.num}`}>Amount</th>
                <th scope="col" className={`${ui.th} ${styles.num}`}>Fee</th>
                <th scope="col" className={ui.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className={ui.tr}>
                  <td className={ui.td}><LocalTime value={o.created_at} style="medium" fallback="-" /></td>
                  <td className={ui.td}>
                    {o.buyer_email || "—"}
                    {o.payment_method === "upi" ? <span className={`block ${ui.hint}`}>UPI · UTR {o.upi_utr}</span> : null}
                  </td>
                  <td className={ui.td}>{o.product_title}</td>
                  <td className={`${ui.td} ${styles.num}`}>{formatMoney(o.amount_cents, o.currency)}</td>
                  <td className={`${ui.td} ${styles.num}`}>{o.payment_method === "upi" ? "None" : formatMoney(o.fee_cents, o.currency)}</td>
                  <td className={ui.td}>
                    <span className={`${ui.pill} ${GOOD.has(o.status) ? ui.pillMint : o.status === "pending" || o.status === "awaiting_confirmation" ? "" : ui.pillPeach} ${styles.status}`}>
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className={`${styles.cards} p-3`}>
            {orders.map((o) => (
              <li key={o.id} className={`${ui.card} ${styles.cardItem}`}>
                <span className={styles.titleText}>{o.product_title}</span>
                <dl className={styles.cardDl}>
                  <dt>Date</dt><dd><LocalTime value={o.created_at} style="medium" fallback="-" /></dd>
                  <dt>Buyer</dt><dd>{o.buyer_email || "—"}</dd>
                  {o.payment_method === "upi" ? <><dt>UTR</dt><dd>{o.upi_utr}</dd></> : null}
                  <dt>Amount</dt><dd>{formatMoney(o.amount_cents, o.currency)}</dd>
                  <dt>Fee</dt><dd>{o.payment_method === "upi" ? "None (UPI)" : formatMoney(o.fee_cents, o.currency)}</dd>
                  <dt>Status</dt><dd>{ORDER_STATUS_LABEL[o.status] ?? o.status}</dd>
                </dl>
              </li>
            ))}
          </ul>
          <TablePager basePath="/app/orders" total={total} page={paging.page} perPage={paging.perPage} label="Orders" />
        </div>
      )}
    </>
  );
}
