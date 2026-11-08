import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import {
  YOUTUBE_COOKIE,
  YOUTUBE_COOKIE_MAX_AGE_S,
  isYouTubeConfigured,
  newYouTubeFlow,
  sealFlow,
  youtubeAuthorizeUrl,
} from "@/lib/youtubeAuth";

export async function GET() {
  await requireUser();
  if (!isYouTubeConfigured()) {
    return NextResponse.redirect(new URL("/app/settings?yt=not_configured", BRAND.url));
  }
  const flow = newYouTubeFlow();
  const store = await cookies();
  store.set(YOUTUBE_COOKIE, sealFlow(flow), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/youtube",
    maxAge: YOUTUBE_COOKIE_MAX_AGE_S,
  });
  return NextResponse.redirect(youtubeAuthorizeUrl(flow));
}
