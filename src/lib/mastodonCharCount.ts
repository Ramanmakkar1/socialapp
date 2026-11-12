export const MASTODON_DEFAULT_MAX = 500;

/** Mastodon's real counting: each http(s) URL is 23 characters and remote mentions drop the domain. */
export function countMastodon(text: string, max = MASTODON_DEFAULT_MAX) {
  let links = 0;
  let working = text.replace(/https?:\/\/\S+/g, () => {
    links += 1;
    return "x".repeat(23);
  });

  let mentions = 0;
  working = working.replace(/@(\w+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, (_match, user: string) => {
    mentions += 1;
    return `@${user}`;
  });

  const count = Array.from(working).length;
  const remaining = max - count;

  return { count, remaining, over: remaining < 0, links, mentions };
}
