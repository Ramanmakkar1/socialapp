export type BlankLineStyle = "invisible" | "dot";

const BRAILLE_BLANK = "\u2800";

export function formatForInstagram(
  text: string,
  options: { blankLine: BlankLineStyle } = { blankLine: "invisible" },
): string {
  if (text.trim() === "") return "";

  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const filler = options.blankLine === "dot" ? "." : BRAILLE_BLANK;

  return normalized
    .split("\n")
    .map((line) => {
      const trimmed = line.replace(/ +$/g, "");
      return trimmed === "" ? filler : trimmed;
    })
    .join("\n");
}

/** Number of lines (split on LF after CRLF normalisation). */
export function countLines(text: string): number {
  if (text === "") return 0;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.split("\n").length;
}

/** True when blank lines or trailing spaces would collapse spacing in the Instagram app. */
export function hasCollapsedSpacing(text: string): boolean {
  if (text === "") return false;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/\n\n/.test(normalized)) return true;
  return normalized.split("\n").some((line) => / $/.test(line));
}
