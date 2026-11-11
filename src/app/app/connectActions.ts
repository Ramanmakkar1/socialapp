"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { NetworkAuthError } from "@/lib/networks/common";
import { createBlueskySession, jwtExpiresIn, normalizeHandle, normalizeService } from "@/lib/networks/bluesky";
import { completeConnect, settingsResultUrl } from "@/lib/networks/routes";
import { connectPendingGbp, pendingGbpLocations } from "@/lib/networks/gbpConnect";

export type BlueskyConnectState = { error: string } | null;

/**
 * Bluesky connect (the Connect dialog's handle + app password form). The app password is checked
 * by logging in once, then stored encrypted so expired sessions can be renewed without the user.
 */
export async function connectBlueskyAction(_prev: BlueskyConnectState, formData: FormData): Promise<BlueskyConnectState> {
  const user = await requireUser();
  if (!isDbConfigured()) return { error: "The database is not set up on this server yet." };
  const handle = normalizeHandle(String(formData.get("handle") ?? "")).slice(0, 253);
  const password = String(formData.get("app_password") ?? "").trim().slice(0, 100);
  const service = normalizeService(String(formData.get("service") ?? ""));
  if (!handle) return { error: "Enter your Bluesky handle, e.g. yourname.bsky.social." };
  if (!password) return { error: "Enter an app password." };
  if (!service) return { error: "The hosting provider must be an https address, e.g. https://bsky.social." };
  let target: URL;
  try {
    const session = await createBlueskySession(handle, password, service);
    target = await completeConnect(user.id, "bluesky", {
      externalId: session.did,
      username: session.handle,
      tokens: { accessToken: session.accessJwt, refreshToken: session.refreshJwt, expiresIn: jwtExpiresIn(session.accessJwt) },
      scopes: ["app_password"],
      meta: { service: session.service },
      secret: { appPassword: password },
    });
  } catch (err) {
    if (err instanceof NetworkAuthError) return { error: err.message };
    console.error("bluesky connect failed", "unexpected");
    target = settingsResultUrl("bluesky", "error");
  }
  redirect(`${target.pathname}${target.search}${target.hash}`);
}

export type GbpPickResult =
  | { ok: true; locations: { location: string; title: string; address: string; accountName: string; connected: boolean }[]; slotsLeft: number; limit: number }
  | { ok: false; error: string };

/** The Connect dialog's "Select the locations to connect" list (Google Business Profile, several locations). */
export async function gbpPickListAction(): Promise<GbpPickResult> {
  const user = await requireUser();
  try {
    const list = await pendingGbpLocations(user.id);
    if (!list) return { ok: false, error: "The Google sign-in expired. Connect Google Business Profile again." };
    return { ok: true, ...list };
  } catch (err) {
    return { ok: false, error: err instanceof NetworkAuthError ? err.message : "Could not load your Google Business Profile locations. Try again." };
  }
}

export async function connectGbpLocationsAction(_prev: { error: string } | null, formData: FormData): Promise<{ error: string } | null> {
  const user = await requireUser();
  const chosen = formData.getAll("location").map(String).filter((l) => l.startsWith("locations/")).slice(0, 200);
  if (chosen.length === 0) return { error: "Tick at least one location." };
  let target = "";
  try {
    const r = await connectPendingGbp(user.id, chosen);
    if (!r) return { error: "The Google sign-in expired. Connect Google Business Profile again." };
    if (r.connected.length === 0) return { error: r.limited > 0 ? connectErrorPlan() : "Those locations are already connected to another Poskoo account." };
    const name = r.connected.length === 1 ? r.connected[0].title : `${r.connected.length} locations`;
    target = `/app/calendar?connected=gbp&handle=${encodeURIComponent(name)}`;
  } catch (err) {
    return { error: err instanceof NetworkAuthError ? err.message : "Could not connect those locations. Try again." };
  }
  redirect(target);
}

function connectErrorPlan(): string {
  return "Your plan's connected channels are all in use. Disconnect one in Settings, then try again.";
}
