import Link from "next/link";
import { notFound } from "next/navigation";
import CopyField from "@/components/commerce/CopyField";
import styles from "@/components/commerce/commerce.module.css";
import SubmitButton from "@/components/ui/SubmitButton";
import { BtnA, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { requireUser } from "@/lib/auth";
import { listRuleOptions } from "@/lib/leadMagnets";
import { centsToInput, formatMoney, platformFeeCents } from "@/lib/money";
import { isStripeConfigured } from "@/lib/payments";
import { buyLink, getProduct } from "@/lib/products";
import { connectedAccountForPage } from "@/lib/stripeConnect";
import { rulePicks } from "../../lead-magnets/rulePicks";
import { deleteProductAction } from "../actions";
import PaymentsNotice from "../PaymentsNotice";
import ProductForm from "../ProductForm";

export const metadata = { title: "Product" };

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const product = await getProduct(user.id, id);
  if (!product) notFound();
  const configured = isStripeConfigured();
  const [rules, account] = await Promise.all([listRuleOptions(user.id), configured ? connectedAccountForPage(user.id) : Promise.resolve(null)]);
  const link = buyLink(product.slug);
  const fee = platformFeeCents(product.price_cents);
  return (
    <>
      <PageHero eyebrow="Product" title={product.title} lede={<Link href="/app/products" className={ui.link}>All products</Link>} art="/landing/card-dm.webp" />
      <PaymentsNotice configured={configured} account={account} />
      {saved ? <p role="status" className={`${ui.notice} mt-6`}>Saved.</p> : null}
      {error ? <p role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>Could not delete it. Please try again.</p> : null}
      <section className={styles.section} aria-labelledby="share-heading">
        <h2 id="share-heading" className={styles.sectionTitle}>Buy link</h2>
        <CopyField id="buy-link" label="Share this link anywhere" value={link} />
        <div className={`${styles.actions} mt-3`}>
          <BtnA href={link} target="_blank" rel="noopener" variant="ghost" size="sm">Open buy page</BtnA>
          <span className={ui.hint}>
            {formatMoney(product.price_cents, product.currency)} per sale · Poskoo fee {formatMoney(fee, product.currency)} · Stripe processing fees apply
          </span>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="edit-heading">
        <h2 id="edit-heading" className={styles.sectionTitle}>Edit</h2>
        <ProductForm
          id={product.id}
          defaults={{ ...product, price: centsToInput(product.price_cents) }}
          rules={rulePicks(rules, { productId: product.id })}
          selectedRules={product.rule_ids}
        />
      </section>
      <section className={styles.section} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.sectionTitle}>Delete</h2>
        <p className={ui.hint}>Past orders stay in Orders. To stop sales but keep the product, untick Active instead.</p>
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <SubmitButton label="Delete product" pendingLabel="Deleting…" variant="line" size="sm" />
        </form>
      </section>
    </>
  );
}
