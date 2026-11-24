import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { NetworkAuthError, oauthCookieName, openOAuthFlow } from "@/lib/networks/common";
import { exchangeGbpCode, listGbpLocations } from "@/lib/networks/gbp";
import { saveGbpLocation, storePendingGbp } from "@/lib/networks/gbpConnect";
import { connectedUrl, seedChannelSchedule, settingsResultUrl } from "@/lib/networks/routes";

// One location: connected right away. Several: the Connect dialog shows the location picker.
export async function GET(request: Request) {
  const user = await requireUser();
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const store = await cookies();
    const flow = openOAuthFlow(store.get(oauthCookieName("gbp"))?.value);
    store.delete({ name: oauthCookieName("gbp"), path: "/api/gbp" });
    if (error) return NextResponse.redirect(settingsResultUrl("gbp", error === "access_denied" ? "declined" : "error"));
    if (!code || !state || !flow || state !== flow.state || !flow.verifier) return NextResponse.redirect(settingsResultUrl("gbp", "state_error"));
    const tokens = await exchangeGbpCode(code, flow.verifier);
    if (!tokens.refreshToken) return NextResponse.redirect(settingsResultUrl("gbp", "declined"));
    const locations = await listGbpLocations(tokens.accessToken);
    if (locations.length === 1) {
      const r = await saveGbpLocation(user.id, locations[0], tokens);
      if (r !== "ok") return NextResponse.redirect(settingsResultUrl("gbp", r));
      await seedChannelSchedule(user.id, "gbp");
      return NextResponse.redirect(connectedUrl("gbp", locations[0].title));
    }
    await storePendingGbp(user.id, tokens);
    return NextResponse.redirect(new URL("/app/publish?connect_pick=gbp", BRAND.url));
  } catch (err) {
    const reason = err instanceof NetworkAuthError ? err.reason : "unexpected";
    console.error("gbp callback failed", reason);
    const code = reason === "gbp_pending" || reason === "no_locations" ? reason : "error";
    return NextResponse.redirect(settingsResultUrl("gbp", code));
  }
}
