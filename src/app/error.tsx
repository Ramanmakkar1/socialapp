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
          Something went wrong <em className="s">on this page</em>
        </h1>
        <p className="lede">This page hit a snag. Try again, or head back to the homepage.</p>
        <div className="ctas">
          <button type="button" onClick={reset} className="btn btn-dark" style={{ cursor: "pointer" }}>
            Try again
          </button>
          <Link className="btn btn-line" href="/">Back to homepage</Link>
          <Link className="btn btn-line" href="/pricing">See pricing</Link>
          <Link className="btn btn-line" href="/help">Visit help</Link>
          <Link className="btn btn-line" href="/contact">Contact us</Link>
        </div>
        <PageArt />
      </header>
    </PublicShell>
  );
}
