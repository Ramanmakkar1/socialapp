export const THREADS_LIMITS = {
  post: 500,
  bio: 150,
} as const;

export const THREADS_LINK_LIMIT = 5;

export type ThreadsField = keyof typeof THREADS_LIMITS;

export function countThreads(text: string) {
  const chars = Array.from(text).length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  const hashtags = text.match(/#[\p{L}\p{N}_]+/gu)?.length ?? 0;
  const links = text.match(/https?:\/\/\S+/g)?.length ?? 0;
  const remaining = THREADS_LIMITS.post - chars;

  return {
    chars,
    words,
    lines,
    hashtags,
    links,
    remaining,
    over: remaining < 0,
    tooManyLinks: links > THREADS_LINK_LIMIT,
  };
}
