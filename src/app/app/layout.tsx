import type { ReactNode } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "../login/actions";
import SidebarNav from "./SidebarNav";

// Shared dashboard shell. Guests are sent to /login by requireUser().
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface p-4 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
          <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg"><Zap className="h-4 w-4" /></span>{BRAND.name}
        </Link>
        <SidebarNav />
        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate text-sm text-muted" title={user.email}>{user.email}</p>
          <form action={logoutAction}>
            <button type="submit" className="mt-2 text-sm font-medium text-ink-2 hover:underline">Log out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="border-b border-line bg-surface md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <p className="min-w-0 truncate text-sm text-muted">{user.email}</p>
            <form action={logoutAction}>
              <button type="submit" className="text-sm font-medium text-ink-2 hover:underline">Log out</button>
            </form>
          </div>
          <SidebarNav variant="tabs" />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
