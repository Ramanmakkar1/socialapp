import Link from "next/link";
import { Package, Plus } from "lucide-react";
import EmptyState from "../EmptyState";
import TablePager from "@/components/commerce/TablePager";
import styles from "@/components/commerce/commerce.module.css";
import { readPaging } from "@/components/commerce/pager";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { isStripeConfigured } from "@/lib/payments";
import { countProducts, listProducts, type ProductRow } from "@/lib/products";
import { connectedAccountForPage, type ConnectedAccount } from "@/lib/stripeConnect";
import PaymentsNotice from "./PaymentsNotice";

export const metadata = {
  title: "Products",
  description: "Sell digital products to your followers with Stripe.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const configured = isStripeConfigured();
  let total = 0;
  let products: ProductRow[] = [];
  let account: ConnectedAccount | null = null;
  let failed = false;
  let paging = readPaging(params, 0);
  if (isDbConfigured()) {
    try {
      total = await countProducts(user.id);
      paging = readPaging(params, total);
      products = await listProducts(user.id, paging.perPage, paging.offset);
      if (configured) account = await connectedAccountForPage(user.id);
    } catch (err) {
      console.error("products load failed for user", user.id, err instanceof Error ? err.message : err);
      failed = true;
    }
  }
  const create = <BtnLink href="/app/products/new"><Plus aria-hidden="true" size={18} /> Create product</BtnLink>;
  return (
    <>
      <PageHero icon={<Package width={20} height={20} />}
        eyebrow="Sell to your followers"
        title="Products"
        lede="Sell ebooks, presets, templates and courses. Share the buy link in your bio or let an auto-DM send it."
        action={total > 0 ? create : undefined}
      />
      <PaymentsNotice configured={configured} account={account} />
      {params.deleted ? <p role="status" className={`${ui.notice} mt-6`}>Product deleted.</p> : null}
      {failed ? (
        <p role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>Products could not be loaded. Reload to try again.</p>
      ) : total === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          text="Get started by creating your first digital product to sell"
          art="/illustrations/empty-calendar.webp"
          artWidth={1536}
          artHeight={1024}
        >
          {create}
        </EmptyState>
      ) : (
        <div className={`${ui.tableWrap} mt-6`}>
          <table className={`${ui.table} ${styles.wideOnly}`}>
            <thead>
              <tr>
                <th scope="col" className={ui.th}>Product</th>
                <th scope="col" className={`${ui.th} ${styles.num}`}>Price</th>
                <th scope="col" className={ui.th}>Status</th>
                <th scope="col" className={`${ui.th} ${styles.num}`}>Sales</th>
                <th scope="col" className={`${ui.th} ${styles.num}`}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={ui.tr}>
                  <td className={ui.td}>
                    <Link href={`/app/products/${p.id}`} className={styles.titleCell}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- creator-supplied external cover URL */}
                      {p.cover_url ? <img src={p.cover_url} alt="" className={styles.thumb} /> : <span className={styles.thumb} aria-hidden="true" />}
                      <span>
                        <span className={styles.titleText}>{p.title}</span>
                        <span className={styles.subText}>/p/{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={`${ui.td} ${styles.num}`}>{formatMoney(p.price_cents, p.currency)}</td>
                  <td className={ui.td}>
                    <span className={`${ui.pill} ${p.active ? ui.pillMint : ""}`}>{p.active ? "Active" : "Hidden"}</span>
                  </td>
                  <td className={`${ui.td} ${styles.num}`}>{p.orders}</td>
                  <td className={`${ui.td} ${styles.num}`}>{formatMoney(p.revenue_cents, p.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className={`${styles.cards} p-3`}>
            {products.map((p) => (
              <li key={p.id} className={`${ui.card} ${styles.cardItem}`}>
                <Link href={`/app/products/${p.id}`} className={styles.titleText}>{p.title}</Link>
                <dl className={styles.cardDl}>
                  <dt>Price</dt><dd>{formatMoney(p.price_cents, p.currency)}</dd>
                  <dt>Status</dt><dd>{p.active ? "Active" : "Hidden"}</dd>
                  <dt>Sales</dt><dd>{p.orders}</dd>
                  <dt>Revenue</dt><dd>{formatMoney(p.revenue_cents, p.currency)}</dd>
                </dl>
              </li>
            ))}
          </ul>
          <TablePager basePath="/app/products" total={total} page={paging.page} perPage={paging.perPage} label="Products" />
        </div>
      )}
    </>
  );
}
