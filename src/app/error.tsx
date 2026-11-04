"use client";

import Link from "next/link";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section role="alert" className="w-full max-w-xl rounded-2xl border border-line bg-surface p-6 text-center shadow-xl sm:p-10">
        <svg aria-hidden="true" viewBox="0 0 320 220" className="mx-auto mb-6 h-auto w-full max-w-[280px]">
          <defs>
            <linearGradient id="site-error-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="var(--brand)" />
              <stop offset="1" stopColor="var(--brand-2)" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="112" r="94" fill="var(--surface-2)" />
          <path d="m52 64 5-12 5 12 12 5-12 5-5 12-5-12-12-5 12-5Zm218 91 4-9 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--brand-2)" />
          <path d="m248 48 4-9 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--brand-2)" />
          <rect x="88" y="58" width="144" height="108" rx="14" fill="var(--surface)" stroke="var(--line)" strokeWidth="3" />
          <rect x="104" y="78" width="72" height="10" rx="5" fill="var(--line)" opacity="0.45" />
          <rect x="104" y="98" width="112" height="8" rx="4" fill="var(--line)" opacity="0.35" />
          <rect x="104" y="114" width="96" height="8" rx="4" fill="var(--line)" opacity="0.35" />
          <rect x="104" y="130" width="64" height="8" rx="4" fill="var(--line)" opacity="0.35" />
          <circle cx="218" cy="118" r="28" fill="url(#site-error-gradient)" />
          <path
            d="M218 102a16 16 0 1 1-11.3 27.3M206 118h24M218 106l8 12-8 12"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Something went wrong</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">This page hit a snag</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-2">
          A temporary problem stopped this page from loading. Try again, or head back home.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface-2 px-6 font-medium hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
          >
            Go to homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface-2 px-6 font-medium hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
          >
            Contact support
          </Link>
        </div>
        {error.digest ? <p className="mt-5 text-xs text-muted">Error reference: {error.digest}</p> : null}
      </section>
    </main>
  );
}
