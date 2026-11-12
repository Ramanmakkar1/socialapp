// Direct UPI orders and seller payout settings. Server only. Tables: seller_payouts, orders
// (payment_method 'upi'), migration 046. Pure rules live in src/lib/upi.ts.
//
// Flow: buyer pays the seller's UPI ID from their UPI app -> submits e-mail, name and the UTR ->
// order 'awaiting_confirmation' (nothing delivered) -> seller confirms (-> 'paid', the buyer
// gets the same receipt + access e-mail as a Stripe sale) or rejects (-> 'rejected', the buyer
// gets the reason). Decisions are a conditional UPDATE on the current status, so a double click
// or two tabs can never deliver twice or flip a decided order.
import { randomBytes } from "node:crypto";
import { query } from "@/lib/db";
import { newOrderRef, nextUpiStatus, type UpiDecision } from "@/lib/upi";

export type SellerPayout = {
  country: string;
  upi_vpa: string | null;
  upi_payee_name: string | null;
  upi_support_contact: string | null;
  updated_at: Date;
};

export async function getSellerPayout(userId: string): Promise<SellerPayout | null> {
  const rows = await query<SellerPayout>(
    "select country, upi_vpa, upi_payee_name, upi_support_contact, updated_at from socialapp.seller_payouts where user_id=$1",
    [userId],
  );
  return rows[0] ?? null;
}

/** Saves the seller's country (and clears UPI details when it is not India). */
export async function saveSellerCountry(userId: string, country: string): Promise<void> {
  await query(
    `insert into socialapp.seller_payouts (user_id, country) values ($1,$2)
     on conflict (user_id) do update set country=excluded.country,
       upi_vpa = case when excluded.country = 'IN' then socialapp.seller_payouts.upi_vpa end,
       upi_payee_name = case when excluded.country = 'IN' then socialapp.seller_payouts.upi_payee_name end,
       upi_support_contact = case when excluded.country = 'IN' then socialapp.seller_payouts.upi_support_contact end,
       updated_at=now()`,
    [userId, country],
  );
}

export async function saveUpiDetails(userId: string, d: { vpa: string; payeeName: string; supportContact: string }): Promise<void> {
  await query(
    `insert into socialapp.seller_payouts (user_id, country, upi_vpa, upi_payee_name, upi_support_contact) values ($1,'IN',$2,$3,$4)
     on conflict (user_id) do update set country='IN', upi_vpa=$2, upi_payee_name=$3, upi_support_contact=$4, updated_at=now()`,
    [userId, d.vpa, d.payeeName, d.supportContact || null],
  );
}

/** Seller is set up for Direct UPI (India + UPI ID + payee name). */
export function upiReady(p: SellerPayout | null): boolean {
  return Boolean(p && p.country === "IN" && p.upi_vpa && p.upi_payee_name);
}

export type CreateUpiOrderResult =
  | { ok: true; orderId: string; accessToken: string }
  | { ok: false; reason: "duplicate_utr" | "unavailable" };

/**
 * Records a buyer's UPI payment claim. The amount, currency and payee VPA are snapshotted from
 * the product/seller at submit time (never from the form). Duplicate UTR for the same seller is
 * refused by a unique index. A clashing order ref is replaced by a fresh one.
 */
export async function createUpiOrder(d: {
  productId: string;
  sellerUserId: string;
  buyerEmail: string;
  buyerName: string;
  utr: string;
  orderRef: string;
}): Promise<CreateUpiOrderResult> {
  const accessToken = randomBytes(24).toString("base64url");
  let ref = d.orderRef;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const rows = await query<{ id: string }>(
        `insert into socialapp.orders
           (user_id, product_id, product_title, payment_method, buyer_email, buyer_name, upi_utr, order_ref, upi_vpa,
            access_token, amount_cents, fee_cents, currency, status)
         select p.user_id, p.id, p.title, 'upi', $3, $4, $5, $6, sp.upi_vpa, $7, p.price_cents, 0, p.currency, 'awaiting_confirmation'
         from socialapp.products p join socialapp.seller_payouts sp on sp.user_id = p.user_id
         where p.id=$1 and p.user_id=$2 and p.active and p.currency='inr' and sp.country='IN' and sp.upi_vpa is not null
         returning id`,
        [d.productId, d.sellerUserId, d.buyerEmail, d.buyerName, d.utr, ref, accessToken],
      );
      if (!rows[0]) return { ok: false, reason: "unavailable" };
      return { ok: true, orderId: rows[0].id, accessToken };
    } catch (err) {
      const e = err as { code?: string; constraint?: string };
      if (e.code === "23505" && e.constraint === "orders_seller_utr_uidx") return { ok: false, reason: "duplicate_utr" };
      if (e.code === "23505" && e.constraint === "orders_order_ref_uidx") {
        ref = newOrderRef(randomBytes(8));
        continue;
      }
      throw err;
    }
  }
  throw new Error("could not allocate an order reference");
}

/**
 * Seller decision on one of THEIR awaiting UPI orders. Returns the new status, or null when the
 * order is not theirs / not UPI / already decided (so nothing is e-mailed twice).
 */
export async function decideUpiOrder(sellerUserId: string, orderId: string, decision: UpiDecision, reason: string | null): Promise<"paid" | "rejected" | null> {
  const target = nextUpiStatus("awaiting_confirmation", decision);
  if (!target) return null;
  const rows = await query<{ status: "paid" | "rejected" }>(
    `update socialapp.orders set status=$3, decided_at=now(), updated_at=now(),
       paid_at = case when $3 = 'paid' then now() else paid_at end,
       reject_reason = case when $3 = 'rejected' then $4 else null end
     where id=$1 and user_id=$2 and payment_method='upi' and status='awaiting_confirmation'
     returning status`,
    [orderId, sellerUserId, target, reason],
  );
  return rows[0]?.status ?? null;
}

export async function countAwaitingUpi(userId: string): Promise<number> {
  const rows = await query<{ n: number }>(
    "select count(*)::int as n from socialapp.orders where user_id=$1 and status='awaiting_confirmation'",
    [userId],
  );
  return rows[0]?.n ?? 0;
}

export type AwaitingUpiOrder = {
  id: string;
  created_at: Date;
  buyer_email: string | null;
  buyer_name: string | null;
  product_title: string;
  amount_cents: number;
  currency: string;
  upi_utr: string;
  order_ref: string;
  upi_vpa: string | null;
};

export async function listAwaitingUpi(userId: string, limit = 50): Promise<AwaitingUpiOrder[]> {
  return query<AwaitingUpiOrder>(
    `select id, created_at, buyer_email, buyer_name, product_title, amount_cents, currency, upi_utr, order_ref, upi_vpa
     from socialapp.orders where user_id=$1 and status='awaiting_confirmation'
     order by created_at asc, id limit $2`,
    [userId, limit],
  );
}

export type BuyerOrderView = {
  id: string;
  status: string;
  product_title: string;
  amount_cents: number;
  currency: string;
  upi_utr: string | null;
  order_ref: string | null;
  reject_reason: string | null;
  created_at: Date;
  slug: string | null;
  delivery_type: "file" | "link" | null;
  delivery_url: string | null;
  seller_name: string | null;
  support_contact: string | null;
};

/** Buyer's status / access page: the order only when id + bearer token match (timing-safe enough: random 192-bit token in the WHERE). */
export async function getUpiOrderForBuyer(orderId: string, token: string): Promise<BuyerOrderView | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const rows = await query<BuyerOrderView>(
    `select o.id, o.status, o.product_title, o.amount_cents, o.currency, o.upi_utr, o.order_ref, o.reject_reason, o.created_at,
            p.slug, p.delivery_type, p.delivery_url, sp.upi_payee_name as seller_name, sp.upi_support_contact as support_contact
     from socialapp.orders o
     left join socialapp.products p on p.id = o.product_id
     left join socialapp.seller_payouts sp on sp.user_id = o.user_id
     where o.id=$1 and o.access_token=$2 and o.payment_method='upi'`,
    [orderId, token],
  );
  return rows[0] ?? null;
}
