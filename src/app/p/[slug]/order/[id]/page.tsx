import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BtnA } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { isDbConfigured } from "@/lib/db";
import { isFeatureReady } from "@/lib/featureReadiness";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import { formatMoney } from "@/lib/money";
import { getUpiOrderForBuyer } from "@/lib/upiOrders";
import styles from "../../../product.module.css";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false }, referrer: "no-referrer" };

type Props = { params: Promise<{ slug: string; id: string }>; searchParams: Promise<{ t?: string }> };

/**
 * Buyer's Direct UPI order page (link in their e-mails; the `t` token is the bearer secret).
 * The product link is shown ONLY once the seller has confirmed the payment.
 */
export default async function UpiOrderPage({ params, searchParams }: Props) {
  const { slug, id } = await params;
  const { t } = await searchParams;
  if (!isDbConfigured() || typeof t !== "string") notFound();
  const order = await getUpiOrderForBuyer(id, t);
  if (!order || (order.slug && order.slug !== slug)) notFound();
  const seller = order.seller_name ?? "The seller";
  // Without a mailer no order e-mail arrives: this page's link is the buyer's only way back.
  const emailReady = isFeatureReady("email");
  const rows: [string, string][] = [
    ["Product", order.product_title],
    ["Amount", formatMoney(order.amount_cents, order.currency)],
    ["UPI reference (UTR)", order.upi_utr ?? "-"],
    ["Order", order.order_ref ?? "-"],
  ];
  return (
    <main className={`${styles.page} ${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <div className={styles.shell}>
        <article className={styles.card}>
          <div className={styles.body}>
            {order.status === "paid" ? (
              <>
                <h1 className={styles.title}>You&apos;re all set!</h1>
                <p className={styles.description}>{seller} confirmed your UPI payment for <strong>{order.product_title}</strong>. Save this page: the button keeps working.</p>
                {order.delivery_url ? (
                  <BtnA href={order.delivery_url} target="_blank" rel="noopener noreferrer">
                    {order.delivery_type === "file" ? "Download" : "Open"} {order.product_title}
                  </BtnA>
                ) : (
                  <p role="status" className={`${ui.notice} ${ui.noticeWarn}`}>This product is no longer available. Contact the seller{order.support_contact ? ` (${order.support_contact})` : ""}.</p>
                )}
              </>
            ) : order.status === "rejected" ? (
              <>
                <h1 className={styles.title}>Payment not confirmed</h1>
                <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>
                  {seller} could not match your UPI payment{order.reject_reason ? `: “${order.reject_reason}”` : "."}
                </p>
                <p className={styles.description}>
                  If money left your account, contact the seller{order.support_contact ? ` (${order.support_contact})` : ""} with your UTR, or ask your bank or UPI app about the transaction.
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Thanks! Payment sent for confirmation</h1>
                <p role="status" className={ui.notice}>
                  {emailReady
                    ? <>{seller} will confirm your payment, usually within a few hours; you&apos;ll get an e-mail with your product. You can also come back to this page.</>
                    : <>{seller} will confirm your payment, usually within a few hours. Your product appears right here once they do.</>}
                </p>
                {!emailReady ? (
                  <p role="status" className={`${ui.notice} ${ui.noticeWarn}`}>
                    <strong>Save this link</strong> (bookmark this page or copy its address). We don&apos;t send order e-mails yet, so this page is how you get back to your product.
                  </p>
                ) : null}
              </>
            )}
            <dl className={styles.statusRows}>
              {rows.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <p className={styles.fine}>
              You paid {seller} directly by UPI. Poskoo doesn&apos;t hold or process this money{order.support_contact ? `; seller contact: ${order.support_contact}` : ""}.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
