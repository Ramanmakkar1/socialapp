export type TaggedPost = { tags?: string[] | null };

/** Split comma/newline-separated campaign tags, trim them and remove case-insensitive duplicates. */
export function parseTags(input: string | string[] | null | undefined): string[] {
  const values = (Array.isArray(input) ? input : [input ?? []])
    .flatMap((value) => typeof value === "string" ? value.split(/[\n,]/) : []);
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const value of values) {
    const tag = value.trim().replace(/^#+/, "").trim();
    const key = tag.toLocaleLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

export function tagValidationError(tags: string[]): string | null {
  if (tags.length > 10) return "Use up to 10 tags per post.";
  if (tags.some((tag) => tag.length > 50)) return "Each tag must be 50 characters or fewer.";
  return null;
}

export function allPostTags(posts: TaggedPost[]): string[] {
  const tags = new Map<string, string>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      const key = tag.toLocaleLowerCase();
      if (!tags.has(key)) tags.set(key, tag);
    }
  }
  return [...tags.values()].sort((a, b) => a.localeCompare(b));
}

/** An empty filter matches every post; otherwise matching is case-insensitive. */
export function postMatchesTag(post: TaggedPost, selectedTag: string): boolean {
  const tag = selectedTag.trim().toLocaleLowerCase();
  if (!tag) return true;
  return (post.tags ?? []).some((candidate) => candidate.toLocaleLowerCase() === tag);
}

/** Lets callers tolerate installations where a new migration has not run yet. */
export function hasColumn(rows: { exists?: boolean | number | string }[]): boolean {
  return rows.some((row) => {
    const value = row.exists;
    return value === true || value === 1 || value === "1" || value === "t";
  });
}
