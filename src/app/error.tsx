"use client";

import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { PageArt } from "@/components/PageArt";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PublicShell>
      <header className="hero" role="alert">
        <p className="eyebrow">A quick pause</p>
        <h1>
          Something went wrong <em className="s">on this page.</em>
        </h1>
        <p className="lede">This page hit a snag. Try again, or head back to the homepage.</p>
        <div className="ctas">
          <button type="button" onClick={reset} className="btn btn-dark" style={{ cursor: "pointer" }}>
            Try again
          </button>
          <Link className="btn btn-line" href="/">Back to homepage</Link>
        </div>
        <p className="small">
          Need a hand?{" "}
          <Link href="/help" style={{ color: "var(--violet)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Visit help
          </Link>
        </p>
        <PageArt />
      </header>
    </PublicShell>
  );
}
