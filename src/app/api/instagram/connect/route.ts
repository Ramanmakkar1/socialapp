import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { authorizeUrl, isIgConfigured } from "@/lib/instagram";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireUser();
  if (!isIgConfigured()) {
    return NextResponse.redirect(new URL("/app/settings?ig=not_configured", BRAND.url));
  }
  const state = randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("ig_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/instagram",
    maxAge: 600,
  });
  return NextResponse.redirect(authorizeUrl(state));
}
