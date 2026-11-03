import { CalendarDays } from "lucide-react";
import EmptyState from "../EmptyState";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Calendar</h1><p className="text-sm text-muted">Plan posts for Instagram, Facebook and Threads.</p></div>
      <EmptyState icon={CalendarDays} title="Your content calendar" text="Plan posts for Instagram, Facebook and Threads. Scheduling isn't live yet." phase={2} />
    </>
  );
}
