// Server only: the connected channels shown in the app sidebar (Buffer-style channel list).
import { isDbConfigured, query } from "@/lib/db";
import { isTokenNetwork } from "@/lib/networks/tokenNetworks";

export type SidebarChannel = {
  platform: "instagram" | "facebook" | "threads" | "youtube" | string;
  name: string;
  /** "active" or anything else (expired / disconnected) = needs attention. */
  status: string;
  /** Posts waiting to publish on this platform. */
  scheduled: number;
};

type AccountRow = { platform: string; username: string | null; page_name: string | null; status: string };
type CountRow = { platform: string; n: number };

/** Builds the sidebar list: one row per connected account, with the platform's scheduled-post count. */
export function buildChannels(accounts: AccountRow[], youtube: { title: string; status: string }[], counts: CountRow[]): SidebarChannel[] {
  const countOf = (p: string) => counts.find((c) => c.platform === p)?.n ?? 0;
  const out: SidebarChannel[] = [];
  for (const a of accounts) {
    // LinkedIn (member name) and Google Business Profile (location title) are names, not handles: no "@" in front of it.
    const name =
      (a.username && (a.platform === "linkedin" || a.platform === "gbp" || a.platform === "fb_group" || isTokenNetwork(a.platform) ? a.username : `@${a.username.replace(/^@/, "")}`)) || a.page_name || a.platform;
    out.push({ platform: a.platform, name, status: a.status, scheduled: countOf(a.platform) });
  }
  for (const y of youtube) {
    out.push({ platform: "youtube", name: y.title || "YouTube channel", status: y.status, scheduled: countOf("youtube") });
  }
  return out;
}

export async function getSidebarChannels(userId: string): Promise<SidebarChannel[]> {
  if (!isDbConfigured()) return [];
  let accounts: AccountRow[] = [];
  let youtube: { title: string; status: string }[] = [];
  let counts: CountRow[] = [];
  try {
    accounts = await query<AccountRow>(
      "select platform, username, page_name, status from socialapp.social_accounts where user_id=$1 order by created_at limit 8",
      [userId],
    );
  } catch {
    accounts = [];
  }
  try {
    youtube = await query<{ title: string; status: string }>(
      "select title, status from socialapp.youtube_channels where user_id=$1 order by created_at limit 4",
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
