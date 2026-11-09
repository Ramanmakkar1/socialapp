import { contactExportUrl } from "@/lib/contactsQuery";

// The CSV export moved to /app/contacts/export; keep this URL working.
export async function GET(request: Request) {
  const url = new URL(request.url);
  return Response.redirect(contactExportUrl(url.search), 308);
}
