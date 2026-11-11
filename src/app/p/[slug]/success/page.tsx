import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BtnA } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { isDbConfigured } from "@/lib/db";
import { recordSessionFromSuccessPage } from "@/lib/orders";
import { getStripe, isStripeConfigured } from "@/lib/payments";
import { getPublicProduct } from "@/lib/products";
import styles from "../../product.module.css";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ session_id?: string }> };

/**
 * Thank-you page. The delivery link is shown only for a PAID Checkout Session (retrieved from
 * the creator's connected account, where direct-charge sessions live) that belongs to this product. The order is also recorded here (idempotent with the
 * webhook), so a slow webhook never hides a purchase.
 */
export default async function ProductSuccessPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;
  if (!isDbConfigured() || !isStripeConfigured()) notFound();
  const product = await getPublicProduct(slug);
  if (!product || typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) notFound();
  const accountId = product.stripe_account_id;
  let state: "paid" | "processing" | "invalid" = "invalid";
  try {
    // Direct charge: the session lives on the creator's connected account.
    if (!accountId) throw new Error("product has no connected account");
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {}, { stripeContext: accountId });
    if (session.metadata?.poskoo_product_id === product.id) {
      await recordSessionFromSuccessPage(session, { sellerUserId: product.user_id, accountId });
      state = session.payment_status === "paid" || session.payment_status === "no_payment_required" ? "paid" : "processing";
    }
  } catch (err) {
    console.error("success page session lookup failed", err instanceof Error ? err.message : err);
  }
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <article className={styles.card}>
          <div className={styles.body}>
            {state === "paid" ? (
              <>
                <h1 className={styles.title}>Thank you!</h1>
                <p className={styles.description}>Your payment for <strong>{product.title}</strong> went through. Save this link:</p>
                <BtnA href={product.delivery_url} target="_blank" rel="noopener noreferrer">
                  {product.delivery_type === "file" ? "Download" : "Open"} {product.title}
                </BtnA>
                <p className={styles.fine}>Bookmark this page: the button above keeps working.</p>
              </>
            ) : state === "processing" ? (
              <>
                <h1 className={styles.title}>Payment processing</h1>
                <p role="status" className={`${ui.notice}`}>Your payment is still being confirmed. Reload this page in a few minutes to get your {product.delivery_type === "file" ? "download" : "link"}.</p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>We couldn&apos;t confirm this purchase</h1>
                <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>If you paid, reload in a minute or contact the seller with your Stripe receipt.</p>
              </>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
