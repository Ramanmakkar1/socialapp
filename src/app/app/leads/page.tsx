import { redirect } from "next/navigation";
import { contactRedirectQuery } from "@/lib/contactsQuery";

export const metadata = { title: "Contacts" };

// The leads page moved to /app/contacts; keep this URL working with the same filters.
export default async function LeadsRedirectPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = contactRedirectQuery(params);
  redirect(query ? `/app/contacts?${query}` : "/app/contacts");
}
