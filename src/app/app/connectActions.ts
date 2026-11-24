"use server";

import { redirect } from "next/navigation";

import { isDbConfigured, query } from "@/lib/db";
import { cleanChannelRequest } from "@/lib/channelStatus";
import { isReminderNetwork, parseReminderChannel } from "@/lib/networks/reminder";
import { isFeatureReady } from "@/lib/featureReadiness";
import { updateAccountMeta } from "@/lib/networks/store";
import { NetworkAuthError } from "@/lib/networks/common";
import { createBlueskySession, jwtExpiresIn, normalizeHandle, normalizeService } from "@/lib/networks/bluesky";
import { completeConnect, settingsResultUrl } from "@/lib/networks/routes";
import { connectPendingGbp, pendingGbpLocations } from "@/lib/networks/gbpConnect";
import { connectTokenNetwork, readTokenFields } from "@/lib/networks/tokenConnect";
import { connectFarcasterSigner, isFarcasterConfigured } from "@/lib/networks/apps";
import { isTokenNetwork, TOKEN_NETWORKS } from "@/lib/networks/tokenNetworks";
import { requireWorkspaceUser } from "@/lib/workspace";

export type BlueskyConnectState = { error: string } | null;

/**
 * Bluesky connect (the Connect dialog's handle + app password form). The app password is checked
 * by logging in once, then stored encrypted so expired sessions can be renewed without the user.
 */
export async function connectBlueskyAction(_prev: BlueskyConnectState, formData: FormData): Promise<BlueskyConnectState> {
  const user = await requireWorkspaceUser("admin");
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

export type TokenConnectState = { error: string } | null;

/**
 * Token networks (Telegram, Discord, Matrix, WordPress, ...): the Connect dialog's generic form.
 * The credentials are checked against the network once, then stored encrypted like OAuth tokens.
 */
export async function connectTokenNetworkAction(_prev: TokenConnectState, formData: FormData): Promise<TokenConnectState> {
  const user = await requireWorkspaceUser("admin");
  if (!isDbConfigured()) return { error: "The database is not set up on this server yet." };
  const network = String(formData.get("network") ?? "");
  if (!isTokenNetwork(network)) return { error: "Unknown channel." };
  const read = readTokenFields(network, (name) => String(formData.get(name) ?? ""));
  if ("missing" in read) return { error: `Enter the ${read.missing.toLowerCase()}.` };
  let target: URL;
  try {
    const input = await connectTokenNetwork(network, read.fields);
    target = await completeConnect(user.id, network, input);
  } catch (err) {
    if (err instanceof NetworkAuthError) return { error: err.message };
    console.error(`${network} connect failed`, "unexpected");
    return { error: `Something went wrong while connecting ${TOKEN_NETWORKS[network].label}. Please try again.` };
  }
  redirect(`${target.pathname}${target.search}${target.hash}`);
}

/** Farcaster: the browser's "Sign in with Neynar" result (checked with Neynar before it's stored). */
export async function connectFarcasterAction(signerUuid: string, fid: string): Promise<TokenConnectState> {
  const user = await requireWorkspaceUser("admin");
  if (!isDbConfigured()) return { error: "The database is not set up on this server yet." };
  if (!isFarcasterConfigured()) return { error: "Connecting Farcaster isn't switched on on this server yet." };
  let target: URL;
  try {
    const input = await connectFarcasterSigner(String(signerUuid).slice(0, 64), String(fid).slice(0, 20));
    target = await completeConnect(user.id, "farcaster", input);
  } catch (err) {
    if (err instanceof NetworkAuthError) return { error: err.message };
    console.error("farcaster connect failed", "unexpected");
    return { error: "Something went wrong while connecting Farcaster. Please try again." };
  }
  redirect(`${target.pathname}${target.search}${target.hash}`);
}

export type GbpPickResult =
  | { ok: true; locations: { location: string; title: string; address: string; accountName: string; connected: boolean }[]; slotsLeft: number; limit: number }
  | { ok: false; error: string };

/** The Connect dialog's "Select the locations to connect" list (Google Business Profile, several locations). */
export async function gbpPickListAction(): Promise<GbpPickResult> {
  const user = await requireWorkspaceUser("admin");
  try {
    const list = await pendingGbpLocations(user.id);
    if (!list) return { ok: false, error: "The Google sign-in expired. Connect Google Business Profile again." };
    return { ok: true, ...list };
  } catch (err) {
    return { ok: false, error: err instanceof NetworkAuthError ? err.message : "Could not load your Google Business Profile locations. Try again." };
  }
}

export async function connectGbpLocationsAction(_prev: { error: string } | null, formData: FormData): Promise<{ error: string } | null> {
  const user = await requireWorkspaceUser("admin");
  const chosen = formData.getAll("location").map(String).filter((l) => l.startsWith("locations/")).slice(0, 200);
  if (chosen.length === 0) return { error: "Tick at least one location." };
  let target = "";
  try {
    const r = await connectPendingGbp(user.id, chosen);
    if (!r) return { error: "The Google sign-in expired. Connect Google Business Profile again." };
    if (r.connected.length === 0) return { error: r.limited > 0 ? connectErrorPlan() : "Those locations are already connected to another Poskoo account." };
    const name = r.connected.length === 1 ? r.connected[0].title : `${r.connected.length} locations`;
    target = `/app/publish?connected=gbp&handle=${encodeURIComponent(name)}`;
  } catch (err) {
    return { error: err instanceof NetworkAuthError ? err.message : "Could not connect those locations. Try again." };
  }
  redirect(target);
}

function connectErrorPlan(): string {
  return "Your plan's connected channels are all in use. Disconnect one in Settings, then try again.";
}

// ---- Reminder channels (Instagram personal account, Facebook Group): no OAuth ---------------------

export type ReminderConnectState = { error: string } | null;

/**
 * Adds a reminder channel from the @handle or the group link/name. Counts toward the plan's
 * connected channels like any other (completeConnect -> accountLimitError).
 */
export async function connectReminderAction(_prev: ReminderConnectState, formData: FormData): Promise<ReminderConnectState> {
  const user = await requireWorkspaceUser("admin");
  if (!isDbConfigured()) return { error: "The database is not set up on this server yet." };
  // Reminders are e-mails: without a mailer they would never arrive (src/lib/featureReadiness.ts).
  if (!isFeatureReady("email")) return { error: "Reminder channels are coming soon: e-mail sending isn't switched on yet." };
  const platform = String(formData.get("platform") ?? "");
  if (!isReminderNetwork(platform)) return { error: "Choose Instagram or a Facebook group." };
  const parsed = parseReminderChannel(platform, String(formData.get("target") ?? "").slice(0, 300), String(formData.get("name") ?? ""));
  if ("error" in parsed) return { error: parsed.error };
  let target: URL;
  try {
    target = await completeConnect(user.id, platform, {
      externalId: parsed.externalId,
      // Instagram: the handle without "@" (the sidebar adds it); groups: the group name.
      username: platform === "ig_personal" ? parsed.externalId : parsed.name,
      // No OAuth: a placeholder token keeps the shared account code paths uniform.
      tokens: { accessToken: "reminder" },
      scopes: ["reminder"],
      meta: { openUrl: parsed.openUrl, reminder: true },
    });
  } catch {
    console.error("reminder connect failed", platform);
    return { error: "Could not add that channel. Please try again." };
  }
  redirect(`${target.pathname}${target.search}${target.hash}`);
}

// ---- "Notify me when it's ready" + "Request a channel" (channel_requests, migration 047) ---------

export type ChannelInterestState = { ok: true; message: string } | { ok: false; error: string } | null;

export async function channelInterestAction(_prev: ChannelInterestState, formData: FormData): Promise<ChannelInterestState> {
  const user = await requireWorkspaceUser("admin");
  if (!isDbConfigured()) return { ok: false, error: "The database is not set up on this server yet." };
  const kind = formData.get("kind") === "notify" ? "notify" : "request";
  const clean = cleanChannelRequest(String(formData.get("channel") ?? ""), kind === "request" ? String(formData.get("note") ?? "") : "");
  if (!clean) return { ok: false, error: kind === "request" ? "Tell us which channel you'd like (at least 2 characters)." : "Unknown channel." };
  if (kind === "notify" && !/^[a-z_]{1,40}$/.test(clean.channel)) return { ok: false, error: "Unknown channel." };
  try {
    if (kind === "notify") {
      await query(
        `insert into socialapp.channel_requests (user_id, kind, channel) values ($1, 'notify', $2)
         on conflict (user_id, channel) where kind = 'notify' do nothing`,
        [user.id, clean.channel],
      );
      return { ok: true, message: "You're on the list. We'll let you know as soon as it's ready." };
    }
    // At most 20 requests a day per user, so the table can't be flooded.
    const recent = await query<{ n: number }>(
      "select count(*)::int as n from socialapp.channel_requests where user_id=$1 and kind='request' and created_at > now() - interval '1 day'",
      [user.id],
    );
    if ((recent[0]?.n ?? 0) >= 20) return { ok: false, error: "Thanks, we've got your requests for today." };
    await query("insert into socialapp.channel_requests (user_id, kind, channel, note) values ($1, 'request', $2, $3)", [user.id, clean.channel, clean.note]);
    return { ok: true, message: `Thanks! We've noted your request for ${clean.channel}.` };
  } catch {
    return { ok: false, error: "Could not save that right now. Please try again." };
  }
}

// ---- LinkedIn Pages picker (LINKEDIN_PAGES_ENABLED) ------------------------------------------------

export type LinkedInPagesResult =
  | { ok: true; profile: string; pages: { urn: string; name: string; selected: boolean }[] }
  | { ok: false; error: string };

type OrgRow = { urn?: unknown; name?: unknown };
function orgList(v: unknown): { urn: string; name: string }[] {
  return (Array.isArray(v) ? (v as OrgRow[]) : [])
    .filter((o) => typeof o?.urn === "string" && o.urn.startsWith("urn:li:organization:"))
    .map((o) => ({ urn: String(o.urn), name: typeof o.name === "string" && o.name ? o.name : String(o.urn).split(":").pop() ?? "" }));
}

async function linkedinAccountMeta(userId: string): Promise<{ id: string; username: string | null; meta: Record<string, unknown> } | null> {
  const rows = await query<{ id: string; username: string | null; meta: Record<string, unknown> | null }>(
    "select id, username, meta from socialapp.social_accounts where user_id=$1 and platform='linkedin' and status='active' order by created_at limit 1",
    [userId],
  );
  return rows[0] ? { id: rows[0].id, username: rows[0].username, meta: rows[0].meta ?? {} } : null;
}

export async function linkedinPagesListAction(): Promise<LinkedInPagesResult> {
  const user = await requireWorkspaceUser("admin");
  try {
    const acc = await linkedinAccountMeta(user.id);
    if (!acc) return { ok: false, error: "Connect LinkedIn first." };
    const chosen = new Set(orgList(acc.meta.orgs).map((o) => o.urn));
    const available = orgList(acc.meta.orgsAvailable);
    if (available.length === 0) return { ok: false, error: "We didn't find a LinkedIn Page you administer. Ask a Page admin to make you an Administrator or Content admin, then reconnect." };
    // Nothing chosen yet (fresh connect): every Page starts ticked, like the Google locations picker.
    return { ok: true, profile: acc.username ?? "your profile", pages: available.map((o) => ({ ...o, selected: chosen.size === 0 || chosen.has(o.urn) })) };
  } catch {
    return { ok: false, error: "Could not load your LinkedIn Pages. Try again." };
  }
}

export async function saveLinkedInPagesAction(_prev: { error: string } | null, formData: FormData): Promise<{ error: string } | null> {
  const user = await requireWorkspaceUser("admin");
  let target = "";
  try {
    const acc = await linkedinAccountMeta(user.id);
    if (!acc) return { error: "Connect LinkedIn first." };
    const wanted = new Set(formData.getAll("page").map(String));
    const orgs = orgList(acc.meta.orgsAvailable).filter((o) => wanted.has(o.urn));
    await updateAccountMeta(acc.id, { orgs });
    const name = orgs.length === 0 ? acc.username ?? "LinkedIn" : orgs.length === 1 ? orgs[0].name : `${orgs.length} LinkedIn Pages`;
    target = `/app/publish?connected=linkedin&handle=${encodeURIComponent(name)}`;
  } catch {
    return { error: "Could not save your Pages. Try again." };
  }
  redirect(target);
}
