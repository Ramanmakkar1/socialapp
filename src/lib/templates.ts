import { countChars } from "@/lib/captionLimits";
import { parseTags, tagValidationError } from "@/lib/tagFilter";

export type PostTemplate = {
  id: string;
  name: string;
  caption: string;
  first_comment: string | null;
  tags: string[];
  created_at?: Date | string;
};

export const TEMPLATES_LIST_SQL =
  "select id, name, caption, first_comment, tags, created_at from socialapp.post_templates where user_id = $1 order by created_at desc";

export function templateDeleteResult(rows: unknown[]): { ok: true } | { ok: false; error: string } {
  return rows.length === 0 ? { ok: false, error: "Template not found." } : { ok: true };
}

export function templateValidationError(input: {
  name: string;
  caption: string;
  firstComment?: string;
  tags?: string[];
}): string | null {
  const name = input.name.trim();
  if (!name) return "Give the template a name.";
  if (name.length > 80) return "Template names must be 80 characters or fewer.";
  if (!input.caption.trim()) return "Add a caption before saving a template.";
  if (input.caption.length > 63206) return "The template caption is too long.";
  if (countChars(input.firstComment ?? "") > 2200) return "First comment must be 2,200 characters or fewer.";
  return tagValidationError(parseTags(input.tags));
}
