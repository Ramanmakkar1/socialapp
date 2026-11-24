// Server only: shared bodies of the /api/<network>/connect and /api/<network>/callback routes.
// One click: connect -> the network's own consent screen -> callback -> the composer opens with the
// new channel selected (and a "connected" toast). Errors go back to Settings with a clear banner.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BRAND } from "@/lib/brand";
import { query } from "@/lib/db";
import { accountLimitError } from "@/lib/planLimits";
import { requirePlanFeature } from "@/lib/planFeatures";
import {
  NetworkAuthError,
  newPkceVerifier,
  oauthCookieName,
  oauthCookieOptions,
  openOAuthFlow,
  randomState,
  sealOAuthFlow,
  type NetworkId,
  type OAuthFlow,
} from "@/lib/networks/common";
import { NETWORKS } from "@/lib/networks/registry";
import { saveNetworkAccount, type SaveAccountInput } from "@/lib/networks/store";
import { DEFAULT_SCHEDULE_DAYS, DEFAULT_SCHEDULE_TIMES } from "@/lib/postingSchedule";
import { requireWorkspaceUser } from "@/lib/workspace";

/**
 * A failed connect: back to the calendar with the Connect dialog open on a plain-words error and a
 * Retry button (ConnectChannelDialog reads ?connect_error=<code>&net=<network>).
 */
export function settingsResultUrl(network: NetworkId, code: string): URL {
  return new URL(`/app/publish?net=${network}&connect_error=${encodeURIComponent(code)}`, BRAND.url);
}

/**
 * A successful connect: the Connect dialog opens on "@handle is connected" with "Create your first
 * post" (composer with that channel selected) and "Connect another channel".
 */
export function connectedUrl(network: NetworkId, handle?: string | null): URL {
  const h = handle ? `&handle=${encodeURIComponent(handle.slice(0, 120))}` : "";
  return new URL(`/app/publish?connected=${network}${h}`, BRAND.url);
}

export async function startOAuth(
  network: NetworkId,
  authorizeUrl: (flow: OAuthFlow) => string | Promise<string>,
  opts: { pkce?: boolean; extra?: Record<string, string> } = {},
): Promise<NextResponse> {
  const user = await requireWorkspaceUser("admin");
  if (!NETWORKS[network].configured()) return NextResponse.redirect(settingsResultUrl(network, "not_configured"));
  if (network === "x" && !(await requirePlanFeature(user.id, "x_posting")).ok) return NextResponse.redirect(settingsResultUrl(network, "plan_required"));
  const flow: OAuthFlow = { state: randomState(), ...(opts.pkce ? { verifier: newPkceVerifier() } : {}), ...(opts.extra ? { extra: opts.extra } : {}) };
  const target = await authorizeUrl(flow);
  const store = await cookies();
  store.set(oauthCookieName(network), sealOAuthFlow(flow), oauthCookieOptions(network));
  return NextResponse.redirect(target);
}

/**
 * Adds the default posting schedule (Mon-Fri 9:00, 12:00, 18:00) for the new channel when the user
 * already has schedules for other channels (same time zone). With no schedule at all, the calendar's
 * ScheduleSeeder seeds every channel in the browser's time zone instead.
 */
export async function seedChannelSchedule(userId: string, platform: NetworkId): Promise<void> {
  try {
    const rows = await query<{ platform: string; timezone: string }>(
      "select platform, timezone from socialapp.posting_schedules where user_id=$1 order by updated_at desc",
      [userId],
    );
    if (rows.length === 0 || rows.some((r) => r.platform === platform)) return;
    await query(
      `insert into socialapp.posting_schedules (user_id, platform, timezone, days, times)
       values ($1, $2, $3, $4::int[], $5::text[]) on conflict (user_id, platform) do nothing`,
      [userId, platform, rows[0].timezone || "UTC", DEFAULT_SCHEDULE_DAYS, DEFAULT_SCHEDULE_TIMES],
    );
  } catch {
    // A missing schedule never blocks connecting.
  }
}

/** Plan limit + ownership check, then store the account. Returns where to send the user. */
export async function completeConnect(userId: string, network: NetworkId, input: SaveAccountInput): Promise<URL> {
  if (!input.externalId) return settingsResultUrl(network, "error");
  if (await accountLimitError(userId, { kind: "social", platform: network, externalId: input.externalId })) {
    return settingsResultUrl(network, "limit");
  }
  const saved = await saveNetworkAccount(userId, network, input);
  if (saved === "taken") return settingsResultUrl(network, "taken");
  await seedChannelSchedule(userId, network);
  return connectedUrl(network, input.username);
}

export async function finishOAuth(
  request: Request,
  network: NetworkId,
  connect: (code: string, flow: OAuthFlow) => Promise<SaveAccountInput>,
  /** Optional next step after a successful connect (LinkedIn Pages: the page picker). */
  next?: (input: SaveAccountInput, done: URL) => URL,
  /** Query parameter holding the code (OAuth 1.0a: "oauth_verifier"). */
  codeParam = "code",
): Promise<NextResponse> {
  // Outside the try so the /login redirect is not swallowed.
  const user = await requireWorkspaceUser("admin");
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get(codeParam);
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const store = await cookies();
    const flow = openOAuthFlow(store.get(oauthCookieName(network))?.value);
    store.delete({ name: oauthCookieName(network), path: `/api/${network}` });
    if (error) return NextResponse.redirect(settingsResultUrl(network, error === "access_denied" || error === "user_cancelled" ? "declined" : "error"));
    if (!code || !state || !flow || state !== flow.state) return NextResponse.redirect(settingsResultUrl(network, "state_error"));
    const input = await connect(code, flow);
    const done = await completeConnect(user.id, network, input);
    return NextResponse.redirect(next && done.searchParams.get("connected") === network ? next(input, done) : done);
  } catch (err) {
    console.error(`${network} callback failed`, err instanceof NetworkAuthError ? err.reason : "unexpected");
    return NextResponse.redirect(settingsResultUrl(network, err instanceof NetworkAuthError && err.reason === "instance_unreachable" ? "instance_unreachable" : "error"));
  }
}
