// Shared form validation for things a creator hands out or sells: lead magnets and products.
// Pure (no DB) so it is unit tested and usable from server actions.

export type DeliveryType = "file" | "link";

export type DeliveryFields = {
  title: string;
  description: string;
  coverUrl: string | null;
  deliveryType: DeliveryType;
  deliveryUrl: string;
};

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;

/** Public https URL without credentials, or an error message. */
export function httpsUrlError(value: string, label: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new Error();
    if (value.length > 2000) return `${label} is too long.`;
    return null;
  } catch {
    return `${label} must be a public https:// link.`;
  }
}

function text(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Reads and validates the shared fields. Returns the clean values plus a list of errors. */
export function readDeliveryFields(form: FormData): { values: DeliveryFields; errors: string[] } {
  const errors: string[] = [];
  const title = text(form, "title");
  const description = text(form, "description");
  const coverUrl = text(form, "cover_url") || null;
  const deliveryType: DeliveryType = text(form, "delivery_type") === "file" ? "file" : "link";
  const deliveryUrl = text(form, "delivery_url");
  if (!title) errors.push("Add a title.");
  if (title.length > TITLE_MAX) errors.push(`Keep the title under ${TITLE_MAX} characters.`);
  if (description.length > DESCRIPTION_MAX) errors.push(`Keep the description under ${DESCRIPTION_MAX} characters.`);
  if (coverUrl) {
    const e = httpsUrlError(coverUrl, "Cover image URL");
    if (e) errors.push(e);
  }
  if (!deliveryUrl) {
    errors.push(deliveryType === "file" ? "Add the download URL of your file." : "Add the link to send.");
  } else {
    const e = httpsUrlError(deliveryUrl, deliveryType === "file" ? "Download URL" : "Link");
    if (e) errors.push(e);
  }
  return { values: { title, description, coverUrl, deliveryType, deliveryUrl }, errors };
}

/** Selected auto-DM rule ids from checkboxes named `rule_ids` (uuid-shaped only). */
export function readRuleIds(form: FormData): string[] {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return [...new Set(form.getAll("rule_ids").filter((v): v is string => typeof v === "string" && uuid.test(v)))];
}
