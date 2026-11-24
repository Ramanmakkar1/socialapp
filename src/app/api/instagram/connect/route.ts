import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BRAND } from "@/lib/brand";
import { authorizeUrl, isIgConfigured } from "@/lib/instagram";
import { isMetaLoginConfigured, metaAuthorizeUrl, signState } from "@/lib/metaLogin";
import { requireWorkspaceUser } from "@/lib/workspace";

// ?via=instagram uses Instagram Login when it is configured; anything else (or ?via=facebook) uses
// Facebook Login for Business when that is configured (the Connect dialog offers both).
export async function GET(request: Request) {
  await requireWorkspaceUser("admin");
  const via = new URL(request.url).searchParams.get("via");
  const preferInstagram = via === "instagram" && isIgConfigured();
  if (isMetaLoginConfigured() && !preferInstagram) {
    const nonce = randomBytes(16).toString("hex");
    const store = await cookies();
    store.set("ig_oauth_state", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/instagram",
      maxAge: 600,
    });
    store.delete({ name: "ig_flow", path: "/api/instagram" });
    return NextResponse.redirect(metaAuthorizeUrl(signState(nonce)));
  }
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
  const flowCookie = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/api/instagram", maxAge: 600 };
  if (isMetaLoginConfigured()) store.set("ig_flow", "instagram", flowCookie);
  else store.delete({ name: "ig_flow", path: "/api/instagram" });
  return NextResponse.redirect(authorizeUrl(state));
}
