// Client-safe sidebar channel helpers (no DB imports): used by SidebarChannels.tsx in the browser.
export type SidebarChannel = {
  platform: "instagram" | "facebook" | "threads" | "youtube" | string;
  name: string;
  /** "active" or anything else (expired / disconnected) = needs attention. */
  status: string;
  /** Posts waiting to publish on this platform. */
  scheduled: number;
  /** Row id (social_accounts.id, or "yt-" + youtube_channels.id): the /app/channels/[id] page. */
  id?: string;
};

/** Sidebar / channel page link for one connected account. */
export function channelHref(c: Pick<SidebarChannel, "id" | "platform">): string {
  return c.id ? `/app/channels/${encodeURIComponent(c.id)}` : `/app/calendar?view=week&channel=${c.platform}`;
}
