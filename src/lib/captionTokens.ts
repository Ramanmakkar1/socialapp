// Splits a caption into plain text, links, hashtags and mentions so post previews can colour them
// the way each network does. Pure (shared by the composer preview and tests).

export type CaptionToken = { kind: "text" | "link" | "hashtag" | "mention"; text: string };

const TOKEN_RE = /(https?:\/\/[^\s]+|#[\p{L}\p{N}_]+|@[\p{L}\p{N}_.]*[\p{L}\p{N}_])/gu;

export function captionTokens(text: string): CaptionToken[] {
  const out: CaptionToken[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    // A mention/hashtag must start a word ("me@x.com" is not a mention).
    if (start > 0 && /[\p{L}\p{N}_]/u.test(text[start - 1]) && m[0][0] !== "h") continue;
    let value = m[0];
    let trail = "";
    if (value.startsWith("http")) {
      // Trailing punctuation belongs to the sentence, not the link.
      const t = value.match(/[.,!?;:)\]]+$/);
      if (t) {
        trail = t[0];
        value = value.slice(0, -trail.length);
      }
    }
    if (start > last) out.push({ kind: "text", text: text.slice(last, start) });
    out.push({ kind: value.startsWith("#") ? "hashtag" : value.startsWith("@") ? "mention" : "link", text: value });
    if (trail) out.push({ kind: "text", text: trail });
    last = start + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  // Merge neighbouring text pieces.
  return out.reduce<CaptionToken[]>((acc, t) => {
    const prev = acc[acc.length - 1];
    if (prev && prev.kind === "text" && t.kind === "text") prev.text += t.text;
    else acc.push({ ...t });
    return acc;
  }, []);
}

/** Instagram-style truncation: first `max` characters then "… more". Returns the cut text and whether it was cut. */
export function truncateCaption(text: string, max: number): { text: string; cut: boolean } {
  const chars = Array.from(text);
  if (chars.length <= max) return { text, cut: false };
  return { text: chars.slice(0, max).join("").trimEnd(), cut: true };
}
