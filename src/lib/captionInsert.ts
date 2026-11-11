// Composer helpers: insert text (emoji, "#") at the caption cursor. Pure, client-safe.

/** A small curated emoji set for the composer picker (no dependency). */
export const COMPOSER_EMOJI = [
  "😀", "😂", "😍", "🥰", "😎", "🤩", "🥳", "😉", "🤔", "🙌",
  "👏", "🙏", "💪", "👉", "👇", "✅", "❌", "⚡", "🔥", "✨",
  "🎉", "💯", "❤️", "💜", "💙", "💚", "⭐", "🌟", "📣", "📌",
  "📸", "🎥", "🎁", "🛒", "💡", "🚀", "📈", "⏰", "🌈", "☕",
] as const;

/**
 * Inserts `insert` into `text` replacing the selection [start, end). A "#" gets a leading space
 * when it would otherwise stick to the previous word. Returns the new text and caret position.
 */
export function insertAtCursor(text: string, start: number, end: number, insert: string): { text: string; caret: number } {
  const s = Math.max(0, Math.min(start, text.length));
  const e = Math.max(s, Math.min(end, text.length));
  const before = text.slice(0, s);
  const piece = insert.startsWith("#") && before !== "" && !/\s$/.test(before) ? ` ${insert}` : insert;
  return { text: before + piece + text.slice(e), caret: s + piece.length };
}
