import Composer from "./Composer";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Calendar</h1><p className="text-sm text-muted">Plan posts for Instagram, Facebook and Threads.</p></div>
      <Composer />
    </>
  );
}
