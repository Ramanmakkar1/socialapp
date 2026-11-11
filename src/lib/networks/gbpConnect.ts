// Server only: Google Business Profile connect. One location connects straight away; several go to
// the Connect dialog's "Select the locations to connect" step. Between the two, the Google tokens wait
// in an encrypted, httpOnly cookie (15 minutes) bound to the user; the location list is re-read live.
import { cookies } from "next/headers";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { accountLimitError, PLAN_LIMITS, planForUser } from "@/lib/planLimits";
import { GBP_SCOPE, listGbpLocations, refreshGbpToken, type GbpLocation } from "@/lib/networks/gbp";
import { seedChannelSchedule } from "@/lib/networks/routes";
import { saveNetworkAccount } from "@/lib/networks/store";
import type { TokenSet } from "@/lib/networks/common";

export const GBP_PICK_COOKIE = "gbp_pick";
const PICK_MAX_AGE_S = 15 * 60;

type Pending = { userId: string; refreshToken: string; accessToken: string; accessExp: number };

export async function storePendingGbp(userId: string, tokens: TokenSet): Promise<void> {
  const pending: Pending = {
    userId,
    refreshToken: tokens.refreshToken ?? "",
    accessToken: tokens.accessToken,
    accessExp: Date.now() + Math.max(0, (tokens.expiresIn ?? 3600) - 120) * 1000,
  };
  const store = await cookies();
  store.set(GBP_PICK_COOKIE, encryptToken(JSON.stringify(pending)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PICK_MAX_AGE_S,
  });
}

async function readPending(userId: string): Promise<Pending | null> {
  const store = await cookies();
  const raw = store.get(GBP_PICK_COOKIE)?.value;
  if (!raw) return null;
  try {
    const p = JSON.parse(decryptToken(raw)) as Pending;
    if (p.userId !== userId || !p.accessToken) return null;
    if (p.accessExp < Date.now() && p.refreshToken) {
      const t = await refreshGbpToken(p.refreshToken);
      p.accessToken = t.accessToken;
      p.accessExp = Date.now() + Math.max(0, (t.expiresIn ?? 3600) - 120) * 1000;
    }
    return p;
  } catch {
    return null;
  }
}

export async function clearPendingGbp(): Promise<void> {
  const store = await cookies();
  store.delete({ name: GBP_PICK_COOKIE, path: "/" });
}

/** Save one location as a channel (plan limit + ownership checked). */
export async function saveGbpLocation(userId: string, loc: GbpLocation, tokens: TokenSet): Promise<"ok" | "limit" | "taken"> {
  if (await accountLimitError(userId, { kind: "social", platform: "gbp", externalId: loc.location })) return "limit";
  return saveNetworkAccount(userId, "gbp", {
    externalId: loc.location,
    username: loc.title,
    tokens,
    scopes: [GBP_SCOPE],
    meta: { account: loc.account, accountName: loc.accountName, address: loc.address },
  });
}

export type GbpPickList = {
  locations: (GbpLocation & { connected: boolean })[];
  /** New locations that still fit the plan (already connected ones are always allowed). */
  slotsLeft: number;
  limit: number;
};

export async function pendingGbpLocations(userId: string): Promise<GbpPickList | null> {
  const p = await readPending(userId);
  if (!p) return null;
  const locations = await listGbpLocations(p.accessToken);
  const rows = await query<{ external_id: string; platform: string; status: string }>(
    "select external_id, platform, status from socialapp.social_accounts where user_id=$1 and status <> 'disconnected'",
    [userId],
  );
  const youtube = await query<{ n: number }>("select count(*)::int as n from socialapp.youtube_channels where user_id=$1 and status <> 'disconnected'", [userId]).catch(() => [{ n: 0 }]);
  const limit = PLAN_LIMITS[await planForUser(userId)].socialAccounts;
  const used = rows.length + (youtube[0]?.n ?? 0);
  const connected = new Set(rows.filter((r) => r.platform === "gbp").map((r) => r.external_id));
  return {
    locations: locations.map((l) => ({ ...l, connected: connected.has(l.location) })),
    slotsLeft: Math.max(0, limit - used),
    limit,
  };
}

/** Connect the chosen locations; returns how many were connected and why others were not. */
export async function connectPendingGbp(userId: string, chosen: string[]): Promise<{ connected: GbpLocation[]; limited: number; taken: number } | null> {
  const p = await readPending(userId);
  if (!p) return null;
  const all = await listGbpLocations(p.accessToken);
  const wanted = all.filter((l) => chosen.includes(l.location));
  const tokens: TokenSet = { accessToken: p.accessToken, refreshToken: p.refreshToken || undefined, expiresIn: Math.max(0, Math.floor((p.accessExp - Date.now()) / 1000)) };
  const out = { connected: [] as GbpLocation[], limited: 0, taken: 0 };
  for (const loc of wanted) {
    const r = await saveGbpLocation(userId, loc, tokens);
    if (r === "ok") out.connected.push(loc);
    else if (r === "limit") out.limited += 1;
    else out.taken += 1;
  }
  if (out.connected.length > 0) await seedChannelSchedule(userId, "gbp");
  await clearPendingGbp();
  return out;
}
