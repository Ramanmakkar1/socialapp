// Digital products creators sell to followers (Stripe Connect, direct charges). Server only.
// Tables: products, dm_rules.product_id (migration 035).
import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import { BRAND } from "@/lib/brand";
import { getPool, query } from "@/lib/db";
import type { DeliveryFields } from "@/lib/digitalDelivery";
import { isUuid } from "@/lib/leadMagnets";
import { platformFeeBps, platformFeeCents, type ProductCurrency } from "@/lib/money";
import { getStripe } from "@/lib/payments";
import { payoutRoute } from "@/lib/upi";

export type Product = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  cover_url: string | null;
  delivery_type: "file" | "link";
  delivery_url: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ProductRow = Product & { orders: number; revenue_cents: number };

export type ProductInput = DeliveryFields & { priceCents: number; currency: ProductCurrency; active: boolean };

const COLS = "p.id, p.user_id, p.slug, p.title, p.description, p.price_cents, p.currency, p.cover_url, p.delivery_type, p.delivery_url, p.active, p.created_at, p.updated_at";

export function slugBase(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base.length >= 2 ? base : "product";
}

/** "My Ebook!" -> "my-ebook-k3x9q2" (random suffix keeps public links unguessable and unique). */
export function newSlug(title: string): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const suffix = [...randomBytes(6)].map((b) => alphabet[b % alphabet.length]).join("");
  return `${slugBase(title)}-${suffix}`;
}

export function buyLink(slug: string): string {
  return `${BRAND.url}/p/${slug}`;
}

export async function countProducts(userId: string): Promise<number> {
  const rows = await query<{ n: number }>("select count(*)::int as n from socialapp.products where user_id=$1", [userId]);
  return rows[0]?.n ?? 0;
}

export async function listProducts(userId: string, limit: number, offset: number): Promise<ProductRow[]> {
  return query<ProductRow>(
    `select ${COLS},
       (select count(*)::int from socialapp.orders o where o.product_id = p.id and o.status in ('paid','partially_refunded')) as orders,
       (select coalesce(sum(o.amount_cents - o.amount_refunded_cents), 0)::int from socialapp.orders o
          where o.product_id = p.id and o.status in ('paid','partially_refunded')) as revenue_cents
     from socialapp.products p where p.user_id=$1 order by p.created_at desc, p.id limit $2 offset $3`,
    [userId, limit, offset],
  );
}

export async function getProduct(userId: string, id: string): Promise<(Product & { rule_ids: string[] }) | null> {
  if (!isUuid(id)) return null;
  const rows = await query<Product>(`select ${COLS} from socialapp.products p where p.user_id=$1 and p.id=$2`, [userId, id]);
  const product = rows[0];
  if (!product) return null;
  const rules = await query<{ id: string }>("select id from socialapp.dm_rules where user_id=$1 and product_id=$2", [userId, id]);
  return { ...product, rule_ids: rules.map((r) => r.id) };
}

/** Seller payout fields on the public buy page (Direct UPI for sellers in India, migration 046). */
export type PublicPayout = {
  payout_country: string | null;
  upi_vpa: string | null;
  upi_payee_name: string | null;
  upi_support_contact: string | null;
};

/** Public buy page: the product plus whether (and how) its creator can take payments right now. */
export async function getPublicProduct(slug: string): Promise<(Product & PublicPayout & { stripe_account_id: string | null; charges_enabled: boolean }) | null> {
  if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(slug)) return null;
  const rows = await query<Product & PublicPayout & { stripe_account_id: string | null; charges_enabled: boolean | null }>(
    `select ${COLS}, a.stripe_account_id, a.charges_enabled,
            sp.country as payout_country, sp.upi_vpa, sp.upi_payee_name, sp.upi_support_contact
     from socialapp.products p left join socialapp.stripe_accounts a on a.user_id = p.user_id
     left join socialapp.seller_payouts sp on sp.user_id = p.user_id
     where p.slug=$1`,
    [slug],
  );
  const row = rows[0];
  return row ? { ...row, charges_enabled: Boolean(row.charges_enabled) } : null;
}

/**
 * How this product can be bought right now. "upi": seller in India with a UPI ID and an INR
 * price; "stripe": seller's connected account takes card payments (never for an India seller);
 * null: not purchasable.
 */
export function checkoutMethod(
  p: Pick<Product, "active" | "currency"> & PublicPayout & { stripe_account_id: string | null; charges_enabled: boolean },
  stripeConfigured: boolean,
): "upi" | "stripe" | null {
  if (!p.active) return null;
  if (p.payout_country === "IN") return p.upi_vpa && p.upi_payee_name && p.currency === "inr" ? "upi" : null;
  if (p.currency === "inr") return null;
  return stripeConfigured && p.charges_enabled && p.stripe_account_id ? "stripe" : null;
}

/**
 * True when this product would sell by card but card payments aren't live yet
 * (featureReadiness "card_payments"): the buy page says "Checkout coming soon" instead of
 * "not available". Never for India sellers or INR prices (those are UPI).
 */
export function cardCheckoutSoon(
  p: Pick<Product, "active" | "currency"> & PublicPayout & { stripe_account_id: string | null },
  cardPaymentsReady: boolean,
): boolean {
  if (cardPaymentsReady || !p.active || p.currency === "inr" || p.payout_country === "IN") return false;
  return Boolean(p.stripe_account_id) || payoutRoute(p.payout_country) === "stripe";
}

/** Create or update; points exactly `ruleIds` at the product's buy link. Null when not this user's product. */
export async function saveProduct(userId: string, id: string | null, input: ProductInput, ruleIds: string[]): Promise<{ id: string; slug: string } | null> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    let saved: { id: string; slug: string } | undefined;
    const values = [input.title, input.description, input.priceCents, input.currency, input.coverUrl, input.deliveryType, input.deliveryUrl, input.active];
    if (id) {
      const res = await client.query<{ id: string; slug: string }>(
        `update socialapp.products set title=$3, description=$4, price_cents=$5, currency=$6, cover_url=$7, delivery_type=$8, delivery_url=$9, active=$10, updated_at=now()
         where id=$1 and user_id=$2 returning id, slug`,
        [id, userId, ...values],
      );
      saved = res.rows[0];
    } else {
      for (let attempt = 0; attempt < 3 && !saved; attempt++) {
        const res = await client.query<{ id: string; slug: string }>(
          `insert into socialapp.products (user_id, slug, title, description, price_cents, currency, cover_url, delivery_type, delivery_url, active)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (slug) do nothing returning id, slug`,
          [userId, newSlug(input.title), ...values],
        );
        saved = res.rows[0];
      }
    }
    if (!saved) {
      await client.query("rollback");
      return null;
    }
    await client.query(
      "update socialapp.dm_rules set product_id=null, updated_at=now() where user_id=$1 and product_id=$2 and not (id = any($3::uuid[]))",
      [userId, saved.id, ruleIds],
    );
    if (ruleIds.length > 0) {
      await client.query(
        "update socialapp.dm_rules set product_id=$2, lead_magnet_id=null, link_url=$3, updated_at=now() where user_id=$1 and id = any($4::uuid[])",
        [userId, saved.id, buyLink(saved.slug), ruleIds],
      );
    }
    await client.query("commit");
    return saved;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteProduct(userId: string, id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  // Orders keep their row (product_id set null, product_title snapshot stays).
  const rows = await query<{ id: string }>("delete from socialapp.products where id=$1 and user_id=$2 returning id", [id, userId]);
  return rows.length > 0;
}

/**
 * Checkout Session parameters for a DIRECT charge. The session is created ON the creator's
 * connected account (see createCheckoutUrl: Stripe-Context header), so the creator is the
 * merchant of record and Stripe takes its processing fee from them (fees_collector "stripe").
 * application_fee_amount (PLATFORM_FEE_BPS, default 3%) is Poskoo's share only; Stripe moves it
 * to the platform. No transfer_data / on_behalf_of: those are destination-charge fields.
 * Pure, so the fee is unit tested.
 */
export function checkoutSessionParams(
  product: Pick<Product, "id" | "user_id" | "slug" | "title" | "description" | "price_cents" | "currency" | "cover_url">,
  bps: number = platformFeeBps(),
): Stripe.Checkout.SessionCreateParams {
  const fee = platformFeeCents(product.price_cents, bps);
  const metadata = {
    poskoo_product_id: product.id,
    poskoo_seller_user_id: product.user_id,
    poskoo_fee_cents: String(fee),
  };
  return {
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency,
          unit_amount: product.price_cents,
          product_data: {
            name: product.title,
            ...(product.description ? { description: product.description.slice(0, 500) } : {}),
            ...(product.cover_url ? { images: [product.cover_url] } : {}),
          },
        },
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee,
      metadata,
    },
    metadata,
    integration_identifier: "poskoo_product_checkout_kdwqzmrt",
    success_url: `${BRAND.url}/p/${product.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BRAND.url}/p/${product.slug}`,
  };
}

/** Creates the Checkout Session on the creator's connected account (direct charge). */
export async function createCheckoutUrl(product: Product, connectedAccountId: string): Promise<string> {
  const session = await getStripe().checkout.sessions.create(checkoutSessionParams(product), { stripeContext: connectedAccountId });
  if (!session.url) throw new Error("Stripe returned no Checkout URL");
  return session.url;
}
