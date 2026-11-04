export function shouldPostFirstComment(format: string, text: string | null): boolean {
  return format !== "story" && Boolean(text?.trim());
}
