"use client";

import Link from "next/link";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-line bg-surface p-6 text-center shadow-sm sm:p-8" role="alert">
        <svg aria-hidden="true" viewBox="0 0 180 120" className="mx-auto mb-5 h-28 w-44 max-w-full">
          <defs>
            <linearGradient id="site-error-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="var(--brand)" />
              <stop offset="1" stopColor="var(--brand-2)" />
            </linearGradient>
          </defs>
          <path d="M18 94h144" stroke="var(--line)" strokeWidth="4" strokeLinecap="round" />
          <rect x="27" y="23" width="80" height="60" rx="12" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
          <path d="M43 42h37M43 53h48" stroke="var(--muted)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="124" cy="73" r="24" fill="url(#site-error-gradient)" />
          <path d="M116 73h16m-8-8v16" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <path d="m132 24 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--brand-2)" />
        </svg>
        <p className="text-sm font-semibold text-brand">A quick pause</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Something went wrong on this page</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
          This page hit a snag. Try again, or head back to the homepage.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold">
            Try again
          </button>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-ink hover:bg-surface-2">
            Back to homepage
          </Link>
        </div>
        <p className="mt-5 text-sm text-muted">
          Need a hand? <Link href="/help" className="min-h-11 font-medium text-brand underline-offset-4 hover:underline">Visit help</Link>
        </p>
      </section>
    </main>
  );
}
