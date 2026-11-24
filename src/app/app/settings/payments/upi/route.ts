// Saves the seller's Direct UPI details (India): UPI ID, payee display name, optional support contact.
import { NextResponse } from "next/server";

import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { normalizePayeeName, normalizeSupportContact, normalizeVpa } from "@/lib/upi";
import { saveUpiDetails } from "@/lib/upiOrders";
import { getWorkspaceUserAtLeast } from "@/lib/workspace";

const back = (status: string) => NextResponse.redirect(new URL(`/app/settings?payments=${status}#payments-heading`, BRAND.url), 303);

export async function POST(request: Request) {
  const user = await getWorkspaceUserAtLeast("owner");
  if (!user) return NextResponse.redirect(new URL("/login", BRAND.url), 303);
  if (!isDbConfigured()) return back("not_configured");
  const form = await request.formData().catch(() => null);
  const vpa = normalizeVpa(String(form?.get("vpa") ?? ""));
  const payeeName = normalizePayeeName(String(form?.get("payee_name") ?? ""));
  if (!vpa) return back("upi_bad_vpa");
  if (!payeeName) return back("upi_bad_name");
  try {
    await saveUpiDetails(user.id, { vpa, payeeName, supportContact: normalizeSupportContact(String(form?.get("support_contact") ?? "")) });
  } catch (err) {
    console.error("save UPI details failed for user", user.id, err instanceof Error ? err.message : err);
    return back("upi_error");
  }
  return back("upi_saved");
}
