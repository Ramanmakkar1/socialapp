"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { readDeliveryFields, readRuleIds } from "@/lib/digitalDelivery";
import { isSupportedCurrency, parsePriceToCents } from "@/lib/payments";
import { deleteProduct, saveProduct } from "@/lib/products";

export type FormState = { errors?: string[] } | undefined;

export async function saveProductAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = typeof form.get("id") === "string" && form.get("id") ? String(form.get("id")) : null;
  const { values, errors } = readDeliveryFields(form);
  const priceCents = parsePriceToCents(String(form.get("price") ?? ""));
  const currency = String(form.get("currency") ?? "").toLowerCase();
  if (priceCents === null) errors.push("Enter a price like 19 or 19.99.");
  else if (priceCents < 50) errors.push("The lowest price is 0.50.");
  else if (priceCents > 99_999_999) errors.push("That price is too high.");
  if (!isSupportedCurrency(currency)) errors.push("Pick a currency.");
  if (errors.length > 0 || priceCents === null || !isSupportedCurrency(currency)) return { errors };
  let saved: { id: string } | null;
  try {
    saved = await saveProduct(user.id, id, { ...values, priceCents, currency, active: form.get("active") === "on" }, readRuleIds(form));
  } catch (err) {
    console.error("saveProduct failed for user", user.id, err instanceof Error ? err.message : err);
    return { errors: ["Could not save the product. Please try again."] };
  }
  if (!saved) return { errors: ["This product no longer exists."] };
  revalidatePath("/app/products");
  redirect(`/app/products/${saved.id}?saved=1`);
}

export async function deleteProductAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(form.get("id") ?? "");
  try {
    await deleteProduct(user.id, id);
  } catch (err) {
    console.error("deleteProduct failed for user", user.id, err instanceof Error ? err.message : err);
    redirect(`/app/products/${id}?error=delete`);
  }
  revalidatePath("/app/products");
  redirect("/app/products?deleted=1");
}
