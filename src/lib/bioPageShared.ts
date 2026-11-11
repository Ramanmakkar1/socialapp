// Client-safe link-in-bio rules and types. No database or Node imports here, so the
// editor can use the same limits and validation as the server.

export const BIO_HANDLE_RE = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/;
export const BIO_MAX_LINKS = 20;
export const BIO_MAX_LABEL = 60;
export const BIO_MAX_BIO = 280;
export const BIO_MAX_NAME = 60;

// Handles that would shadow a real route or look like a system page.
const RESERVED_HANDLES = new Set([
  "app", "api", "login", "signup", "pricing", "privacy", "terms", "contact",
  "help", "tools", "features", "l", "admin", "support", "about", "blog",
  "instagram-scheduler", "facebook-scheduler", "threads-scheduler",
]);

export type BioTheme = "sunrise" | "mint" | "lilac" | "ink";

export const BIO_THEMES: { id: BioTheme; label: string; bg: string; card: string; ink: string; accent: string }[] = [
  { id: "sunrise", label: "Sunrise", bg: "#fff4e8", card: "#ffffff", ink: "#241a12", accent: "#ff6b35" },
  { id: "mint", label: "Mint", bg: "#e9fbf3", card: "#ffffff", ink: "#0f2a22", accent: "#0f9d76" },
  { id: "lilac", label: "Lilac", bg: "#f2edff", card: "#ffffff", ink: "#211a3a", accent: "#7c5cff" },
  { id: "ink", label: "Ink", bg: "#14121a", card: "#211e2b", ink: "#f7f4ff", accent: "#c6ff4a" },
];

export function themeFor(id: string | null | undefined) {
  return BIO_THEMES.find((t) => t.id === id) ?? BIO_THEMES[0];
}

export type BioLinkInput = { id?: string; label: string; url: string };
export type BioLinkRow = {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  short_code: string | null;
  clicks: number;
};

export type BioPageInput = {
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string | null;
  theme?: string;
  published?: boolean;
  links: BioLinkInput[];
};

export type BioPage = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: string;
  published: boolean;
  links: BioLinkRow[];
};

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@+/, "");
}

export function validateHandle(raw: string): string | null {
  const handle = normalizeHandle(raw);
  if (handle.length < 3) return "Your handle needs at least 3 characters.";
  if (handle.length > 30) return "Your handle can be at most 30 characters.";
  if (!BIO_HANDLE_RE.test(handle)) {
    return "Use lowercase letters, numbers, dots, dashes or underscores. Start and end with a letter or number.";
  }
  if (RESERVED_HANDLES.has(handle)) return "That handle is reserved. Please pick another one.";
  return null;
}

export function validateBioPage(input: BioPageInput): string | null {
  const handleError = validateHandle(input.handle);
  if (handleError) return handleError;
  if (input.displayName.trim().length === 0) return "Add a display name.";
  if (input.displayName.trim().length > BIO_MAX_NAME) return `Keep the display name under ${BIO_MAX_NAME} characters.`;
  if (input.bio.length > BIO_MAX_BIO) return `Keep the bio under ${BIO_MAX_BIO} characters.`;
  if (input.links.length > BIO_MAX_LINKS) return `You can add up to ${BIO_MAX_LINKS} links.`;
  for (const link of input.links) {
    if (link.label.trim().length === 0) return "Every link needs a label.";
    if (link.label.trim().length > BIO_MAX_LABEL) return `Keep link labels under ${BIO_MAX_LABEL} characters.`;
    let parsed: URL;
    try {
      parsed = new URL(link.url.trim());
    } catch {
      return `"${link.label.trim()}" needs a full link starting with https://`;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return `"${link.label.trim()}" needs a full link starting with https://`;
    }
  }
  return null;
}

export type BioLinkPlan = {
  updates: { id: string; label: string; url: string; sortOrder: number; shortCode: string | null; clicks: number }[];
  inserts: { label: string; url: string; sortOrder: number }[];
  deletes: string[];
};

/**
 * Work out how to save the editor's link list without losing click history.
 * A link that keeps its id keeps its short code (and therefore its clicks), even
 * when the label, URL or position changes. Only links the user removed are deleted.
 */
export function planBioLinkChanges(existing: BioLinkRow[], incoming: BioLinkInput[]): BioLinkPlan {
  const byId = new Map(existing.map((row) => [row.id, row]));
  const kept = new Set<string>();
  const updates: BioLinkPlan["updates"] = [];
  const inserts: BioLinkPlan["inserts"] = [];

  incoming.forEach((link, index) => {
    const label = link.label.trim();
    const url = link.url.trim();
    const current = link.id ? byId.get(link.id) : undefined;
    if (current && !kept.has(current.id)) {
      kept.add(current.id);
      updates.push({
        id: current.id,
        label,
        url,
        sortOrder: index,
        shortCode: current.short_code,
        clicks: current.clicks,
      });
    } else {
      inserts.push({ label, url, sortOrder: index });
    }
  });

  const deletes = existing.filter((row) => !kept.has(row.id)).map((row) => row.id);
  return { updates, inserts, deletes };
}

/**
 * Read the handle from the public "/@handle" route param. Next passes dynamic params
 * percent-encoded ("%40brewhouse.coffee"), so decode first; a malformed escape is not a handle.
 * Returns the handle without "@", lowercased, or null when the param is not a bio-page path.
 */
export function bioHandleFromParam(raw: string): string | null {
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (!value.startsWith("@")) return null;
  const handle = value.slice(1).toLowerCase();
  return handle ? handle : null;
}
