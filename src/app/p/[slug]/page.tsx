import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { isStripeConfigured } from "@/lib/payments";
import { getPublicProduct } from "@/lib/products";
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
  const canBuy = isStripeConfigured() && product.charges_enabled && Boolean(product.stripe_account_id);
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <article className={styles.card}>
          {/* eslint-disable-next-line @next/next/no-img-element -- creator-supplied external cover URL */}
          {product.cover_url ? <img src={product.cover_url} alt="" className={styles.cover} /> : null}
          <div className={styles.body}>
            <h1 className={styles.title}>{product.title}</h1>
            <p className={styles.price}>{formatMoney(product.price_cents, product.currency)}</p>
            {product.description ? <p className={styles.description}>{product.description}</p> : null}
            {error ? (
              <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>Checkout could not start. Please try again in a moment.</p>
            ) : null}
            {canBuy ? (
              <form action={`/p/${product.slug}/checkout`} method="post">
                <Btn type="submit" className="w-full">Buy now</Btn>
              </form>
            ) : (
              <p role="status" className={`${ui.notice} ${ui.noticeWarn}`}>This product is not available for purchase right now.</p>
            )}
            <p className={styles.fine}>Secure card payment by Stripe. You get the {product.delivery_type === "file" ? "download" : "link"} right after paying.</p>
          </div>
        </article>
        <p className={styles.fine}>
          Sold with <Link href="/">{BRAND.name}</Link>
        </p>
      </div>
    </main>
  );
}
