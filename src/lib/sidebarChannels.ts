// Server only: the connected channels shown in the app sidebar (Buffer-style channel list).
import { isDbConfigured, query } from "@/lib/db";
import { isExtraNetwork } from "@/lib/networks/tokenNetworks";

import { assignChannelSlugs, channelHref, type SidebarChannel } from "@/lib/sidebarChannelsShared";
export { channelHref, type SidebarChannel };

type AccountRow = { id?: string; platform: string; username: string | null; page_name: string | null; status: string };
type YoutubeRow = { id?: string; title: string; status: string };

type CountRow = { platform: string; n: number };

/** Builds the sidebar list: one row per connected account, with the platform's scheduled-post count. */
export function buildChannels(accounts: AccountRow[], youtube: YoutubeRow[], counts: CountRow[]): SidebarChannel[] {
  const countOf = (p: string) => counts.find((c) => c.platform === p)?.n ?? 0;
  const out: SidebarChannel[] = [];
  for (const a of accounts) {
    // LinkedIn (member name) and Google Business Profile (location title) are names, not handles: no "@" in front of it.
    const name =
      (a.username && (a.platform === "linkedin" || a.platform === "gbp" || a.platform === "fb_group" || isExtraNetwork(a.platform) ? a.username : `@${a.username.replace(/^@/, "")}`)) || a.page_name || a.platform;
    out.push({ platform: a.platform, name, status: a.status, scheduled: countOf(a.platform), ...(a.id ? { id: a.id } : {}) });
  }
  for (const y of youtube) {
    out.push({ platform: "youtube", name: y.title || "YouTube channel", status: y.status, scheduled: countOf("youtube"), ...(y.id ? { id: `yt-${y.id}` } : {}) });
  }
  return assignChannelSlugs(out);
}

export async function getSidebarChannels(userId: string): Promise<SidebarChannel[]> {
  if (!isDbConfigured()) return [];
  let accounts: AccountRow[] = [];
  let youtube: YoutubeRow[] = [];
  let counts: CountRow[] = [];
  try {
    accounts = await query<AccountRow>(
      "select id::text, platform, username, page_name, status from socialapp.social_accounts where user_id=$1 order by created_at limit 25",
      [userId],
    );
  } catch {
    accounts = [];
  }
  try {
    youtube = await query<YoutubeRow>(
      "select id::text, title, status from socialapp.youtube_channels where user_id=$1 order by created_at limit 10",
      [userId],
    );
  } catch {
    youtube = []; // table missing until the YouTube migration runs
  }
  try {
    counts = await query<CountRow>(
      `select t.platform, count(*)::int as n from socialapp.post_targets t
         join socialapp.scheduled_posts p on p.id = t.post_id
        where p.user_id=$1 and p.status='scheduled' group by t.platform`,
      [userId],
    );
  } catch {
    counts = [];
  }
  return buildChannels(accounts, youtube, counts);
}

/** The logged-in user's channel for a readable slug ("instagram-trailandtide"), or null. User-scoped. */
export async function findChannelBySlug(userId: string, slug: string): Promise<SidebarChannel | null> {
  const channels = await getSidebarChannels(userId);
  return channels.find((c) => c.slug === slug) ?? null;
}

/** The slug of one of the user's channels by its id (social_accounts uuid or "yt-" + uuid), or null. */
export async function channelSlugForId(userId: string, id: string): Promise<string | null> {
  const channels = await getSidebarChannels(userId);
  return channels.find((c) => c.id === id)?.slug ?? null;
}
