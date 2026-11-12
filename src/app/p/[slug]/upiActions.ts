"use server";

// Direct UPI checkout submit (public buy page). The buyer already paid the seller's UPI ID in
// their UPI app; this records the claim as 'awaiting_confirmation'. Nothing is delivered until
// the seller confirms it in Orders. Amount/currency/payee come from the DB, never the form.
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/db";
import { checkoutMethod, getPublicProduct } from "@/lib/products";
import { clientIp, rateLimit, tooManyMessage } from "@/lib/rateLimit";
import { ORDER_REF_RE, newOrderRef, normalizeBuyerName, normalizeEmail, normalizeUtr } from "@/lib/upi";
import { createUpiOrder } from "@/lib/upiOrders";

type Values = { email: string; name: string; utr: string };
/** `values` echo what the buyer typed, so a validation error doesn't wipe the form (React resets it after an action). */
export type UpiSubmitState = { error?: string; field?: "email" | "name" | "utr"; values?: Values } | undefined;

export async function submitUpiOrderAction(_prev: UpiSubmitState, form: FormData): Promise<UpiSubmitState> {
  const values: Values = {
    email: String(form.get("email") ?? "").slice(0, 254),
    name: String(form.get("name") ?? "").slice(0, 80),
    utr: String(form.get("utr") ?? "").slice(0, 20),
  };
  const res = await submit(form);
  return res ? { ...res, values } : res;
}

async function submit(form: FormData): Promise<UpiSubmitState> {
  const slug = String(form.get("slug") ?? "");
  if (!isDbConfigured()) return { error: "Payments are not available right now." };
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!email) return { error: "Enter a valid e-mail address so we can send you the product.", field: "email" };
  const name = normalizeBuyerName(String(form.get("name") ?? ""));
  if (!name) return { error: "Enter your name as it appears in your UPI app.", field: "name" };
  const utr = normalizeUtr(String(form.get("utr") ?? ""));
  if (!utr) return { error: "The UPI reference (UTR) is the 12-digit number in your UPI app's payment details.", field: "utr" };
  const rawRef = String(form.get("order_ref") ?? "");
  const orderRef = ORDER_REF_RE.test(rawRef) ? rawRef : newOrderRef(randomBytes(8));

  const product = await getPublicProduct(slug).catch(() => null);
  if (!product || checkoutMethod(product, false) !== "upi") return { error: "This product can't be bought by UPI right now." };

  const ip = clientIp(await headers());
  for (const [key, limit] of [[`upi:${ip}:${product.id}`, 5], [`upi:${ip}`, 15]] as const) {
    const limited = rateLimit(key, limit, 60 * 60 * 1000);
    if (!limited.ok) return { error: tooManyMessage(limited.retryAfterMs) };
  }

  let orderId: string;
  let token: string;
  try {
    const res = await createUpiOrder({ productId: product.id, sellerUserId: product.user_id, buyerEmail: email, buyerName: name, utr, orderRef });
    if (!res.ok) {
      return res.reason === "duplicate_utr"
        ? { error: "This UPI reference was already submitted for this seller. If you think that's wrong, contact the seller.", field: "utr" }
        : { error: "This product can't be bought by UPI right now." };
    }
    orderId = res.orderId;
    token = res.accessToken;
  } catch (err) {
    console.error("UPI order submit failed for product", product.id, err instanceof Error ? err.message : err);
    return { error: "We couldn't save your payment details. Please try again." };
  }
  const { inBackground, notifyUpiSubmitted } = await import("@/lib/emailNotify");
  inBackground("upi_submitted", () => notifyUpiSubmitted(orderId));
  redirect(`/p/${product.slug}/order/${orderId}?t=${encodeURIComponent(token)}`);
}
