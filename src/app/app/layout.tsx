import type { ReactNode } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import SidebarNav from "./SidebarNav";

// Shared dashboard shell (UI only). Real data comes in Phase 1-2 (see PROJECT-PLAN.md).
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface p-4 md:block">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
          <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg"><Zap className="h-4 w-4" /></span>{BRAND.name}
        </Link>
        <SidebarNav />
      </aside>
      <main className="min-w-0 flex-1">
        <div className="border-b border-line bg-surface md:hidden">
          <SidebarNav variant="tabs" />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
