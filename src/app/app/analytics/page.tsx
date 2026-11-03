import { BarChart3 } from "lucide-react";
import EmptyState from "../EmptyState";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Analytics</h1><p className="text-sm text-muted">See how your posts and DMs perform.</p></div>
      <EmptyState icon={BarChart3} title="No analytics yet" text="Post and DM results will show here once analytics is live." phase={3} />
    </>
  );
}
