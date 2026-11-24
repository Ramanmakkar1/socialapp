"use server";

import { refresh } from "next/cache";

import { isDbConfigured, query } from "@/lib/db";
import { invalidateIgAccount } from "@/lib/igCached";
import { requireWorkspaceUser } from "@/lib/workspace";

/** "Refresh" on Home / Posts & Reels: expire the cached Instagram reads of the user's accounts and re-render the page. */
export async function refreshInstagramData(): Promise<{ ok: boolean }> {
  const user = await requireWorkspaceUser();
  if (isDbConfigured()) {
    try {
      const rows = await query<{ id: string }>(
        "select id from socialapp.social_accounts where user_id=$1 and platform='instagram'",
        [user.id],
      );
      for (const r of rows) invalidateIgAccount(r.id);
    } catch {
      return { ok: false };
    }
  }
  refresh();
  return { ok: true };
}
