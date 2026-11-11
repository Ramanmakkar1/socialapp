// Where an inbox form sends the user back to after it runs: the same filter, layout and selected post.
// Forms post these as hidden fields (return_filter / return_view / return_post); actions merge them into the redirect.

export type InboxReturn = { filter?: string; view?: string; post?: string };

/** The selected-post key the page uses: `${accountId}:${mediaId ?? "none"}`. */
export function postKeyFor(accountId: string, mediaId: string | null): string {
  return `${accountId}:${mediaId ?? "none"}`;
}

const POST_KEY = /^[\w-]{1,64}:[\w.-]{1,64}$/;

/** Sanitized return params from a submitted form (unknown values are dropped). */
export function inboxReturnParams(formData: FormData): Record<string, string> {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const out: Record<string, string> = {};
  // Old forms post the filter as "filter"; keep reading it.
  const filter = get("return_filter") || get("filter");
  if (filter === "unanswered" || filter === "hidden") out.filter = filter;
  if (get("return_view") === "list") out.view = "list";
  const post = get("return_post");
  if (POST_KEY.test(post)) out.post = post;
  return out;
}
