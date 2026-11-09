// Shared contact query logic for the /app/contacts page and the /app/contacts/export
// route. Keeping the filters in one place means the CSV export can't drift from the table.

export type ContactFilters = {
  search: string;
  onlyWithEmail: boolean;
  rule: string;
};

export const CONTACT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True when the value is a well-formed UUID (the export route rejects anything else before querying). */
export function isValidRuleId(value: string): boolean {
  return CONTACT_UUID_RE.test(value);
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Reads the contact filter params (q, email, rule) from a searchParams object. */
export function parseContactFilters(params: Record<string, string | string[] | undefined>): ContactFilters {
  return {
    search: firstValue(params.q).trim().slice(0, 100),
    onlyWithEmail: firstValue(params.email) === "1",
    rule: firstValue(params.rule),
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

/**
 * Builds the WHERE clause + params for a contact query, starting from the owner's id.
 * The page appends count/limit/offset; the export route appends its own limit.
 */
export function buildContactQuery(
  userId: string,
  filters: ContactFilters,
): { where: string; params: string[] } {
  const conditions = ["c.user_id = $1"];
  const params: string[] = [userId];
  if (filters.search) {
    const searchParam = `$${params.length + 1}`;
    conditions.push(
      `(c.username ilike ${searchParam} or c.name ilike ${searchParam} or c.email ilike ${searchParam} or c.phone ilike ${searchParam})`,
    );
    params.push(`%${escapeLike(filters.search)}%`);
  }
  if (filters.onlyWithEmail) conditions.push("c.email is not null and c.email <> ''");
  if (filters.rule) {
    conditions.push(`c.source_rule_id = $${params.length + 1}`);
    params.push(filters.rule);
  }
  return { where: conditions.join(" and "), params };
}

/** Converts the old /app/leads search params into a /app/contacts query string. */
export function contactRedirectQuery(params: Record<string, string | string[] | undefined>): string {
  const out = new URLSearchParams();
  for (const key of ["q", "email", "rule", "page"]) {
    const value = firstValue(params[key]);
    if (value) out.set(key, value);
  }
  return out.toString();
}

/** Builds the /app/contacts/export URL from a raw search string such as url.search. */
export function contactExportUrl(search: string): string {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query ? `/app/contacts/export?${query}` : "/app/contacts/export";
}
