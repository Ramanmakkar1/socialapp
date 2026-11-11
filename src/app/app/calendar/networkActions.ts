"use server";

// Composer data for the newer networks, read live when the network is ticked: TikTok creator info
// (TikTok requires it to be shown and used before every post) and the user's Pinterest boards.
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { NetworkAuthError } from "@/lib/networks/common";
import { listPinterestBoards, type PinterestBoard } from "@/lib/networks/pinterest";
import { ensureFreshAccount } from "@/lib/networks/publish";
import { loadActiveAccount, markAccountExpired } from "@/lib/networks/store";
import { queryCreatorInfo, type TikTokCreatorInfo } from "@/lib/networks/tiktok";

export type TikTokCreatorResult = { ok: true; info: TikTokCreatorInfo } | { ok: false; error: string };

export async function tiktokCreatorInfoAction(): Promise<TikTokCreatorResult> {
  const user = await requireUser();
  if (!isDbConfigured()) return { ok: false, error: "Not available on this server." };
  try {
    const stored = await loadActiveAccount(user.id, "tiktok");
    if (!stored) return { ok: false, error: "Connect TikTok first." };
    const account = await ensureFreshAccount(stored);
    const r = await queryCreatorInfo(account.accessToken);
    if (!r.ok && r.tokenDead) await markAccountExpired(account.id).catch(() => undefined);
    return r.ok ? r : { ok: false, error: r.error };
  } catch (err) {
    if (err instanceof NetworkAuthError && err.tokenDead) return { ok: false, error: "TikTok access expired. Reconnect TikTok, then try again." };
    return { ok: false, error: "Could not reach TikTok. Try again in a moment." };
  }
}

export type PinterestBoardsResult = { ok: true; boards: PinterestBoard[] } | { ok: false; error: string };

export async function pinterestBoardsAction(): Promise<PinterestBoardsResult> {
  const user = await requireUser();
  if (!isDbConfigured()) return { ok: false, error: "Not available on this server." };
  try {
    const stored = await loadActiveAccount(user.id, "pinterest");
    if (!stored) return { ok: false, error: "Connect Pinterest first." };
    const account = await ensureFreshAccount(stored);
    const r = await listPinterestBoards(account.accessToken);
    if (!r.ok && r.tokenDead) await markAccountExpired(account.id).catch(() => undefined);
    return r.ok ? r : { ok: false, error: r.error };
  } catch {
    return { ok: false, error: "Could not load your Pinterest boards. Try again in a moment." };
  }
}
