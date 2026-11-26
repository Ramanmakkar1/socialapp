// Strips AI-specific wording from FAQ answers when AI is switched off.
export function withoutAiClaims(text: string): string {
  return text
    .replace(/ and AI caption ideas built in/g, " built in")
    .replace(/, AI captions and lead capture/g, " and lead capture");
}
