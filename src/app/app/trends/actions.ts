"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDbConfigured, query } from "@/lib/db";
import { ideaInsertStatement } from "@/lib/ideas";
import { planForUser } from "@/lib/planLimits";
import { rateLimit } from "@/lib/rateLimit";
import { draftIdeaText, kindOf, parseUsernameList, trendWatchLimit } from "@/lib/trends";
import { refreshWatches } from "@/lib/trendsData";
import { requireWorkspaceUser } from "@/lib/workspace";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AddWatchState = { ok: boolean; message: string } | null;

/** "Add" in the Watched accounts panel: one or more usernames, within the plan's limit. */
export async function addWatchesAction(_prev: AddWatchState, formData: FormData): Promise<AddWatchState> {
  const user = await requireWorkspaceUser();
  if (!isDbConfigured()) return { ok: false, message: "The database isn't configured." };
  const raw = String(formData.get("usernames") ?? "").slice(0, 2000);
  const { valid, invalid } = parseUsernameList(raw);
  if (valid.length === 0) {
    return { ok: false, message: invalid.length ? `"${invalid[0].slice(0, 40)}" isn't a valid Instagram username.` : "Type an Instagram username, like @creators." };
  }
  const plan = await planForUser(user.id);
  const limit = trendWatchLimit(plan);
  try {
    const existing = await query<{ username: string }>("select username from socialapp.trend_watches where user_id=$1", [user.id]);
    const have = new Set(existing.map((r) => r.username));
    const fresh = valid.filter((u) => !have.has(u));
    if (fresh.length === 0) return { ok: false, message: "You're already watching that account." };
    const room = limit - have.size;
    if (room <= 0) {
      return { ok: false, message: `The ${plan} plan can watch ${limit} accounts. Remove one first${plan === "Free" ? ", or upgrade to Pro to watch 50" : ""}.` };
    }
    const toAdd = fresh.slice(0, room);
    await query(
      "insert into socialapp.trend_watches (user_id, username) select $1, unnest($2::text[]) on conflict (user_id, username) do nothing",
      [user.id, toAdd],
    );
    // Read the new accounts right away (they have never been attempted, so they count as stale).
    await refreshWatches(user.id).catch(() => undefined);
    revalidatePath("/app/trends");
    const extra = fresh.length - toAdd.length;
    const notes = [
      extra > 0 ? `${extra} not added: the ${plan} plan watches up to ${limit} accounts.` : "",
      invalid.length ? `Skipped ${invalid.length} invalid ${invalid.length === 1 ? "entry" : "entries"}.` : "",
    ].filter(Boolean);
    return { ok: true, message: [`Added ${toAdd.map((u) => `@${u}`).join(", ")}.`, ...notes].join(" ") };
  } catch {
    return { ok: false, message: "Couldn't add that account. Please try again." };
  }
}

export async function removeWatchAction(formData: FormData): Promise<void> {
  const user = await requireWorkspaceUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id) || !isDbConfigured()) return;
  await query("delete from socialapp.trend_watches where id=$1 and user_id=$2", [id, user.id]);
  revalidatePath("/app/trends");
}

export type RefreshState = { ok: boolean; message: string };

/**
 * Refresh: `force` re-reads every account not read in the last 10 minutes (button);
 * without it only accounts older than 6 hours (automatic refresh when the page is opened).
 */
export async function refreshTrendsAction(force: boolean): Promise<RefreshState> {
  const user = await requireWorkspaceUser();
  if (!isDbConfigured()) return { ok: false, message: "The database isn't configured." };
  if (force) {
    const limited = rateLimit(`trends-refresh:${user.id}`, 6, 60 * 60 * 1000);
    if (!limited.ok) return { ok: false, message: "You've refreshed a lot this hour. Try again a bit later." };
  }
  try {
    const r = await refreshWatches(user.id, { force: force === true });
    if (!r.ok) {
      return {
        ok: false,
        message: r.reason === "busy" ? "Already refreshing. Give it a moment." : "Connect Instagram via Facebook to read watched accounts.",
      };
    }
    revalidatePath("/app/trends");
    if (r.stoppedForRateLimit) return { ok: false, message: "Instagram asked us to slow down. The rest will refresh in a few hours." };
    if (r.refreshed + r.failed === 0) return { ok: true, message: "Everything is up to date." };
    return {
      ok: r.failed === 0,
      message: `Refreshed ${r.refreshed} ${r.refreshed === 1 ? "account" : "accounts"}${r.failed ? `, ${r.failed} couldn't be read` : ""}.`,
    };
  } catch {
    return { ok: false, message: "Refresh failed. Please try again." };
  }
}

/** "Make a post like this": saves an idea that credits the source, then opens it in the composer. */
export async function makePostLikeThisAction(formData: FormData): Promise<void> {
  const user = await requireWorkspaceUser();
  const mediaId = String(formData.get("mediaId") ?? "").slice(0, 64);
  const watchId = String(formData.get("watchUser") ?? "").slice(0, 40);
  if (!mediaId || !isDbConfigured()) redirect("/app/publish?compose=1");
  const rows = await query<{
    username: string;
    media_type: string | null;
    media_product_type: string | null;
    caption: string | null;
    permalink: string | null;
    like_count: number | null;
    comments_count: number;
  }>(
    `select w.username, m.media_type, m.media_product_type, m.caption, m.permalink, m.like_count, m.comments_count
     from socialapp.trend_media m join socialapp.trend_watches w on w.id=m.watch_id
     where w.user_id=$1 and m.media_id=$2 and ($3 = '' or w.username=$3) limit 1`,
    [user.id, mediaId, watchId],
  );
  const row = rows[0];
  if (!row) redirect("/app/publish?compose=1");
  const text = draftIdeaText({
    username: row.username,
    kind: kindOf({ mediaType: row.media_type, productType: row.media_product_type }),
    caption: row.caption,
    permalink: row.permalink,
    likes: row.like_count,
    comments: row.comments_count,
  });
  const st = ideaInsertStatement({ userId: user.id, text, mediaUrls: [], status: "todo" });
  const inserted = await query<{ id: string }>(st.text, st.params);
  const id = inserted[0]?.id;
  redirect(id ? `/app/publish?compose=1&idea=${id}` : "/app/publish?compose=1");
}
