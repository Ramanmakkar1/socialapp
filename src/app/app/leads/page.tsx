import { Users } from "lucide-react";
import EmptyState from "../EmptyState";

export const metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Leads</h1><p className="text-sm text-muted">Emails and phones collected by your DMs.</p></div>
      <EmptyState icon={Users} title="No leads yet" text="Emails and phones collected by your DMs will show here, exportable to CSV. Lead capture isn't live yet." phase={1} />
    </>
  );
}
