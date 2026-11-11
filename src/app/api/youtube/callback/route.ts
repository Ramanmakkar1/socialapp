import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { accountLimitError } from "@/lib/planLimits";
import { getYouTubeChannel, saveYouTubeChannel } from "@/lib/youtubeAccounts";
import {
  YOUTUBE_COOKIE,
  YouTubeAuthError,
  exchangeYouTubeCode,
  fetchYouTubeChannel,
  openFlow,
} from "@/lib/youtubeAuth";

type BackResult =
  | "connected"
  | "declined"
  | "state_error"
  | "needs_reconnect"
  | "channel_not_found"
  | "not_configured"
  | "limit"
  | "error";

function back(result: BackResult) {
  // Success opens the Connect dialog's "connected" step (ConnectChannelDialog); problems keep the Settings banners.
  if (result === "connected") return NextResponse.redirect(new URL("/app/calendar?connected=youtube", BRAND.url));
  return NextResponse.redirect(new URL(`/app/settings?yt=${result}`, BRAND.url));
}

// YouTubeAuthError reason -> settings banner. exchange_failed maps to the generic
// "error" banner; no_refresh_token (defensive, no longer thrown) asks for a reconnect.
const REASON_TO_BACK: Record<YouTubeAuthError["reason"], BackResult> = {
  exchange_failed: "error",
  no_refresh_token: "needs_reconnect",
  channel_not_found: "channel_not_found",
  not_configured: "not_configured",
};

export async function GET(request: Request) {
  // Outside the try so the /login redirect is not swallowed.
  const user = await requireUser();
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const store = await cookies();
    const raw = store.get(YOUTUBE_COOKIE)?.value;
    store.delete({ name: YOUTUBE_COOKIE, path: "/api/youtube" });
    if (error === "access_denied") return back("declined");
    const flow = openFlow(raw);
    if (error || !code || !state || !flow || state !== flow.state) {
      return back("state_error");
    }
    const { accessToken, refreshToken } = await exchangeYouTubeCode(code, flow);
    const channel = await fetchYouTubeChannel(accessToken);
    // Plan limit: a NEW channel over the limit is refused; reconnecting an existing one works.
    if (await accountLimitError(user.id, { kind: "youtube", channelId: channel.channelId })) return back("limit");
    if (refreshToken === "") {
      // Google omitted the refresh token: keep the one we already have, or ask for a reconnect.
      const existing = await getYouTubeChannel(user.id);
      if (existing) {
        await saveYouTubeChannel(user.id, channel, existing.refreshToken);
        return back("connected");
      }
      return back("needs_reconnect");
    }
    await saveYouTubeChannel(user.id, channel, refreshToken);
    return back("connected");
  } catch (err) {
    if (err instanceof YouTubeAuthError) return back(REASON_TO_BACK[err.reason]);
    console.error("youtube callback failed", "unexpected");
    return back("error");
  }
}
