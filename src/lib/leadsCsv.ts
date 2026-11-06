// Pure CSV builder for the leads export: formula-injection safe, RFC 4180 quoting,
// UTC timestamps plus the owner's local time when a valid IANA time zone is given.

export type LeadRow = {
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  rule_name: string | null;
  created_at: Date | string | null;
};

/** Quotes a field and neutralises spreadsheet formulas (=, +, -, @, tab, CR at the start). */
export function csvField(value: string | null | undefined): string {
  let field = value ?? "";
  if (/^[\s\u0000-\u001F]*[=+\-@]/.test(field) || /^[\t\r]/.test(field)) field = `'${field}`;
  return `"${field.replace(/"/g, '""')}"`;
}

/** Returns the zone if Intl knows it, else null. */
export function validTimeZone(tz: string | null | undefined): string | null {
  if (!tz || tz.length > 64 || !/^[A-Za-z0-9_+\-/]+$/.test(tz)) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return null;
  }
}

/** `YYYY-MM-DD HH:mm:ss` wall time in `tz`. */
export function localTimestamp(at: Date, tz: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function leadsCsv(leads: LeadRow[], timeZone?: string | null): string {
  const tz = validTimeZone(timeZone ?? null);
  const header = ["username", "name", "email", "phone", "rule", "created_at_utc"];
  if (tz) header.push(`created_at_local (${tz})`);
  const rows = leads.map((lead) => {
    const at = lead.created_at ? new Date(lead.created_at) : null;
    const valid = at && !Number.isNaN(at.getTime()) ? at : null;
    const row = [lead.username, lead.name, lead.email, lead.phone, lead.rule_name, valid ? valid.toISOString() : null];
    if (tz) row.push(valid ? localTimestamp(valid, tz) : null);
    return row;
  });
  // BOM so Excel opens UTF-8 (emoji, accents) correctly.
  return "﻿" + [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n") + "\r\n";
}
