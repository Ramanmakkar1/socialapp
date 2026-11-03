import { MessageCircleHeart } from "lucide-react";
import EmptyState from "../EmptyState";

export const metadata = { title: "Auto-DM" };

export default function AutoDmPage() {
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Auto-DM</h1><p className="text-sm text-muted">Send a DM to everyone who comments a keyword.</p></div>
      <EmptyState icon={MessageCircleHeart} title="No automations yet" text="Send a DM to everyone who comments a keyword on your Instagram posts. Automations aren't live yet." phase={1} />
    </>
  );
}
