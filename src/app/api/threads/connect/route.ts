import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { isThreadsConfigured, threadsAuthorizeUrl } from "@/lib/threadsAuth";

export async function GET() {
  await requireUser();
  if (!isThreadsConfigured()) {
    return NextResponse.redirect(new URL("/app/settings?threads=not_configured", BRAND.url));
  }
  const state = randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("threads_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/threads",
    maxAge: 600,
  });
  return NextResponse.redirect(threadsAuthorizeUrl(state));
}
