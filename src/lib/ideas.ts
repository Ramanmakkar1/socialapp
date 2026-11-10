// Pure helpers and SQL builders for the ideas board. No React, no DB: safe to unit test.
// The board lets a user save post ideas, tag them, move them across columns and turn one
// into a post in the composer (the idea id is never used as a draft id).

export type IdeaStatus = "unassigned" | "todo" | "in_progress" | "done";

export const IDEA_STATUSES: { value: IdeaStatus; label: string }[] = [
  { value: "unassigned", label: "Unassigned" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export function normalizeIdeaStatus(value: unknown): IdeaStatus {
  return IDEA_STATUSES.some((status) => status.value === value)
    ? (value as IdeaStatus)
    : "unassigned";
}

/** Trim, drop blanks, de-duplicate case-insensitively and cap the length of each tag. */
export function normalizeTags(input: string[] | string | undefined | null): string[] {
  const raw = Array.isArray(input) ? input : typeof input === "string" ? input.split(",") : [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const name = item.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!name) continue;
    const key = name.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(name);
    if (tags.length >= 10) break;
  }
  return tags;
}

/**
 * An empty tag box must never wipe the tags already saved on an idea. Tags are only
 * replaced when the caller sends at least one real tag.
 */
export function shouldReplaceTags(tags: string[] | undefined | null): boolean {
  return Array.isArray(tags) && tags.length > 0;
}

/** Public https media links only, up to 10, stored as `[{ url }]` like scheduled posts. */
export function cleanMediaUrls(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const urls: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    const url = item.trim();
    if (!url || url.length > 2000) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") continue;
    } catch {
      continue;
    }
    if (!urls.includes(url)) urls.push(url);
    if (urls.length >= 10) break;
  }
  return urls;
}

export function ideaMediaItems(urls: string[]): { url: string }[] {
  return urls.map((url) => ({ url }));
}

export type IdeaUpdateInput = {
  ideaId: string;
  userId: string;
  text: string;
  mediaUrls: string[];
  status: IdeaStatus;
};

/**
 * The edit branch of saveIdea. `$2` (the owner id) is part of the WHERE clause so the
 * update is scoped to the signed-in user and Postgres can infer every parameter type.
 */
export function ideaUpdateStatement(input: IdeaUpdateInput): { text: string; params: unknown[] } {
  return {
    text:
      "update socialapp.ideas set text = $3, media = $4::jsonb, status = coalesce($5, status), updated_at = now() where id = $1 and user_id = $2 returning id",
    params: [
      input.ideaId,
      input.userId,
      input.text,
      JSON.stringify(ideaMediaItems(input.mediaUrls)),
      input.status,
    ],
  };
}

export type IdeaInsertInput = {
  userId: string;
  text: string;
  mediaUrls: string[];
  status: IdeaStatus;
};

export function ideaInsertStatement(input: IdeaInsertInput): { text: string; params: unknown[] } {
  return {
    text:
      "insert into socialapp.ideas (user_id, text, media, status) values ($1, $2, $3::jsonb, $4) returning id",
    params: [input.userId, input.text, JSON.stringify(ideaMediaItems(input.mediaUrls)), input.status],
  };
}

// `filter (where t.name is not null)` keeps untagged ideas at `{}` instead of `{NULL}`.
export const IDEAS_LIST_SQL =
  "select i.id, i.text, i.media, i.status, i.created_at, " +
  "coalesce(array_agg(t.name order by t.name) filter (where t.name is not null), '{}') as tags " +
  "from socialapp.ideas i " +
  "left join socialapp.idea_tags it on it.idea_id = i.id " +
  "left join socialapp.tags t on t.id = it.tag_id " +
  "where i.user_id = $1 group by i.id order by i.created_at desc";

export const IDEA_BY_ID_SQL =
  "select i.id, i.text, i.media, i.status, " +
  "coalesce(array_agg(t.name order by t.name) filter (where t.name is not null), '{}') as tags " +
  "from socialapp.ideas i " +
  "left join socialapp.idea_tags it on it.idea_id = i.id " +
  "left join socialapp.tags t on t.id = it.tag_id " +
  "where i.id = $1 and i.user_id = $2 group by i.id";

export type IdeaRow = {
  id: string;
  text: string;
  media: unknown;
  status: string;
  tags: string[];
  created_at?: Date | string;
};

/** Caption + media to pre-fill the composer. The idea id is kept separate from draftId. */
export function ideaComposerPrefill(idea: Pick<IdeaRow, "id" | "text" | "media">): {
  id: string;
  caption: string;
  mediaUrls: string[];
} {
  const media = Array.isArray(idea.media) ? idea.media : [];
  const mediaUrls = media
    .map((item) => (item && typeof item === "object" && "url" in item ? (item as { url?: unknown }).url : undefined))
    .filter((url): url is string => typeof url === "string" && url !== "");
  return { id: idea.id, caption: idea.text ?? "", mediaUrls };
}
