// Orders for creator products: Stripe webhook handling (idempotent), order recording, listing, CSV.
// Server only. Tables: orders, stripe_events (migration 035).
import type pg from "pg";
import type Stripe from "stripe";
import { getPool, query } from "@/lib/db";
import { csvField, localTimestamp, validTimeZone } from "@/lib/leadsCsv";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded" | "disputed" | "dispute_lost" | "awaiting_confirmation" | "rejected";

export type OrderRow = {
  id: string;
  created_at: Date;
  buyer_email: string | null;
  product_title: string;
  amount_cents: number;
  fee_cents: number;
  amount_refunded_cents: number;
  currency: string;
  status: OrderStatus;
  payment_method: "stripe" | "upi";
  buyer_name: string | null;
  upi_utr: string | null;
  order_ref: string | null;
};

type Db = Pick<pg.PoolClient, "query">;

/** The fields of a Checkout Session we use (structural, so tests can pass plain objects). */
export type SessionLike = {
  id: string;
  mode?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id: string } | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
};

function piId(value: SessionLike["payment_intent"] | Stripe.Charge["payment_intent"]): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Which creator a direct-charge object belongs to: the connected account it lives on + its Poskoo owner. */
export type SellerRef = { sellerUserId: string; accountId: string };

/**
 * Records (or advances) the order for a completed Checkout Session. Idempotent on the session
 * id: replays and the success page calling it again change nothing. A pending order becomes
 * paid/failed; refunded/disputed orders are never moved back. Returns false for sessions that
 * are not Poskoo product sales (no metadata), or whose metadata names a seller/product other
 * than the owner of the connected account the session lives on (direct charges).
 */
export async function recordCheckoutSession(db: Db, session: SessionLike, outcome: "completed" | "async_succeeded" | "async_failed", seller: SellerRef): Promise<boolean> {
  const productId = session.metadata?.poskoo_product_id;
  const sellerId = session.metadata?.poskoo_seller_user_id;
  if (!productId || !sellerId || (session.mode && session.mode !== "payment")) return false;
  if (sellerId !== seller.sellerUserId) return false;
  const products = await db.query<{ id: string; title: string; user_id: string }>(
    "select id, title, user_id from socialapp.products where id=$1",
    [productId],
  );
  const product = products.rows[0];
  if (product && product.user_id !== sellerId) return false;
  const status: OrderStatus =
    outcome === "async_failed" ? "failed" : session.payment_status === "paid" || session.payment_status === "no_payment_required" ? "paid" : "pending";
  const fee = Number(session.metadata?.poskoo_fee_cents ?? 0);
  await db.query(
    `insert into socialapp.orders
       (user_id, product_id, product_title, stripe_checkout_session_id, stripe_payment_intent_id, buyer_email,
        amount_cents, fee_cents, currency, status, paid_at, stripe_account_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, case when $10 = 'paid' then now() end, $11)
     on conflict (stripe_checkout_session_id) do update set
       stripe_payment_intent_id = coalesce(socialapp.orders.stripe_payment_intent_id, excluded.stripe_payment_intent_id),
       stripe_account_id = coalesce(socialapp.orders.stripe_account_id, excluded.stripe_account_id),
       buyer_email = coalesce(socialapp.orders.buyer_email, excluded.buyer_email),
       status = case when socialapp.orders.status = 'pending' then excluded.status else socialapp.orders.status end,
       paid_at = case when socialapp.orders.status = 'pending' and excluded.status = 'paid' then now() else socialapp.orders.paid_at end,
       updated_at = now()`,
    [
      sellerId,
      product ? product.id : null,
      product?.title ?? "Deleted product",
      session.id,
      piId(session.payment_intent),
      session.customer_details?.email ?? session.customer_email ?? null,
      session.amount_total ?? 0,
      Number.isFinite(fee) && fee >= 0 ? Math.floor(fee) : 0,
      (session.currency ?? "usd").toLowerCase(),
      status,
      seller.accountId,
    ],
  );
  return true;
}

/** charge.refunded: full or partial refund of an order (matched by PaymentIntent, scoped to the seller). */
async function recordRefund(db: Db, charge: Pick<Stripe.Charge, "payment_intent" | "amount" | "amount_refunded">, seller: SellerRef): Promise<void> {
  const pi = piId(charge.payment_intent);
  if (!pi) return;
  const status: OrderStatus = charge.amount_refunded >= charge.amount ? "refunded" : "partially_refunded";
  await db.query(
    `update socialapp.orders set amount_refunded_cents=$2, status=case when status in ('disputed','dispute_lost') then status else $3 end, updated_at=now()
     where stripe_payment_intent_id=$1 and user_id=$4`,
    [pi, charge.amount_refunded, status, seller.sellerUserId],
  );
}

async function recordDispute(db: Db, dispute: Pick<Stripe.Dispute, "payment_intent" | "status">, closed: boolean, seller: SellerRef): Promise<void> {
  const pi = piId(dispute.payment_intent);
  if (!pi) return;
  let status: OrderStatus = "disputed";
  if (closed) status = dispute.status === "lost" ? "dispute_lost" : "paid";
  await db.query("update socialapp.orders set status=$2, updated_at=now() where stripe_payment_intent_id=$1 and user_id=$3", [pi, status, seller.sellerUserId]);
}

export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
] as const;

/**
 * Applies one verified Stripe event exactly once. Direct charges live on the creators'
 * connected accounts, so these events arrive on a Connect ("Connected accounts") webhook
 * endpoint with `event.account` (or `context`) = the connected account id; the creator is
 * looked up from that id. Events without an account (platform's own) or for an unknown
 * account are "ignored". The event id is inserted into stripe_events in the same transaction
 * as its effects: a duplicate delivery is a no-op ("duplicate"), and a failure rolls both
 * back so Stripe's retry processes it again.
 */
export async function handleStripeEvent(
  event: Pick<Stripe.Event, "id" | "type" | "data"> & { account?: string | null; context?: string | null },
): Promise<"processed" | "duplicate" | "ignored"> {
  if (!(HANDLED_EVENTS as readonly string[]).includes(event.type)) return "ignored";
  const accountId = event.account || event.context || null;
  if (!accountId) return "ignored";
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const fresh = await client.query(
      "insert into socialapp.stripe_events (id, type) values ($1, $2) on conflict (id) do nothing returning id",
      [event.id, event.type],
    );
    if (fresh.rows.length === 0) {
      await client.query("commit");
      return "duplicate";
    }
    const owners = await client.query<{ user_id: string }>(
      "select user_id from socialapp.stripe_accounts where stripe_account_id=$1",
      [accountId],
    );
    const owner = owners.rows[0];
    if (!owner) {
      await client.query("commit");
      return "ignored";
    }
    const seller: SellerRef = { sellerUserId: owner.user_id, accountId };
    const object = event.data.object as unknown;
    switch (event.type) {
      case "checkout.session.completed":
        await recordCheckoutSession(client, object as SessionLike, "completed", seller);
        break;
      case "checkout.session.async_payment_succeeded":
        await recordCheckoutSession(client, object as SessionLike, "async_succeeded", seller);
        break;
      case "checkout.session.async_payment_failed":
        await recordCheckoutSession(client, object as SessionLike, "async_failed", seller);
        break;
      case "charge.refunded":
        await recordRefund(client, object as Stripe.Charge, seller);
        break;
      case "charge.dispute.created":
        await recordDispute(client, object as Stripe.Dispute, false, seller);
        break;
      case "charge.dispute.closed":
        await recordDispute(client, object as Stripe.Dispute, true, seller);
        break;
    }
    await client.query("commit");
    if (event.type.startsWith("checkout.session.")) notifyOrderAfterRecord((object as SessionLike).id);
    return "processed";
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Success page: records the order from the session retrieved on the creator's connected
 * account (idempotent), so a late webhook never hides the purchase.
 */
export async function recordSessionFromSuccessPage(session: SessionLike, seller: SellerRef): Promise<void> {
  const client = await getPool().connect();
  try {
    await recordCheckoutSession(client, session, "completed", seller);
  } finally {
    client.release();
  }
  notifyOrderAfterRecord(session.id);
}

/**
 * Post-record hook: e-mails the creator ("new order") and the buyer (receipt with the download
 * link) once the order is paid. Runs after the response, once per session (email_sends), never throws.
 */
function notifyOrderAfterRecord(checkoutSessionId: string): void {
  void import("@/lib/emailNotify").then((m) => m.inBackground("order", () => m.notifyOrderPaid(checkoutSessionId))).catch(() => undefined);
}

export async function countOrders(userId: string): Promise<number> {
  const rows = await query<{ n: number }>("select count(*)::int as n from socialapp.orders where user_id=$1", [userId]);
  return rows[0]?.n ?? 0;
}

export async function listOrders(userId: string, limit: number, offset: number): Promise<OrderRow[]> {
  return query<OrderRow>(
    `select id, created_at, buyer_email, product_title, amount_cents, fee_cents, amount_refunded_cents, currency, status,
            payment_method, buyer_name, upi_utr, order_ref
     from socialapp.orders where user_id=$1 order by created_at desc, id limit $2 offset $3`,
    [userId, limit, offset],
  );
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Processing",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partly refunded",
  disputed: "Disputed",
  dispute_lost: "Dispute lost",
  awaiting_confirmation: "Awaiting your confirmation",
  rejected: "Rejected",
};

/** Same conventions as the contacts export: formula-safe, BOM, UTC + optional local time. */
export function ordersCsv(orders: OrderRow[], timeZone?: string | null): string {
  const tz = validTimeZone(timeZone ?? null);
  const header = ["date_utc", "buyer_email", "product", "amount", "platform_fee", "refunded", "currency", "status", "payment_method", "upi_utr"];
  if (tz) header.splice(1, 0, `date_local (${tz})`);
  const money = (cents: number) => (cents / 100).toFixed(2);
  const rows = orders.map((o) => {
    const at = new Date(o.created_at);
    const valid = !Number.isNaN(at.getTime());
    const row = [
      valid ? at.toISOString() : null,
      o.buyer_email,
      o.product_title,
      money(o.amount_cents),
      money(o.fee_cents),
      money(o.amount_refunded_cents),
      o.currency.toUpperCase(),
      ORDER_STATUS_LABEL[o.status] ?? o.status,
      o.payment_method === "upi" ? "UPI (direct)" : "Stripe",
      o.upi_utr,
    ];
    if (tz) row.splice(1, 0, valid ? localTimestamp(at, tz) : null);
    return row;
  });
  return "﻿" + [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n") + "\r\n";
}
