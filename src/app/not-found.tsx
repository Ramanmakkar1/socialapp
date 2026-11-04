import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-line bg-surface p-6 text-center shadow-xl sm:p-10">
        <svg aria-hidden="true" viewBox="0 0 320 220" className="mx-auto mb-6 h-auto w-full max-w-[280px]">
          <defs>
            <linearGradient id="calendar" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="var(--brand)" />
              <stop offset="1" stopColor="var(--brand-2)" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="112" r="94" fill="var(--surface-2)" />
          <path d="m52 64 5-12 5 12 12 5-12 5-5 12-5-12-12-5 12-5Zm218 91 4-9 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--brand-2)" />
          <rect x="91" y="56" width="138" height="132" rx="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="3" />
          <path d="M91 74a18 18 0 0 1 18-18h102a18 18 0 0 1 18 18v22H91V74Z" fill="url(#calendar)" />
          <path d="M123 49v18m74-18v18" stroke="var(--brand-ink, #fff)" strokeWidth="6" strokeLinecap="round" />
          <path d="M113 117h18m14 0h18m14 0h18m-82 25h18m14 0h18m14 0h18" stroke="var(--line)" strokeWidth="8" strokeLinecap="round" />
          <circle cx="122" cy="117" r="5" fill="var(--brand)" />
          <path d="M205 111h48a13 13 0 0 1 13 13v12a13 13 0 0 1-13 13h-17l-12 10v-10h-19a13 13 0 0 1-13-13v-12a13 13 0 0 1 13-13Z" fill="var(--brand-2)" />
          <circle cx="216" cy="130" r="3" fill="white" /><circle cx="231" cy="130" r="3" fill="white" /><circle cx="246" cy="130" r="3" fill="white" />
          <path d="M64 137h37a11 11 0 0 1 11 11v8a11 11 0 0 1-11 11h-9l-10 8v-8h-18a11 11 0 0 1-11-11v-8a11 11 0 0 1 11-11Z" fill="var(--brand)" />
          <circle cx="68" cy="152" r="2.5" fill="white" /><circle cx="80" cy="152" r="2.5" fill="white" /><circle cx="92" cy="152" r="2.5" fill="white" />
        </svg>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">This page wandered off</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-2">The link may be outdated, or this page may have moved. Let’s get you back on track with {BRAND.name}.</p>
        <nav aria-label="Recovery links" className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">Go to homepage</Link>
          <Link href="/help" className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface-2 px-6 font-medium hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">Visit help</Link>
          <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface-2 px-6 font-medium hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">Contact support</Link>
        </nav>
      </section>
    </main>
  );
}
