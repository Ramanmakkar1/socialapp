// Client-safe sidebar channel helpers (no DB imports): used by SidebarChannels.tsx in the browser.
export type SidebarChannel = {
  platform: "instagram" | "facebook" | "threads" | "youtube" | string;
  name: string;
  /** "active" or anything else (expired / disconnected) = needs attention. */
  status: string;
  /** Posts waiting to publish on this platform. */
  scheduled: number;
  /** Row id (social_accounts.id, or "yt-" + youtube_channels.id). */
  id?: string;
  /** Readable URL part of the channel page: /app/channels/instagram-trailandtide (see assignChannelSlugs). */
  slug?: string;
};

/** Lowercase a-z0-9 words joined by "-": "@Trail.And_Tide " → "trail-and-tide". */
export function slugPart(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "instagram" + "@trail.and.tide" → "instagram-trail-and-tide" (no handle → just the network). */
export function channelSlug(platform: string, handle: string | null | undefined): string {
  const p = slugPart(platform) || "channel";
  const h = slugPart(handle ?? "");
  return h ? `${p}-${h}` : p;
}

/**
 * Gives every channel with an id a unique, readable slug (in list order, so the oldest account keeps
 * the plain slug). A later account with the same slug gets the first 4 hex characters of its id:
 * "instagram-trailandtide-2f3a" (longer if even that collides).
 */
export function assignChannelSlugs<T extends { platform: string; name: string; id?: string }>(channels: T[]): (T & { slug?: string })[] {
  const used = new Set<string>();
  return channels.map((c) => {
    if (!c.id) return c;
    const base = channelSlug(c.platform, c.name);
    const hex = c.id.replace(/^yt-/, "").replace(/[^0-9a-f]/gi, "").toLowerCase();
    let slug = base;
    for (let n = 4; used.has(slug); n += 2) slug = `${base}-${n <= hex.length ? hex.slice(0, n) : n}`;
    used.add(slug);
    return { ...c, slug };
  });
}

/** Sidebar / channel page link for one connected account. */
export function channelHref(c: Pick<SidebarChannel, "id" | "platform" | "slug">): string {
  if (c.slug) return `/app/channels/${c.slug}`;
  return c.id ? `/app/channels/${encodeURIComponent(c.id)}` : `/app/publish?view=week&channel=${c.platform}`;
}
