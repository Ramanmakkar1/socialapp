import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { isStripeConfigured } from "@/lib/payments";
import { checkoutMethod, getPublicProduct } from "@/lib/products";
import { newOrderRef, upiAmount, upiDeepLink, upiNote } from "@/lib/upi";
import { randomBytes } from "node:crypto";
import UpiCheckout from "./UpiCheckout";
import { getBioPage } from "@/lib/bioPage";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import PoskooMark from "@/components/PoskooMark";
import styles from "../product.module.css";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = isDbConfigured() ? await getPublicProduct(slug).catch(() => null) : null;
  if (!product || !product.active) return { title: "Product not found", robots: { index: false, follow: false } };
  return {
    title: product.title,
    description: product.description.slice(0, 160) || `Buy ${product.title}.`,
    robots: { index: false, follow: false },
    openGraph: product.cover_url ? { images: [product.cover_url] } : undefined,
  };
}

export default async function ProductBuyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { error } = await searchParams;
  if (!isDbConfigured()) notFound();
  const product = await getPublicProduct(slug);
  if (!product || !product.active) notFound();
  // Seller's country routes the checkout: India -> Direct UPI, Stripe countries -> Stripe.
  const method = checkoutMethod(product, isStripeConfigured());
  const orderRef = newOrderRef(randomBytes(8));
  const upi =
    method === "upi" && product.upi_vpa && product.upi_payee_name
      ? {
          vpa: product.upi_vpa,
          payeeName: product.upi_payee_name,
          note: upiNote(orderRef, product.title),
        }
      : null;
  // Creator card: only from a published link-in-bio page (never private account data).
  const bio = await getBioPage(product.user_id).catch(() => null);
  const creator = bio?.published ? bio : null;
  const delivery = product.delivery_type === "file" ? "download" : "link";
  return (
    <main className={`${styles.page} ${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <div className={styles.layout}>
        <div className={styles.media}>
          {product.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- creator-supplied external cover URL
            <img src={product.cover_url} alt="" className={styles.cover} />
          ) : (
            <div className={styles.placeholder} aria-hidden="true">
              <PoskooMark size={56} />
              <span>{product.title}</span>
            </div>
          )}
        </div>
        <article className={styles.info}>
          <p className={styles.kind}>Digital {product.delivery_type === "file" ? "download" : "product"}</p>
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.price}>{formatMoney(product.price_cents, product.currency)}</p>
          {product.description ? <p className={styles.description}>{product.description}</p> : null}
          {error ? (
            <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>Checkout could not start. Please try again in a moment.</p>
          ) : null}
          {upi ? (
            <UpiCheckout
              slug={product.slug}
              amountLabel={formatMoney(product.price_cents, product.currency)}
              amountPlain={upiAmount(product.price_cents)}
              payeeName={upi.payeeName}
              vpa={upi.vpa}
              note={upi.note}
              orderRef={orderRef}
              deepLink={upiDeepLink({ vpa: upi.vpa, payeeName: upi.payeeName, amountPaise: product.price_cents, note: upi.note })}
              supportContact={product.upi_support_contact}
            />
          ) : method === "stripe" ? (
            <form action={`/p/${product.slug}/checkout`} method="post">
              <Btn type="submit" className={`w-full ${styles.buy}`}>Buy now · {formatMoney(product.price_cents, product.currency)}</Btn>
            </form>
          ) : (
            <p role="status" className={styles.unavailable}>This product is not available for purchase right now.</p>
          )}
          {upi ? (
            <ul className={styles.trust}>
              <li>Pay with any UPI app: GPay, PhonePe, Paytm, BHIM</li>
              <li>Your {delivery} is e-mailed once the seller confirms your payment</li>
            </ul>
          ) : (
            <ul className={styles.trust}>
              <li>Secure card payment by Stripe</li>
              <li>Instant {delivery} right after paying</li>
              <li>Your {delivery} page keeps working, so bookmark it</li>
            </ul>
          )}
          {creator ? (
            <Link href={`/@${creator.handle}`} className={styles.creator}>
              {creator.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- creator-supplied avatar URL
                <img src={creator.avatar_url} alt="" className={styles.avatar} />
              ) : (
                <span className={styles.avatar} aria-hidden="true">{creator.display_name.slice(0, 1).toUpperCase()}</span>
              )}
              <span>
                <small>Sold by</small>
                <b>{creator.display_name}</b> <span className={styles.handle}>@{creator.handle}</span>
              </span>
            </Link>
          ) : null}
        </article>
      </div>
      <p className={styles.fine}>
        Sold with <Link href="/">{BRAND.name}</Link>
      </p>
    </main>
  );
}
