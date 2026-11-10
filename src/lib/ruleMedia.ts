export type RuleMediaScope = {
  media_ids?: string[] | null;
};

/** Empty media scope means every post; otherwise the webhook must include a selected media id. */
export function ruleMatchesMedia(rule: RuleMediaScope, mediaId: string | null): boolean {
  const mediaIds = rule.media_ids ?? [];
  if (mediaIds.length === 0) return true;
  return mediaId !== null && mediaIds.includes(mediaId);
}

export function isMissingColumnError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "42703";
}
