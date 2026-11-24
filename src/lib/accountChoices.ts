// The connected accounts the composer can post to, per network (multi-account targeting).
// Only networks with two or more active accounts need a picker; with one, it is used as before.
// Client-safe (the composer imports it); the database loader is in accountChoicesServer.ts.

export type AccountChoice = { id: string; name: string };
export type AccountChoices = Partial<Record<string, AccountChoice[]>>;

export type SocialAccountChoiceRow = {
  id: string;
  platform: string;
  username: string | null;
  page_name: string | null;
  auth_type: string | null;
  page_id: string | null;
};
export type YouTubeChoiceRow = { id: string; title: string | null };

const HANDLE_NETWORKS = new Set(["instagram", "threads", "tiktok", "x", "bluesky", "mastodon", "pinterest", "ig_personal"]);

function display(row: SocialAccountChoiceRow): string {
  const name = row.username?.trim() || row.page_name?.trim() || row.platform;
  return row.username && HANDLE_NETWORKS.has(row.platform) ? `@${name.replace(/^@/, "")}` : name;
}

/** Rows must be active accounts, oldest first (the order the publisher falls back to). */
export function buildAccountChoices(social: SocialAccountChoiceRow[], youtube: YouTubeChoiceRow[]): AccountChoices {
  const out: AccountChoices = {};
  const add = (platform: string, choice: AccountChoice) => (out[platform] ??= []).push(choice);
  for (const row of social) {
    add(row.platform, { id: row.id, name: display(row) });
    // A Facebook Page is reached through the Instagram (Facebook login) account that holds it.
    if (row.platform === "instagram" && row.auth_type === "facebook_login" && row.page_id) {
      add("facebook", { id: row.id, name: row.page_name?.trim() || "Facebook Page" });
    }
  }
  for (const row of youtube) add("youtube", { id: row.id, name: row.title?.trim() || "YouTube channel" });
  for (const [platform, list] of Object.entries(out)) if (!list || list.length < 2) delete out[platform];
  return out;
}

/** The accounts selected when the composer opens: the saved pick, else the account used today (the first). */
export function initialPicks(choices: AccountChoices, saved: Partial<Record<string, string[]>> | undefined): Record<string, string[]> {
  const picks: Record<string, string[]> = {};
  for (const [platform, list] of Object.entries(choices)) {
    if (!list?.length) continue;
    const valid = (saved?.[platform] ?? []).filter((id) => list.some((c) => c.id === id));
    picks[platform] = valid.length > 0 ? valid : [list[0].id];
  }
  return picks;
}
