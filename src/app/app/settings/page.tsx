import { Settings } from "lucide-react";
import EmptyState from "../EmptyState";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Settings</h1><p className="text-sm text-muted">Manage your connected accounts.</p></div>
      <h2 className="mt-6 text-sm font-medium text-ink-2">Connected accounts</h2>
      <EmptyState icon={Settings} title="No connected accounts" text="Your connected Instagram, Facebook and Threads accounts will be listed here. Connecting accounts isn't live yet." phase={1} />
    </>
  );
}
