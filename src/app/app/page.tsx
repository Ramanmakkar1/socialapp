import Link from "next/link";
import { CalendarDays, MessageCircleHeart, Users, BarChart3, Settings, Zap, Plus, Instagram } from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Dashboard" };

const nav = [
  { icon: CalendarDays, label: "Calendar" },
  { icon: MessageCircleHeart, label: "Auto-DM" },
  { icon: Users, label: "Leads" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

// Dashboard shell (UI only). Real data comes in Phase 1-2 (see PROJECT-PLAN.md).
export default function AppHome() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface p-4 md:block">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
          <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg"><Zap className="h-4 w-4" /></span>{BRAND.name}
        </Link>
        <nav className="space-y-1 text-sm">
          {nav.map(({ icon: Icon, label }, i) => (
            <div key={label} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${i === 0 ? "bg-surface-2 font-medium" : "text-ink-2"}`}><Icon className="h-4 w-4" />{label}</div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-semibold">Good morning 👋</h1><p className="text-sm text-muted">Here&apos;s your week.</p></div>
          <button className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"><Plus className="h-4 w-4" />New post</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Scheduled", "0"], ["DMs sent", "0"], ["Leads", "0"], ["Link clicks", "0"]].map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-line bg-surface p-5"><div className="text-sm text-muted">{l}</div><div className="mt-1 text-3xl font-semibold">{v}</div></div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <Instagram className="mx-auto h-8 w-8 text-brand" />
          <h2 className="mt-3 font-semibold">Connect your first account</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">Connect Instagram to schedule posts and turn comments into DMs and leads.</p>
          <button className="btn-primary mt-5 rounded-full px-5 py-2 text-sm font-medium">Connect Instagram</button>
        </div>
      </main>
    </div>
  );
}
