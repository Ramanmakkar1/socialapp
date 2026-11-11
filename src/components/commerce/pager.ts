// Pure pagination maths for the commerce tables (rows-per-page footer). Unit tested.
export const PER_PAGE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PER_PAGE = 10;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

/** Reads ?page & ?per from search params and clamps them to the row count. */
export function readPaging(params: Record<string, string | string[] | undefined>, total: number) {
  const perRaw = Number(first(params.per));
  const perPage = (PER_PAGE_OPTIONS as readonly number[]).includes(perRaw) ? perRaw : DEFAULT_PER_PAGE;
  const pageRaw = Number(first(params.page));
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Number.isSafeInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, pages) : 1;
  return { page, perPage, pages, offset: (page - 1) * perPage };
}
